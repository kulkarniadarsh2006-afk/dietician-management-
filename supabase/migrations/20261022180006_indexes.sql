-- ==============================================================================
-- Migration: 20261022180006_indexes.sql
-- Description: Performance and referential integrity indexes for primary query
--              patterns, client search, timeline feeds, and foreign key cascades.
-- ==============================================================================

-- 1. Enable pg_trgm for fuzzy substring search if available
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";

-- ==============================================================================
-- Table: clients
-- ==============================================================================

-- Trigram index for fuzzy client name searching (e.g. ILIKE '%smith%')
CREATE INDEX IF NOT EXISTS idx_clients_full_name_trgm 
  ON public.clients USING gin (full_name extensions.gin_trgm_ops);

-- B-tree lower-case index for exact and prefix name queries
CREATE INDEX IF NOT EXISTS idx_clients_lower_full_name 
  ON public.clients (LOWER(full_name));

-- Non-unique index on normalized phone number for clinical search and intake deduplication
CREATE INDEX IF NOT EXISTS idx_clients_phone_e164 
  ON public.clients (phone_e164);

-- Partial unique index on external intake form sync reference to prevent duplicate ingestion
CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_source_external_ref 
  ON public.clients (source, external_ref) 
  WHERE external_ref IS NOT NULL;

-- Foreign key index on created_by profile reference
CREATE INDEX IF NOT EXISTS idx_clients_created_by 
  ON public.clients (created_by);

-- Index on registration timestamp for recent registrations feed
CREATE INDEX IF NOT EXISTS idx_clients_created_at_desc 
  ON public.clients (created_at DESC);


-- ==============================================================================
-- Table: diet_plans
-- ==============================================================================

-- Composite index for fetching client diet plan revision history ordered by recency
CREATE INDEX IF NOT EXISTS idx_diet_plans_client_created_at 
  ON public.diet_plans (client_id, created_at DESC);

-- Foreign key index on uploaded_by profile reference
CREATE INDEX IF NOT EXISTS idx_diet_plans_uploaded_by 
  ON public.diet_plans (uploaded_by);


-- ==============================================================================
-- Table: whatsapp_messages
-- ==============================================================================

-- Composite index for client message timeline audit trail
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_client_created_at 
  ON public.whatsapp_messages (client_id, created_at DESC);

-- Filter index for delivery tracking dashboard (filtering by queued/sent/failed)
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status 
  ON public.whatsapp_messages (status);

-- Foreign key index on diet_plan_id
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_diet_plan_id 
  ON public.whatsapp_messages (diet_plan_id);

-- Foreign key index on retry_of linking historical retry chains
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_retry_of 
  ON public.whatsapp_messages (retry_of);

-- Foreign key index on created_by staff member
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_by 
  ON public.whatsapp_messages (created_by);

-- Index on queued_at timestamp for outbound dispatcher polling
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_queued_at 
  ON public.whatsapp_messages (queued_at) 
  WHERE status = 'queued';


-- ==============================================================================
-- Table: audit_logs
-- ==============================================================================

-- Composite index for entity-specific audit trail lookups (e.g. all client record changes)
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_created_at 
  ON public.audit_logs (target_table, target_id, created_at DESC);

-- Foreign key index on actor_id for staff activity audits
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id 
  ON public.audit_logs (actor_id);

-- Global timeline index for security audit inspection
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at_desc 
  ON public.audit_logs (created_at DESC);
