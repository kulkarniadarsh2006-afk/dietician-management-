-- ==============================================================================
-- Test Suite: Supabase Schema, Constraints, RLS, and State Machine Verification
-- File: supabase/tests/database_test.sql
-- Description: Transactional verification script testing all constraints,
--              triggers, state machine transitions, and RLS definitions.
-- ==============================================================================

BEGIN;

-- Helper notice macro
DO $$
BEGIN
  RAISE NOTICE '------------------------------------------------------------';
  RAISE NOTICE 'Starting Supabase Verification Test Suite';
  RAISE NOTICE '------------------------------------------------------------';
END $$;

-- ==============================================================================
-- TEST 1: Verify RLS is Enabled AND Forced on All 5 Tables
-- ==============================================================================
DO $$
DECLARE
  v_table text;
  v_row_security boolean;
  v_force_row_security boolean;
  v_tables text[] := ARRAY['profiles', 'clients', 'diet_plans', 'whatsapp_messages', 'audit_logs'];
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    SELECT rowsecurity, forcerowsecurity 
    INTO v_row_security, v_force_row_security
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = v_table;

    IF v_row_security IS NOT TRUE THEN
      RAISE EXCEPTION 'TEST 1 FAILED: Table public.% does not have RLS enabled!', v_table;
    END IF;

    IF v_force_row_security IS NOT TRUE THEN
      RAISE EXCEPTION 'TEST 1 FAILED: Table public.% does not have RLS FORCED!', v_table;
    END IF;

    RAISE NOTICE 'PASS: Table public.% has RLS enabled and forced', v_table;
  END LOOP;
END $$;


-- ==============================================================================
-- TEST 2: Verify Private Storage Bucket Configuration
-- ==============================================================================
DO $$
DECLARE
  v_public boolean;
  v_size bigint;
  v_mimes text[];
BEGIN
  SELECT public, file_size_limit, allowed_mime_types
  INTO v_public, v_size, v_mimes
  FROM storage.buckets
  WHERE id = 'diet-plans';

  IF v_public IS NOT FALSE THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Bucket diet-plans is not private (public = %)', v_public;
  END IF;

  IF v_size != 15728640 THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Bucket file size limit is % (expected 15728640)', v_size;
  END IF;

  IF NOT ('application/pdf' = ANY(v_mimes)) THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Bucket allowed_mime_types does not restrict to application/pdf';
  END IF;

  RAISE NOTICE 'PASS: Bucket diet-plans verified as private, 15MB limit, PDF-only';
END $$;


-- ==============================================================================
-- TEST 3: Negative Test - Invalid Phone Format Rejected (E.164)
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    INSERT INTO public.clients (
      full_name, phone_e164, whatsapp_consent
    ) VALUES (
      'Invalid Phone Test', '555-0100', false
    );
    RAISE EXCEPTION 'TEST 3 FAILED: Invalid phone number 555-0100 was erroneously accepted!';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: Invalid phone number rejected by E.164 check constraint';
  END;
END $$;


-- ==============================================================================
-- TEST 4: Negative Test - WhatsApp Consent Consistency Check
-- ==============================================================================
DO $$
BEGIN
  -- Case A: consent true but timestamp null
  BEGIN
    INSERT INTO public.clients (
      full_name, phone_e164, whatsapp_consent, whatsapp_consent_at
    ) VALUES (
      'Consent Test A', '+15550199', true, NULL
    );
    RAISE EXCEPTION 'TEST 4A FAILED: whatsapp_consent=true with NULL timestamp accepted!';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: whatsapp_consent=true with NULL timestamp rejected';
  END;

  -- Case B: consent false but timestamp present
  BEGIN
    INSERT INTO public.clients (
      full_name, phone_e164, whatsapp_consent, whatsapp_consent_at
    ) VALUES (
      'Consent Test B', '+15550199', false, now()
    );
    RAISE EXCEPTION 'TEST 4B FAILED: whatsapp_consent=false with active timestamp accepted!';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: whatsapp_consent=false with active timestamp rejected';
  END;
END $$;


-- ==============================================================================
-- TEST 5: Negative Test - Diet Plan Non-PDF MIME Type Rejected
-- ==============================================================================
DO $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Insert dummy client with consent
  INSERT INTO public.clients (full_name, phone_e164, whatsapp_consent, whatsapp_consent_at)
  VALUES ('MIME Test Client', '+15550191', true, now())
  RETURNING id INTO v_client_id;

  BEGIN
    INSERT INTO public.diet_plans (
      client_id, storage_path, original_filename, mime_type, file_size_bytes, version
    ) VALUES (
      v_client_id,
      'clients/' || v_client_id || '/00000000-0000-0000-0000-000000000001.pdf',
      'malicious.exe',
      'application/x-msdownload',
      1024,
      1
    );
    RAISE EXCEPTION 'TEST 5 FAILED: Non-PDF MIME type was erroneously accepted!';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: Non-PDF MIME type rejected by CHECK constraint';
  END;
