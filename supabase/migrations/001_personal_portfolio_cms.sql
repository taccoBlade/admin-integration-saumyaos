-- Personal Portfolio CMS schema
-- Phase 1/2 approved schema: single-user, AI-assisted portfolio CMS.

create extension if not exists pgcrypto;

create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.content_target_type as enum (
  'site_settings',
  'page',
  'page_section',
  'project',
  'research_entry',
  'photo_spread',
  'archive_item',
  'media_asset',
  'seo_metadata'
);
create type public.media_type as enum ('image', 'video', 'audio', 'pdf', 'spreadsheet', 'archive', 'script', 'document', 'other');
create type public.ai_draft_status as enum ('generated', 'reviewed', 'accepted', 'rejected', 'archived');
create type public.scheduled_publish_status as enum ('pending', 'completed', 'failed', 'cancelled');
create type public.scheduled_publish_action as enum ('publish', 'unpublish', 'archive');
create type public.change_source as enum ('manual', 'ai', 'import', 'rollback', 'scheduled_publish');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.admin_profile (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  avatar_media_id uuid,
  role text not null default 'owner' check (role = 'owner'),
  preferences_json jsonb not null default '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  owner_name text not null,
  headline text,
  tagline text,
  default_description text,
  base_url text not null,
  locale text not null default 'en_US',
  location text,
  availability_status text,
  contact_json jsonb not null default '{}'::jsonb,
  social_links_json jsonb not null default '[]'::jsonb,
  analytics_json jsonb not null default '{}'::jsonb,
  verification_json jsonb not null default '{}'::jsonb,
  structured_data_json jsonb not null default '{}'::jsonb,
  theme_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text,
  file_name text not null,
  mime_type text,
  media_type public.media_type not null default 'other',
  alt_text text,
  caption text,
  credit text,
  width integer,
  height integer,
  duration_seconds numeric,
  file_size_bytes bigint,
  blurhash text,
  dominant_color text,
  metadata_json jsonb not null default '{}'::jsonb,
  status public.publish_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);

alter table public.admin_profile
  add constraint admin_profile_avatar_media_id_fkey
  foreign key (avatar_media_id) references public.media_assets(id) on delete set null;

create table public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  version_label text not null,
  title text not null,
  description text,
  is_current boolean not null default false,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  route text not null unique,
  title text not null,
  page_type text not null,
  summary text,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null,
  title text,
  subtitle text,
  eyebrow text,
  body text,
  cta_json jsonb not null default '{}'::jsonb,
  layout_variant text,
  content_json jsonb not null default '{}'::jsonb,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create table public.taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  taxonomy_type text not null check (taxonomy_type in ('domain', 'technology', 'skill_category', 'tag', 'research_category')),
  description text,
  parent_id uuid references public.taxonomy_terms(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (taxonomy_type, slug)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_title text,
  description text,
  overview text,
  year integer not null,
  domain_term_id uuid references public.taxonomy_terms(id) on delete set null,
  subdomain text,
  status_label text not null default 'Completed',
  complexity_score text,
  timeline_label text,
  start_date date,
  end_date date,
  role text,
  team_size text,
  problem text,
  solution text,
  architecture text,
  implementation text,
  challenges text,
  outcomes text,
  lessons_learned_json jsonb not null default '[]'::jsonb,
  current_status text,
  future_improvements text,
  metrics_json jsonb not null default '[]'::jsonb,
  links_json jsonb not null default '[]'::jsonb,
  hardware_components_json jsonb not null default '[]'::jsonb,
  software_components_json jsonb not null default '[]'::jsonb,
  engineering_concepts_json jsonb not null default '[]'::jsonb,
  research_areas_json jsonb not null default '[]'::jsonb,
  architecture_tree_json jsonb,
  validation_data_json jsonb,
  content_sections_json jsonb not null default '{}'::jsonb,
  source_json jsonb not null default '{}'::jsonb,
  featured boolean not null default true,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  usage_type text not null,
  caption text,
  alt_override text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, media_asset_id, usage_type)
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_term_id uuid references public.taxonomy_terms(id) on delete set null,
  description text,
  base_strength integer not null default 1 check (base_strength between 1 and 10),
  display_strength integer not null default 1 check (display_strength between 1 and 10),
  featured boolean not null default true,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_skills (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  strength_delta integer not null default 0,
  evidence text,
  sort_order integer not null default 0,
  unique (project_id, skill_id)
);

create table public.project_taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  taxonomy_term_id uuid not null references public.taxonomy_terms(id) on delete cascade,
  sort_order integer not null default 0,
  unique (project_id, taxonomy_term_id)
);

