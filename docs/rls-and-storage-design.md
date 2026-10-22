# Architectural Design Note: Supabase Row Level Security (RLS) & Private Storage

## 1. Overview & Security Model

The Dietitian Management System processes Protected Health Information (PHI) under strict confidentiality requirements. Direct database queries from client-side code are prohibited. All database interactions occur through either:

1. Authenticated client sessions governed by granular **Row Level Security (RLS)** policies.
2. Server-side repositories running under verified user contexts or audited service-role tasks.

---

## 2. Role-Based Access Control (RBAC) Architecture

### Roles Definition

We define three distinct roles mapped in custom claims or a dedicated `user_roles` profile table:

- **`dietitian` (Clinical Administrator / Practitioner)**: Full access to assigned patients, clinical notes, lab markers, dietary prescriptions, and billing.
- **`assistant` (Care Coordinator / Support Staff)**: Access to appointment scheduling, basic demographics, intake form review, and messaging dispatch. **No direct write access to medical diagnoses or clinical prescription alterations.**
- **`patient` (Portal End-User)**: Read-only access to their own profile, assigned diet plan revisions, appointments, and secure messaging threads with their care team. Zero access to internal dietitian clinical notes.

### Intended PostgreSQL RLS Policies (Schema Blueprint)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can view their own profile; Dietitians can view assigned patient profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Patients: Dietitians can access only patients assigned to their clinic/care group
CREATE POLICY "Dietitians access assigned patients"
  ON patients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_team_assignments cta
      WHERE cta.patient_id = patients.id
        AND cta.practitioner_id = auth.uid()
        AND cta.status = 'active'
    )
    OR (auth.jwt() ->> 'role' = 'clinic_admin')
  );

-- 3. Clinical Notes: Patients CANNOT read internal dietitian clinical observations
CREATE POLICY "Strict clinician access to internal notes"
  ON clinical_notes FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' IN ('dietitian', 'clinic_admin')
    AND practitioner_id = auth.uid()
  );

-- 4. Diet Plans: Patients can view finalized plans published to them
CREATE POLICY "Patients view published plans"
  ON diet_plans FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid()
    AND status = 'published'
  );
```

---

## 3. Private Storage Buckets & Signed URLs

All patient files (medical reports, blood chemistry panels, intake photo uploads, body composition assessments, and exported diet PDFs) are stored in private Supabase Storage buckets.

### Bucket Policy

- **No public access**: Buckets are marked `public = false`. Public URL generation is disallowed.
- **Bucket segmentation**:
  - `patient-records-private`: Lab results, clinical scans, provider-to-provider records.
  - `diet-plans-private`: Generated PDF menus and guideline sheets.
  - `intake-attachments-private`: Photos and attachments submitted through intake questionnaires.

### Signed URLs Workflow

1. Direct static links to assets are never rendered in client markup.
2. When a clinician or patient requests access to a file, the server-side API or action validates the caller's session permissions against the associated patient record.
3. Upon authorized validation, the server generates a **time-limited Signed URL** via Supabase Storage API:
   ```typescript
   // Example signed URL generation (Server-side)
   const { data, error } = await supabase.storage
     .from("patient-records-private")
     .createSignedUrl(filePath, 300); // Expires in 5 minutes (300 seconds)
   ```
4. The client receives the temporary URL, which expires automatically, minimizing link-sharing and unauthorized caching.

---

## 4. Audit Trail & Access Logs

Every request touching PHI is timestamped with `practitioner_id`, `patient_id`, `action_type`, and IP address. RLS bypass via `SUPABASE_SERVICE_ROLE_KEY` is strictly constrained to audited background jobs (e.g., automated nightly backups or queue workers) and is forbidden in user-facing request flows.
