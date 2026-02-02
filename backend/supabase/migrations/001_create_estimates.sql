-- BidSnap: estimates table for storing quotes
-- Run this in Supabase Dashboard → SQL Editor (or via Supabase CLI)

create table if not exists public.estimates (
  id text primary key,
  project_info jsonb not null,
  line_items jsonb not null default '[]',
  totals jsonb not null,
  total_cost_range jsonb not null,
  timeline jsonb not null,
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  assumptions jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: enable RLS (Row Level Security). For backend-only access with service role, RLS can stay off.
-- alter table public.estimates enable row level security;

create index if not exists estimates_created_at_idx on public.estimates (created_at desc);

comment on table public.estimates is 'BidSnap quote/estimate records';