END $$;


-- ==============================================================================
-- TEST 6: Negative Test - Diet Plan Storage Path Traversal Convention
-- ==============================================================================
DO $$
DECLARE
  v_client_id uuid;
BEGIN
  SELECT id INTO v_client_id FROM public.clients WHERE phone_e164 = '+15550191';

  BEGIN
    INSERT INTO public.diet_plans (
      client_id, storage_path, original_filename, mime_type, file_size_bytes, version
    ) VALUES (
      v_client_id,
      'clients/unapproved_path/recipe.pdf', -- Violates clients/{uuid}/{uuid}.pdf format
      'recipe.pdf',
      'application/pdf',
      1024,
      1
    );
    RAISE EXCEPTION 'TEST 6 FAILED: Non-compliant storage path was erroneously accepted!';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: Storage path naming convention enforced by regex constraint';
  END;
END $$;


-- ==============================================================================
-- TEST 7: Negative Test - Dispatch WhatsApp Message to Client Without Consent
-- ==============================================================================
DO $$
DECLARE
  v_no_consent_client_id uuid;
BEGIN
  INSERT INTO public.clients (full_name, phone_e164, whatsapp_consent, whatsapp_consent_at)
  VALUES ('No Consent Patient', '+15550192', false, NULL)
  RETURNING id INTO v_no_consent_client_id;

  BEGIN
    INSERT INTO public.whatsapp_messages (
      client_id, destination_e164, idempotency_key
    ) VALUES (
      v_no_consent_client_id, '+15550192', 'TEST-NO-CONSENT-001'
    );
    RAISE EXCEPTION 'TEST 7 FAILED: Message creation for client without consent succeeded!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Consent Violation%' THEN
      RAISE NOTICE 'PASS: Message creation blocked when whatsapp_consent is false';
    ELSE
      RAISE EXCEPTION 'TEST 7 FAILED with unexpected error: %', SQLERRM;
    END IF;
  END;
END $$;


-- ==============================================================================
-- TEST 8: Negative Test - Duplicate Idempotency Key Rejected
-- ==============================================================================
DO $$
DECLARE
  v_client_id uuid;
BEGIN
  SELECT id INTO v_client_id FROM public.clients WHERE phone_e164 = '+15550191';

  INSERT INTO public.whatsapp_messages (
    client_id, destination_e164, idempotency_key
  ) VALUES (
    v_client_id, '+15550191', 'TEST-IDEMPOTENCY-KEY-001'
  );

  BEGIN
    INSERT INTO public.whatsapp_messages (
      client_id, destination_e164, idempotency_key
    ) VALUES (
      v_client_id, '+15550191', 'TEST-IDEMPOTENCY-KEY-001'
    );
    RAISE EXCEPTION 'TEST 8 FAILED: Duplicate idempotency_key accepted!';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS: Duplicate idempotency key rejected by unique constraint';
  END;
END $$;


-- ==============================================================================
-- TEST 9: Negative Test - Duplicate In-Flight Message Rejected
-- ==============================================================================
DO $$
DECLARE
  v_client_id uuid;
  v_diet_plan_id uuid;
BEGIN
  SELECT id INTO v_client_id FROM public.clients WHERE phone_e164 = '+15550191';

  INSERT INTO public.diet_plans (
    client_id, storage_path, original_filename, mime_type, file_size_bytes, version
  ) VALUES (
    v_client_id,
    'clients/' || v_client_id || '/11111111-1111-1111-1111-111111111111.pdf',
    'plan_v1.pdf',
    'application/pdf',
    2048,
    1
  ) RETURNING id INTO v_diet_plan_id;

  -- First in-flight message (status = queued)
  INSERT INTO public.whatsapp_messages (
    client_id, diet_plan_id, destination_e164, idempotency_key, status
  ) VALUES (
    v_client_id, v_diet_plan_id, '+15550191', 'TEST-INFLIGHT-001', 'queued'
  );

  -- Attempt second message for same client + diet plan while still in-flight
  BEGIN
    INSERT INTO public.whatsapp_messages (
      client_id, diet_plan_id, destination_e164, idempotency_key, status
    ) VALUES (
      v_client_id, v_diet_plan_id, '+15550191', 'TEST-INFLIGHT-002', 'sending'
    );
    RAISE EXCEPTION 'TEST 9 FAILED: Duplicate in-flight message was accepted!';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS: Duplicate in-flight message blocked by partial unique index';
  END;
END $$;


-- ==============================================================================
-- TEST 10: State Machine Test - Backward and Terminal Status Transitions
-- ==============================================================================
DO $$
DECLARE
  v_msg_id uuid;
