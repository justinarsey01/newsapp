create table push_subscriptions(endpoint text primary key, p256dh text not null, auth text not null, created_at timestamptz default now());
alter table push_subscriptions enable row level security;
create function public.save_push_sub(e text,k text,a text) returns void language plpgsql security definer set search_path=public as $$
begin if e !~ '^https://' or length(e)>700 or length(k)>200 or length(a)>100 then raise exception 'Invalid subscription'; end if;
 insert into push_subscriptions(endpoint,p256dh,auth) values(e,k,a) on conflict(endpoint) do update set p256dh=k,auth=a; end $$;
create function public.remove_push_sub(e text) returns void language sql security definer set search_path=public as
$$ delete from push_subscriptions where endpoint=e $$;