create table public.project_relationships (
  id uuid primary key default gen_random_uuid(),
  source_project_id uuid not null references public.projects(id) on delete cascade,
  target_project_id uuid not null references public.projects(id) on delete cascade,
  relationship_type text not null default 'related',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (source_project_id <> target_project_id),
  unique (source_project_id, target_project_id, relationship_type)
);

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  event_type text not null,
  year integer,
  start_date date,
  end_date date,
  location text,
  organization text,
  related_project_id uuid references public.projects(id) on delete set null,
  related_research_entry_id uuid,
  metadata_json jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status public.publish_status not null default 'published',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photo_spreads (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text,
  template text not null,
  diary_entry text,
  description text,
  status public.publish_status not null default 'published',
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photo_spread_items (
  id uuid primary key default gen_random_uuid(),
  photo_spread_id uuid not null references public.photo_spreads(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (photo_spread_id, media_asset_id, sort_order)
);

create table public.research_entries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  abstract text,
  content text,
  content_format text not null default 'markdown' check (content_format in ('markdown', 'html', 'structured')),
  category_term_id uuid references public.taxonomy_terms(id) on delete set null,
  date_label text,
  published_date date,
  author text,
  download_media_id uuid references public.media_assets(id) on delete set null,
  tags_json jsonb not null default '[]'::jsonb,
  status public.publish_status not null default 'published',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.timeline_events
  add constraint timeline_events_related_research_entry_id_fkey
  foreign key (related_research_entry_id) references public.research_entries(id) on delete set null;

create table public.research_entry_projects (
  id uuid primary key default gen_random_uuid(),
  research_entry_id uuid not null references public.research_entries(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  relationship_type text not null default 'documents',
  unique (research_entry_id, project_id, relationship_type)
);

create table public.research_entry_media (
  id uuid primary key default gen_random_uuid(),
  research_entry_id uuid not null references public.research_entries(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  usage_type text not null,
  caption text,
  sort_order integer not null default 0,
  unique (research_entry_id, media_asset_id, usage_type)
);

create table public.archive_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  archive_type text not null,
  date_label text,
  metadata_json jsonb not null default '{}'::jsonb,
  download_enabled boolean not null default false,
  status public.publish_status not null default 'published',
  published_at timestamptz,
  scheduled_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.archive_item_media (
  id uuid primary key default gen_random_uuid(),
  archive_item_id uuid not null references public.archive_items(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  usage_type text not null,
  caption text,
  sort_order integer not null default 0,
  unique (archive_item_id, media_asset_id, usage_type)
);

create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  owner_type public.content_target_type not null,
  owner_id uuid not null,
  meta_title text,
  meta_description text,
  canonical_url text,
  keywords_json jsonb not null default '[]'::jsonb,
  robots text,
  og_title text,
  og_description text,
  og_image_media_id uuid references public.media_assets(id) on delete set null,
  og_type text,
  twitter_card text,
  schema_json jsonb not null default '{}'::jsonb,
  sitemap_priority numeric,
  sitemap_change_frequency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_type, owner_id)
);

create table public.ai_drafts (
  id uuid primary key default gen_random_uuid(),
  target_type public.content_target_type not null,
  target_id uuid,
  draft_title text,
  prompt text not null,
  input_context_json jsonb not null default '{}'::jsonb,
  draft_content_json jsonb not null default '{}'::jsonb,
  model text,
  status public.ai_draft_status not null default 'generated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_generation_history (
  id uuid primary key default gen_random_uuid(),
  ai_draft_id uuid references public.ai_drafts(id) on delete set null,
  target_type public.content_target_type not null,
  target_id uuid,
  operation_type text not null,
  prompt text not null,
  system_context text,
  input_snapshot_json jsonb not null default '{}'::jsonb,
  output_json jsonb not null default '{}'::jsonb,
  model text,
  token_usage_json jsonb not null default '{}'::jsonb,
  cost_estimate numeric,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  target_type public.content_target_type not null,
  target_id uuid not null,
  version_number integer not null,
  snapshot_json jsonb not null,
  change_summary text,
  change_source public.change_source not null default 'manual',
  created_by_user_id uuid references public.admin_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (target_type, target_id, version_number)
);

create table public.rollback_events (
  id uuid primary key default gen_random_uuid(),
  target_type public.content_target_type not null,
  target_id uuid not null,
  from_version_id uuid not null references public.content_versions(id) on delete restrict,
  to_version_id uuid not null references public.content_versions(id) on delete restrict,
  reason text,
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.admin_profile(id) on delete set null,
  actor_label text,
  action text not null,
  target_type public.content_target_type,
  target_id uuid,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.scheduled_publishing (
  id uuid primary key default gen_random_uuid(),
  target_type public.content_target_type not null,
  target_id uuid not null,
  action public.scheduled_publish_action not null,
  scheduled_for timestamptz not null,
  status public.scheduled_publish_status not null default 'pending',
  failure_reason text,
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

create trigger set_updated_at_admin_profile before update on public.admin_profile for each row execute function public.set_updated_at();
create trigger set_updated_at_site_settings before update on public.site_settings for each row execute function public.set_updated_at();
create trigger set_updated_at_media_assets before update on public.media_assets for each row execute function public.set_updated_at();
create trigger set_updated_at_resume_versions before update on public.resume_versions for each row execute function public.set_updated_at();
create trigger set_updated_at_pages before update on public.pages for each row execute function public.set_updated_at();
create trigger set_updated_at_page_sections before update on public.page_sections for each row execute function public.set_updated_at();
create trigger set_updated_at_taxonomy_terms before update on public.taxonomy_terms for each row execute function public.set_updated_at();
create trigger set_updated_at_projects before update on public.projects for each row execute function public.set_updated_at();
create trigger set_updated_at_skills before update on public.skills for each row execute function public.set_updated_at();
create trigger set_updated_at_timeline_events before update on public.timeline_events for each row execute function public.set_updated_at();
create trigger set_updated_at_photo_spreads before update on public.photo_spreads for each row execute function public.set_updated_at();
create trigger set_updated_at_research_entries before update on public.research_entries for each row execute function public.set_updated_at();
create trigger set_updated_at_archive_items before update on public.archive_items for each row execute function public.set_updated_at();
create trigger set_updated_at_seo_metadata before update on public.seo_metadata for each row execute function public.set_updated_at();
create trigger set_updated_at_ai_drafts before update on public.ai_drafts for each row execute function public.set_updated_at();

create index admin_profile_auth_user_id_idx on public.admin_profile(auth_user_id);
create index pages_status_published_at_idx on public.pages(status, published_at);
create index page_sections_page_id_sort_order_idx on public.page_sections(page_id, sort_order);
create index projects_status_published_at_idx on public.projects(status, published_at);
create index projects_featured_sort_order_idx on public.projects(featured, sort_order);
create index projects_domain_term_id_idx on public.projects(domain_term_id);
create index project_media_project_id_sort_order_idx on public.project_media(project_id, sort_order);
create index skills_status_sort_order_idx on public.skills(status, sort_order);
create index project_skills_project_id_idx on public.project_skills(project_id);
create index project_skills_skill_id_idx on public.project_skills(skill_id);
create index taxonomy_terms_type_slug_idx on public.taxonomy_terms(taxonomy_type, slug);
create index project_taxonomy_terms_project_id_idx on public.project_taxonomy_terms(project_id);
create index project_taxonomy_terms_taxonomy_term_id_idx on public.project_taxonomy_terms(taxonomy_term_id);
create index timeline_events_status_year_idx on public.timeline_events(status, year);
create index timeline_events_related_project_id_idx on public.timeline_events(related_project_id);
create index photo_spreads_status_sort_order_idx on public.photo_spreads(status, sort_order);
create index photo_spread_items_spread_sort_order_idx on public.photo_spread_items(photo_spread_id, sort_order);
create index research_entries_status_published_date_idx on public.research_entries(status, published_date);
create index research_entry_projects_project_id_idx on public.research_entry_projects(project_id);
create index archive_items_type_status_idx on public.archive_items(archive_type, status);
create index media_assets_bucket_path_idx on public.media_assets(bucket, path);
create index media_assets_media_type_idx on public.media_assets(media_type);
create index seo_metadata_owner_idx on public.seo_metadata(owner_type, owner_id);
create index ai_drafts_target_idx on public.ai_drafts(target_type, target_id);
create index ai_generation_history_target_idx on public.ai_generation_history(target_type, target_id);
create index content_versions_target_version_idx on public.content_versions(target_type, target_id, version_number);
create index activity_log_target_idx on public.activity_log(target_type, target_id);
create index activity_log_created_at_idx on public.activity_log(created_at);
create index scheduled_publishing_status_scheduled_for_idx on public.scheduled_publishing(status, scheduled_for);

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('images', 'images', true, 10485760),
  ('project-media', 'project-media', true, 52428800),
  ('photography', 'photography', true, 52428800),
  ('documents', 'documents', true, 52428800),
  ('datasets', 'datasets', true, 104857600),
  ('dashboards', 'dashboards', true, 104857600),
  ('audio', 'audio', true, 52428800),
  ('archives', 'archives', true, 104857600),
  ('seo', 'seo', true, 10485760)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

alter table public.admin_profile enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.resume_versions enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.taxonomy_terms enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.skills enable row level security;
alter table public.project_skills enable row level security;
alter table public.project_taxonomy_terms enable row level security;
alter table public.project_relationships enable row level security;
alter table public.timeline_events enable row level security;
alter table public.photo_spreads enable row level security;
alter table public.photo_spread_items enable row level security;
alter table public.research_entries enable row level security;
alter table public.research_entry_projects enable row level security;
alter table public.research_entry_media enable row level security;
alter table public.archive_items enable row level security;
alter table public.archive_item_media enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.ai_drafts enable row level security;
alter table public.ai_generation_history enable row level security;
alter table public.content_versions enable row level security;
alter table public.rollback_events enable row level security;
alter table public.activity_log enable row level security;
alter table public.scheduled_publishing enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profile
    where auth_user_id = auth.uid()
  );
$$;

create policy "public read site settings" on public.site_settings for select using (true);
create policy "public read published media" on public.media_assets for select using (status = 'published');
create policy "public read current resume" on public.resume_versions for select using (status = 'published' and is_current = true);
create policy "public read published pages" on public.pages for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public read published page sections" on public.page_sections for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public read taxonomy" on public.taxonomy_terms for select using (true);
create policy "public read published projects" on public.projects for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public read project media" on public.project_media for select using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published' and (p.published_at is null or p.published_at <= now())));
create policy "public read published skills" on public.skills for select using (status = 'published');
create policy "public read project skills" on public.project_skills for select using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published' and (p.published_at is null or p.published_at <= now())));
create policy "public read project taxonomy" on public.project_taxonomy_terms for select using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published' and (p.published_at is null or p.published_at <= now())));
create policy "public read project relationships" on public.project_relationships for select using (exists (select 1 from public.projects p where p.id = source_project_id and p.status = 'published' and (p.published_at is null or p.published_at <= now())));
create policy "public read timeline" on public.timeline_events for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public read photo spreads" on public.photo_spreads for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public read photo items" on public.photo_spread_items for select using (exists (select 1 from public.photo_spreads s where s.id = photo_spread_id and s.status = 'published' and (s.published_at is null or s.published_at <= now())));
create policy "public read research" on public.research_entries for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public read research projects" on public.research_entry_projects for select using (exists (select 1 from public.research_entries r where r.id = research_entry_id and r.status = 'published' and (r.published_at is null or r.published_at <= now())));
create policy "public read research media" on public.research_entry_media for select using (exists (select 1 from public.research_entries r where r.id = research_entry_id and r.status = 'published' and (r.published_at is null or r.published_at <= now())));
create policy "public read archive" on public.archive_items for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy "public read archive media" on public.archive_item_media for select using (exists (select 1 from public.archive_items a where a.id = archive_item_id and a.status = 'published' and (a.published_at is null or a.published_at <= now())));
create policy "public read seo" on public.seo_metadata for select using (true);

create policy "admin manage admin profile" on public.admin_profile for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage media" on public.media_assets for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage resume" on public.resume_versions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage pages" on public.pages for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage page sections" on public.page_sections for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage taxonomy" on public.taxonomy_terms for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage project media" on public.project_media for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage skills" on public.skills for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage project skills" on public.project_skills for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage project taxonomy" on public.project_taxonomy_terms for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage project relationships" on public.project_relationships for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage timeline" on public.timeline_events for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage photo spreads" on public.photo_spreads for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage photo items" on public.photo_spread_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage research" on public.research_entries for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage research projects" on public.research_entry_projects for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage research media" on public.research_entry_media for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage archive" on public.archive_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage archive media" on public.archive_item_media for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage seo" on public.seo_metadata for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage ai drafts" on public.ai_drafts for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage ai history" on public.ai_generation_history for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage versions" on public.content_versions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage rollbacks" on public.rollback_events for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage activity" on public.activity_log for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage scheduled publishing" on public.scheduled_publishing for all using (public.is_admin()) with check (public.is_admin());

create policy "public read storage objects" on storage.objects
  for select
  using (bucket_id in ('images', 'project-media', 'photography', 'documents', 'datasets', 'dashboards', 'audio', 'archives', 'seo'));

create policy "admin manage storage objects" on storage.objects
  for all
  using (public.is_admin())
  with check (public.is_admin());
