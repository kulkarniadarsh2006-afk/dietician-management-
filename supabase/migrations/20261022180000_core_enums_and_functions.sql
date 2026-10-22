-- ==============================================================================
-- Migration: 20261022180000_core_enums_and_functions.sql
-- Description: Core extensions, global ENUM types, and updated_at trigger helper.
-- Re-runnable: Yes (uses IF NOT EXISTS / DO blocks)
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- 2. Define staff_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
    CREATE TYPE public.staff_role AS ENUM ('admin', 'dietitian', 'staff');
  END IF;
END $$;

-- 3. Define message_status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
    CREATE TYPE public.message_status AS ENUM (
      'queued',
      'sending',
      'sent',
      'delivered',
      'read',
      'failed'
    );
  END IF;
END $$;

-- 4. Define audit_action enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE public.audit_action AS ENUM (
      'insert',
      'update',
      'delete',
      'status_change',
      'export',
      'login'
    );
  END IF;
END $$;

-- 5. Standard set_updated_at trigger function
-- SECURITY DEFINER with empty search_path prevents search_path hijacking vulnerabilities
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$;
