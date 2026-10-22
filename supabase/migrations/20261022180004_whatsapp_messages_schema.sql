-- ==============================================================================
-- Migration: 20261022180004_whatsapp_messages_schema.sql
-- Description: WhatsApp messages table with idempotent keys, partial unique
--              in-flight dispatch prevention, strict consent enforcement,
--              and a forward-only status transition state machine trigger.
-- ==============================================================================

-- 1. Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  diet_plan_id uuid REFERENCES public.diet_plans(id) ON DELETE RESTRICT,
  destination_e164 text NOT NULL CHECK (destination_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  idempotency_key text NOT NULL UNIQUE,
  provider_message_id text UNIQUE,
  status public.message_status NOT NULL DEFAULT 'queued',
  attempt_count int NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  retry_of uuid REFERENCES public.whatsapp_messages(id) ON DELETE RESTRICT,
  error_code text CHECK (error_code IS NULL OR length(error_code) <= 50),
  error_message text CHECK (error_message IS NULL OR length(error_message) <= 500),
  
  -- Lifecycle transition timestamps (set only once via state machine trigger)
  queued_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,

  -- Authorship and audit timestamps
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Attach updated_at trigger
DROP TRIGGER IF EXISTS trg_whatsapp_messages_updated_at ON public.whatsapp_messages;
CREATE TRIGGER trg_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Partial Unique Index: Prevent duplicate in-flight dispatches
-- Only ONE non-terminal message may exist per client + diet plan at any time
CREATE UNIQUE INDEX IF NOT EXISTS uq_inflight_client_diet_plan_msg
  ON public.whatsapp_messages (client_id, diet_plan_id)
  WHERE status IN ('queued', 'sending', 'sent') AND diet_plan_id IS NOT NULL;

-- 4. Constraint Trigger: Verify client WhatsApp consent prior to insert
CREATE OR REPLACE FUNCTION public.guard_whatsapp_consent_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_consent boolean;
BEGIN
  SELECT whatsapp_consent INTO v_consent
  FROM public.clients
  WHERE id = NEW.client_id;

  IF v_consent IS NOT TRUE THEN
    RAISE EXCEPTION 'Consent Violation: Cannot create WhatsApp message for client % without active WhatsApp consent',
      NEW.client_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_whatsapp_consent_before_insert ON public.whatsapp_messages;
CREATE TRIGGER trg_guard_whatsapp_consent_before_insert
  BEFORE INSERT ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_whatsapp_consent_before_insert();

-- 5. State Machine Transition Guard Trigger
-- Allowed State Transitions:
--   queued   -> sending, failed
--   sending  -> sent, failed
--   sent     -> delivered, failed
--   delivered -> read, failed
--   read     -> [TERMINAL - No transitions allowed]
--   failed   -> [TERMINAL - No transitions allowed]
CREATE OR REPLACE FUNCTION public.guard_whatsapp_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If status is not changing, allow metadata updates (e.g. provider_message_id, attempt_count)
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Terminal states cannot be transitioned away from
  IF OLD.status IN ('read', 'failed') THEN
    RAISE EXCEPTION 'Illegal State Transition: Message % is in terminal status "%" and cannot be modified',
      OLD.id, OLD.status;
  END IF;

  -- Validate specific forward transitions
  CASE OLD.status
    WHEN 'queued' THEN
      IF NEW.status NOT IN ('sending', 'failed') THEN
        RAISE EXCEPTION 'Illegal State Transition: queued -> % is not allowed', NEW.status;
      END IF;

    WHEN 'sending' THEN
      IF NEW.status NOT IN ('sent', 'failed') THEN
        RAISE EXCEPTION 'Illegal State Transition: sending -> % is not allowed', NEW.status;
      END IF;

    WHEN 'sent' THEN
      IF NEW.status NOT IN ('delivered', 'failed') THEN
        RAISE EXCEPTION 'Illegal State Transition: sent -> % is not allowed', NEW.status;
      END IF;

    WHEN 'delivered' THEN
      IF NEW.status NOT IN ('read', 'failed') THEN
        RAISE EXCEPTION 'Illegal State Transition: delivered -> % is not allowed', NEW.status;
      END IF;
  END CASE;

  -- Automatically set and protect corresponding transition timestamps
  IF NEW.status = 'sent' AND OLD.sent_at IS NULL THEN
    NEW.sent_at := COALESCE(NEW.sent_at, clock_timestamp());
  ELSIF NEW.status = 'delivered' AND OLD.delivered_at IS NULL THEN
    NEW.delivered_at := COALESCE(NEW.delivered_at, clock_timestamp());
  ELSIF NEW.status = 'read' AND OLD.read_at IS NULL THEN
    NEW.read_at := COALESCE(NEW.read_at, clock_timestamp());
  ELSIF NEW.status = 'failed' AND OLD.failed_at IS NULL THEN
    NEW.failed_at := COALESCE(NEW.failed_at, clock_timestamp());
  END IF;

  -- Prevent wiping out historical timestamps
  IF OLD.sent_at IS NOT NULL AND NEW.sent_at IS NULL THEN
    NEW.sent_at := OLD.sent_at;
  END IF;
  IF OLD.delivered_at IS NOT NULL AND NEW.delivered_at IS NULL THEN
    NEW.delivered_at := OLD.delivered_at;
  END IF;
  IF OLD.read_at IS NOT NULL AND NEW.read_at IS NULL THEN
    NEW.read_at := OLD.read_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_whatsapp_status_transition ON public.whatsapp_messages;
CREATE TRIGGER trg_guard_whatsapp_status_transition
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_whatsapp_status_transition();
