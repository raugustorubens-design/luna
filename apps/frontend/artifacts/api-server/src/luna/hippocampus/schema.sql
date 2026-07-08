-- src/luna/hippocampus/schema.sql
--
-- Reference schema for the Hippocampus. This file documents the tables the
-- SupabaseHippocampusStore expects; it is not run automatically (this
-- repository manages its Supabase schema outside of migrations, the same
-- way `memoria_luna` already does).
--
-- Episodic memory reuses `memoria_luna` as-is - no changes to that table.
-- Only the structures that `memoria_luna` cannot represent (versioned
-- concepts and the concept graph) get new tables.

create table if not exists luna_cognitive_concepts (
  id text primary key,
  key text not null,
  memory_type text not null check (memory_type in ('semantic', 'procedural')),
  content jsonb not null,
  version integer not null,
  state text not null check (state in ('ACTIVE', 'DEPRECATED', 'SUPERSEDED')),
  previous_version_id text references luna_cognitive_concepts(id),
  created_at timestamptz not null default now(),
  superseded_at timestamptz
);

create index if not exists luna_cognitive_concepts_key_idx on luna_cognitive_concepts (key);

create table if not exists luna_cognitive_relations (
  id text primary key,
  from_key text not null,
  to_key text not null,
  relation_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists luna_cognitive_relations_from_idx on luna_cognitive_relations (from_key);
create index if not exists luna_cognitive_relations_to_idx on luna_cognitive_relations (to_key);

create table if not exists luna_cognitive_checkpoints (
  id text primary key,
  created_at timestamptz not null default now(),
  cognitive_index_ref text not null,
  concept_refs jsonb not null default '[]',
  metadata jsonb
);