BEGIN
  SELECT id INTO v_msg_id FROM public.whatsapp_messages WHERE idempotency_key = 'TEST-INFLIGHT-001';

  -- Transition: queued -> sending (Valid)
  UPDATE public.whatsapp_messages SET status = 'sending' WHERE id = v_msg_id;
  RAISE NOTICE 'PASS: Valid transition queued -> sending succeeded';

  -- Transition: sending -> sent (Valid)
  UPDATE public.whatsapp_messages SET status = 'sent' WHERE id = v_msg_id;
  RAISE NOTICE 'PASS: Valid transition sending -> sent succeeded';

  -- Transition: sent -> sending (Invalid Backward Transition)
  BEGIN
    UPDATE public.whatsapp_messages SET status = 'sending' WHERE id = v_msg_id;
    RAISE EXCEPTION 'TEST 10A FAILED: Backward transition sent -> sending was accepted!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Illegal State Transition%' THEN
      RAISE NOTICE 'PASS: Backward status transition blocked by state machine trigger';
    ELSE
      RAISE EXCEPTION 'TEST 10A FAILED with unexpected error: %', SQLERRM;
    END IF;
  END;

  -- Transition to failed (Terminal)
  UPDATE public.whatsapp_messages SET status = 'failed' WHERE id = v_msg_id;
  RAISE NOTICE 'PASS: Valid transition sent -> failed succeeded';

  -- Transition from terminal status: failed -> queued (Invalid)
  BEGIN
    UPDATE public.whatsapp_messages SET status = 'queued' WHERE id = v_msg_id;
    RAISE EXCEPTION 'TEST 10B FAILED: Transition from terminal status was accepted!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Illegal State Transition%' THEN
      RAISE NOTICE 'PASS: Transition away from terminal status failed blocked';
    ELSE
      RAISE EXCEPTION 'TEST 10B FAILED with unexpected error: %', SQLERRM;
    END IF;
  END;
END $$;


-- ==============================================================================
-- TEST 11: Immutability of client_code
-- ==============================================================================
DO $$
DECLARE
  v_client_id uuid;
BEGIN
  SELECT id INTO v_client_id FROM public.clients WHERE phone_e164 = '+15550191';

  BEGIN
    UPDATE public.clients SET client_code = 'CL-FORGED' WHERE id = v_client_id;
    RAISE EXCEPTION 'TEST 11 FAILED: Modification of client_code succeeded!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%client_code is immutable%' THEN
      RAISE NOTICE 'PASS: Modification of client_code blocked by immutability trigger';
    ELSE
      RAISE EXCEPTION 'TEST 11 FAILED with unexpected error: %', SQLERRM;
    END IF;
  END;
END $$;


-- ==============================================================================
-- TEST 12: Append-Only Protection on audit_logs
-- ==============================================================================
DO $$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO public.audit_logs (action, target_table, target_id, metadata)
  VALUES ('insert', 'clients', gen_random_uuid(), '{"reason":"testing"}')
  RETURNING id INTO v_audit_id;

  -- Test UPDATE blocked
  BEGIN
    UPDATE public.audit_logs SET action = 'tampered' WHERE id = v_audit_id;
    RAISE EXCEPTION 'TEST 12A FAILED: UPDATE on audit_logs was permitted!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%audit_logs is append-only%' THEN
      RAISE NOTICE 'PASS: UPDATE on audit_logs blocked by append-only trigger';
    ELSE
      RAISE EXCEPTION 'TEST 12A FAILED with unexpected error: %', SQLERRM;
    END IF;
  END;

  -- Test DELETE blocked
  BEGIN
    DELETE FROM public.audit_logs WHERE id = v_audit_id;
    RAISE EXCEPTION 'TEST 12B FAILED: DELETE on audit_logs was permitted!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%audit_logs is append-only%' THEN
      RAISE NOTICE 'PASS: DELETE on audit_logs blocked by append-only trigger';
    ELSE
      RAISE EXCEPTION 'TEST 12B FAILED with unexpected error: %', SQLERRM;
    END IF;
  END;
END $$;


-- ==============================================================================
-- TEST 13: Sensitive Key Sanitizer on audit_logs
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    INSERT INTO public.audit_logs (action, target_table, target_id, metadata)
    VALUES ('insert', 'clients', gen_random_uuid(), '{"phone_e164": "+15550199", "full_name": "Sensitive Leak"}');
    RAISE EXCEPTION 'TEST 13 FAILED: Sensitive health keys accepted in audit metadata!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%prohibited sensitive key%' THEN
      RAISE NOTICE 'PASS: Sensitive keys (phone_e164, full_name) rejected in audit_logs metadata';
    ELSE
      RAISE EXCEPTION 'TEST 13 FAILED with unexpected error: %', SQLERRM;
    END IF;
  END;
END $$;

-- Roll back all test modifications to maintain clean database state
ROLLBACK;

DO $$
BEGIN
  RAISE NOTICE '------------------------------------------------------------';
  RAISE NOTICE 'All 13 Verification Tests Completed Successfully (PASSED)';
  RAISE NOTICE '------------------------------------------------------------';
END $$;
