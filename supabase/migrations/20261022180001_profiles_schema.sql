-- ==============================================================================
-- Migration: 20261022180001_profiles_schema.sql
-- Description: Staff profiles table, auto-provisioning trigger on auth.users,
--              and role escalation prevention.
-- ==============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role public.staff_role NOT NULL DEFAULT 'staff',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Attach updated_at trigger
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Auto-provision profile trigger on auth.users creation
-- Always assigns the least-privileged role ('staff')
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_full_name text;
BEGIN
  -- Extract full name from raw_user_meta_data if provided, default to empty string
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Insert profile with strictly least-privileged role ('staff')
  INSERT INTO public.profiles (id, full_name, role, is_active)
  VALUES (NEW.id, v_full_name, 'staff', true)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Guard against self-role escalation on profiles update
CREATE OR REPLACE FUNCTION public.guard_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_role public.staff_role;
  v_caller_id uuid;
BEGIN
  -- If role or is_active is unchanged, allow normal update
  IF (OLD.role = NEW.role) AND (OLD.is_active = NEW.is_active) THEN
    RETURN NEW;
  END IF;

  -- Allow service-role (direct admin script / backend maintenance)
  IF (auth.jwt() IS NULL) OR (auth.jwt()->>'role' = 'service_role') THEN
    RETURN NEW;
  END IF;

  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated users cannot modify staff profiles';
  END IF;

  -- Query caller's actual role in database
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = v_caller_id AND is_active = true;

  -- Only active 'admin' can change roles or toggle active status
  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Only active administrators can modify staff roles or deactivation status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_guard_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_role_escalation();
