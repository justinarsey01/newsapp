alter table articles add column if not exists is_sponsored boolean default false;

create table subscribers(email text primary key, created_at timestamptz default now(), unsubscribed boolean default false);
alter table subscribers enable row level security;
create policy sub_staff on subscribers for select using (has_perm('notifications.send'));
create function public.subscribe(e text) returns void language plpgsql security definer set search_path=public as $$
begin e:=lower(trim(e));
 if length(e)>254 or e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Invalid email'; end if;
 insert into subscribers(email) values(e) on conflict(email) do update set unsubscribed=false; end $$;
create function public.unsubscribe(e text) returns void language sql security definer set search_path=public as
$$ update subscribers set unsubscribed=true where email=lower(trim(e)) $$;

create table comments(id bigint generated always as identity primary key,
 article_id bigint not null references articles(id) on delete cascade,
 user_id uuid not null default auth.uid() references auth.users on delete cascade,
 body text not null check (char_length(trim(body)) between 1 and 1000),
 author_name text, author_avatar text, created_at timestamptz default now());
create index on comments(article_id, created_at desc);
alter table comments enable row level security;
create policy cm_read on comments for select using (true);
create policy cm_ins on comments for insert to authenticated with check (user_id=auth.uid());
create policy cm_del on comments for delete to authenticated using (user_id=auth.uid() or is_super());
create function public.comment_guard() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if (select count(*) from comments where user_id=new.user_id and created_at>now()-interval '1 minute')>=3 then raise exception 'You are commenting too fast'; end if;
 select coalesce(raw_user_meta_data->>'full_name',raw_user_meta_data->>'name','Reader'), raw_user_meta_data->>'avatar_url'
  into new.author_name,new.author_avatar from auth.users where id=new.user_id;
 new.body=trim(new.body); return new; end $$;
create trigger comment_guard before insert on comments for each row execute function public.comment_guard();
