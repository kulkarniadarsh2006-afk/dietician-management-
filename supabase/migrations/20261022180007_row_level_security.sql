-- ==============================================================================
-- Migration: 20261022180007_row_level_security.sql
-- Description: Enable and FORCE Row Level Security (RLS) on all public tables,
--              create security definer RBAC helper functions, and apply default-deny
--              granular role-based policies.
-- ==============================================================================

-- 1. Enable and Force RLS on all tables (FORCE ensures table owners also adhere to policies)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- 2. Security Definer Helper Functions for RBAC
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND is_active = true 
      AND role::text = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.has_role('admin');
$$;

-- Explicitly revoke helper execution from anon/public and grant to authenticated
REVOKE ALL ON FUNCTION public.is_active_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;

REVOKE ALL ON FUNCTION public.has_role(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ==============================================================================
-- Table Policies: profiles
-- ==============================================================================

-- Any active staff member can read staff profiles (needed to render clinician names/roster)
CREATE POLICY "Active staff can view staff profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_active_staff() OR auth.uid() = id);

-- Individual staff can update their own non-privileged details (full_name)
-- Note: Role and is_active changes are independently blocked by database trigger
CREATE POLICY "Staff can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (roles, deactivation)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete staff profiles
CREATE POLICY "Only admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ==============================================================================
-- Table Policies: clients
-- ==============================================================================

-- Active clinical staff can view client records
CREATE POLICY "Active staff can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

-- Active clinical staff can enroll new clients
CREATE POLICY "Active staff can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_staff());

-- Active clinical staff can update client records
CREATE POLICY "Active staff can update clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

-- Only admins can permanently delete client records
CREATE POLICY "Only admins can delete clients"
  ON public.clients FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ==============================================================================
-- Table Policies: diet_plans
-- ==============================================================================

-- Active clinical staff can view diet plans
CREATE POLICY "Active staff can view diet plans"
  ON public.diet_plans FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

-- Active clinical staff can upload/create new diet plan revisions
CREATE POLICY "Active staff can insert diet plans"
  ON public.diet_plans FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_staff());

-- Active clinical staff can update diet plans
CREATE POLICY "Active staff can update diet plans"
  ON public.diet_plans FOR UPDATE
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

-- Only admins can delete diet plans
CREATE POLICY "Only admins can delete diet plans"
  ON public.diet_plans FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ==============================================================================
-- Table Policies: whatsapp_messages
-- ==============================================================================

-- Active staff can view WhatsApp dispatch and delivery history
CREATE POLICY "Active staff can view whatsapp messages"
  ON public.whatsapp_messages FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

-- STRICT SECURITY RULE:
-- No INSERT, UPDATE, or DELETE policies for authenticated users on whatsapp_messages.
-- All message dispatches, idempotency checks, and webhook status updates MUST
-- occur server-side using the service role client.


-- ==============================================================================
-- Table Policies: audit_logs
-- ==============================================================================

-- Only administrators can inspect clinical system audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- STRICT SECURITY RULE:
-- No INSERT, UPDATE, or DELETE policies on audit_logs.
-- Writes are performed exclusively by server-side repositories via service role.
-- Updates and deletes are also physically blocked by the append-only trigger.
