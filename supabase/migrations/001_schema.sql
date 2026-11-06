create type user_role as enum ('super_admin','editor','auditor','supervisor','user');
create table profiles(id uuid primary key references auth.users on delete cascade, full_name text,
 role user_role not null default 'user', permissions text[] not null default '{}', created_at timestamptz default now());
create table categories(id bigint generated always as identity primary key, name text not null, slug text unique not null);
create table articles(id bigint generated always as identity primary key, title text not null, slug text unique not null,
 excerpt text, content text not null default '', cover_image_url text, category_id bigint references categories(id),
 author_id uuid references profiles(id) default auth.uid(),
 status text not null default 'draft' check (status in ('draft','pending_review','published','rejected')),
 review_note text, is_breaking boolean default false, published_at timestamptz, updated_at timestamptz default now());
create table app_settings(key text primary key, value jsonb not null);
create table device_tokens(token text primary key, user_id uuid references profiles(id) on delete cascade default auth.uid(), platform text);
create index on articles(status, published_at desc);

create function is_super() returns boolean language sql stable security definer as
$$ select exists(select 1 from profiles where id=auth.uid() and role='super_admin') $$;
create function has_perm(p text) returns boolean language sql stable security definer as
$$ select is_super() or exists(select 1 from profiles where id=auth.uid() and p=any(permissions)) $$;

create function new_user() returns trigger language plpgsql security definer as $$
begin insert into profiles(id,full_name,role) values(new.id,new.raw_user_meta_data->>'full_name',
 case when (select count(*) from profiles)=0 then 'super_admin'::user_role else 'user' end); return new; end $$;
create trigger on_signup after insert on auth.users for each row execute function new_user();

-- Only super_admin can publish; everyone else's "published" becomes "pending_review"
create function guard_article() returns trigger language plpgsql security definer as $$
begin new.updated_at=now();
 if not is_super() then
  if new.status='published' then new.status='pending_review'; end if;
  new.review_note=case when tg_op='UPDATE' then old.review_note else null end;
 end if;
 if new.status='published' and new.published_at is null then new.published_at=now(); end if;
 return new; end $$;
create trigger guard before insert or update on articles for each row execute function guard_article();

alter table profiles enable row level security; alter table articles enable row level security;
alter table categories enable row level security; alter table app_settings enable row level security;
alter table device_tokens enable row level security;
create policy p_read on profiles for select using (id=auth.uid() or is_super());
create policy p_write on profiles for update using (is_super());
create policy a_public on articles for select using (status='published' and published_at<=now());
create policy a_staff on articles for select using (has_perm('articles.write') or has_perm('audit.view') or author_id=auth.uid());
create policy a_ins on articles for insert with check (has_perm('articles.write'));
create policy a_upd on articles for update using (is_super() or (has_perm('articles.write') and author_id=auth.uid()));
create policy a_del on articles for delete using (has_perm('articles.delete'));
create policy c_read on categories for select using (true);
create policy c_write on categories for all using (has_perm('categories.manage'));
create policy s_read on app_settings for select using (true);
create policy s_write on app_settings for all using (has_perm('settings.manage'));
create policy d_own on device_tokens for all using (true) with check (true);
insert into storage.buckets(id,name,public) values('media','media',true) on conflict do nothing;
create policy m_read on storage.objects for select using (bucket_id='media');
create policy m_ins on storage.objects for insert with check (bucket_id='media' and has_perm('articles.write'));
