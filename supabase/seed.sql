-- ==============================================================================
-- Supabase Local/Development Seed Data
-- ==============================================================================
-- CRITICAL ENVIRONMENT SAFETY NOTICE:
-- This script contains SYNTHETIC TEST DATA ONLY and is intended strictly for
-- local and branch development environments (via 'supabase db reset').
-- DO NOT RUN AGAINST STAGING OR PRODUCTION HEALTHCARE DATABASES.
-- All telephone numbers reside in the fictional +1 555-01xx North American range.
-- All storage paths are simulated placeholders.
-- ==============================================================================

DO $$
BEGIN
  -- 1. Seed Local Test Staff Profile (Requires dummy auth.users entry in local Supabase)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000001',
      'authenticated',
      'authenticated',
      'test.dietitian@example.local',
      crypt('LocalStaffPassword123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dr. Local Practitioner (Seed)"}',
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Ensure profile exists and has dietitian clinical role
  INSERT INTO public.profiles (id, full_name, role, is_active)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Dr. Local Practitioner (Seed)',
    'dietitian',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'dietitian',
    is_active = true;

  -- 2. Seed Synthetic Clients (Fictional +1 555-01xx numbers)
  INSERT INTO public.clients (
    id,
    client_code,
    full_name,
    phone_e164,
    email,
    date_of_birth,
    gender,
    dietary_preferences,
    goals,
    intake_responses,
    whatsapp_consent,
    whatsapp_consent_at,
    source,
    created_by
  ) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'CL-000001',
    'Sample Client 01 (Seed)',
    '+15550101',
    'sample.client01@example.local',
    '1988-04-12',
    'female',
    '{"preferences": ["High Protein", "Gluten-Free"], "allergies": ["Peanuts"]}',
    '{"primary": "Gestational Diabetes Management", "target_calories": 2100}',
    '{"intake_form_version": 1, "activity_level": "moderate"}',
    true,
    now() - interval '14 days',
    'manual',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'CL-000002',
    'Sample Client 02 (Seed)',
    '+15550102',
    'sample.client02@example.local',
    '1992-09-23',
    'male',
    '{"preferences": ["Mediterranean"], "allergies": []}',
    '{"primary": "Cardiovascular Health", "target_calories": 2400}',
    '{"intake_form_version": 1, "activity_level": "high"}',
    true,
    now() - interval '10 days',
    'google_form',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'CL-000003',
    'Sample Client 03 (Seed - No Consent)',
    '+15550103',
    'sample.client03@example.local',
    '1985-01-30',
    'female',
    '{"preferences": ["Low FODMAP"], "allergies": ["Dairy"]}',
    '{"primary": "IBS Symptom Alleviation", "target_calories": 1900}',
    '{"intake_form_version": 1, "activity_level": "sedentary"}',
    false,
    null,
    'manual',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'CL-000004',
    'Sample Client 04 (Seed)',
    '+15550104',
    'sample.client04@example.local',
    '1979-11-15',
    'male',
    '{"preferences": ["Plant-Based"], "allergies": ["Shellfish"]}',
    '{"primary": "Lipid Profile Optimization", "target_calories": 2200}',
    '{"intake_form_version": 1, "activity_level": "moderate"}',
    true,
    now() - interval '2 days',
    'manual',
    '00000000-0000-0000-0000-000000000001'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Seed Synthetic Diet Plans (Placeholder Storage Paths)
  INSERT INTO public.diet_plans (
    id,
    client_id,
    storage_path,
    original_filename,
    mime_type,
    file_size_bytes,
    version,
    title,
    calorie_target,
    macro_ratio,
    uploaded_by
  ) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'clients/10000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000001.pdf',
    'SEED_Gestational_Plan_v1.pdf',
    'application/pdf',
    245760, -- 240 KB
    1,
    'Gestational Nutrition Guidelines - Initial',
    2100,
    '{"proteinPercent": 25, "carbsPercent": 45, "fatPercent": 30}',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'clients/10000000-0000-0000-0000-000000000001/20000000-0000-0000-0000-000000000002.pdf',
    'SEED_Gestational_Plan_v2.pdf',
    'application/pdf',
    312450, -- 305 KB
    2,
    'Gestational Nutrition Guidelines - Trimester 3 Update',
    2200,
    '{"proteinPercent": 25, "carbsPercent": 45, "fatPercent": 30}',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'clients/10000000-0000-0000-0000-000000000002/20000000-0000-0000-0000-000000000003.pdf',
    'SEED_Mediterranean_Cardio_Plan_v1.pdf',
    'application/pdf',
    198400, -- 193 KB
    1,
    'Cardiovascular Mediterranean Prescription',
    2400,
    '{"proteinPercent": 20, "carbsPercent": 50, "fatPercent": 30}',
    '00000000-0000-0000-0000-000000000001'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 4. Seed Synthetic WhatsApp Messages Covering All Delivery Status States
  INSERT INTO public.whatsapp_messages (
    id,
    client_id,
    diet_plan_id,
    destination_e164,
    idempotency_key,
    provider_message_id,
    status,
    attempt_count,
    queued_at,
    sent_at,
    delivered_at,
    read_at,
    failed_at,
    error_code,
    error_message,
    created_by
  ) VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000004',
    NULL,
    '+15550104',
    'SEED-IDEM-00001',
    NULL,
    'queued',
    0,
    now() - interval '5 minutes',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    '+15550102',
    'SEED-IDEM-00002',
    NULL,
    'sending',
    1,
    now() - interval '20 minutes',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '+15550101',
    'SEED-IDEM-00003',
    'wamid.HBgLMTU1NTAxMDEwMRUCMRIGSEED003',
    'sent',
    1,
    now() - interval '3 hours',
    now() - interval '2 hours 59 minutes',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '+15550101',
    'SEED-IDEM-00004',
    'wamid.HBgLMTU1NTAxMDEwMRUCMRIGSEED004',
    'delivered',
    1,
    now() - interval '2 days',
    now() - interval '2 days' + interval '1 minute',
    now() - interval '2 days' + interval '3 minutes',
    NULL,
    NULL,
    NULL,
    NULL,
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    NULL,
    '+15550102',
    'SEED-IDEM-00005',
    'wamid.HBgLMTU1NTAxMDEwMRUCMRIGSEED005',
    'read',
    1,
    now() - interval '5 days',
    now() - interval '5 days' + interval '1 minute',
    now() - interval '5 days' + interval '2 minutes',
    now() - interval '5 days' + interval '15 minutes',
    NULL,
    NULL,
    NULL,
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000004',
    NULL,
    '+15550104',
    'SEED-IDEM-00006',
    NULL,
    'failed',
    1,
    now() - interval '1 day',
    NULL,
    NULL,
    NULL,
    now() - interval '1 day' + interval '5 seconds',
    '131026',
    'Recipient telephone number is unverified or unregistered with WhatsApp Cloud API',
    '00000000-0000-0000-0000-000000000001'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 5. Seed Synthetic Audit Logs (NON-SENSITIVE METADATA ONLY)
  INSERT INTO public.audit_logs (
    id,
    actor_id,
    action,
    target_table,
    target_id,
    metadata,
    created_at
  ) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'insert',
    'clients',
    '10000000-0000-0000-0000-000000000001',
    '{"client_code": "CL-000001", "source": "manual", "consent_recorded": true}',
    now() - interval '14 days'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'insert',
    'diet_plans',
    '20000000-0000-0000-0000-000000000001',
    '{"client_id": "10000000-0000-0000-0000-000000000001", "version": 1, "file_size_bytes": 245760}',
    now() - interval '13 days'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'status_change',
    'whatsapp_messages',
    '30000000-0000-0000-0000-000000000004',
    '{"from_status": "sent", "to_status": "delivered", "attempt_count": 1}',
    now() - interval '2 days'
  )
  ON CONFLICT (id) DO NOTHING;

END $$;
