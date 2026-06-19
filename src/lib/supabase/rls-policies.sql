-- Chạy file này trong Supabase SQL Editor
-- Trigger tự tạo profile khi user đăng ký

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, invite_code)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    upper(substr(md5(random()::text), 1, 6))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Gắn trigger vào auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- RLS Policies đầy đủ (chạy sau khi tạo bảng)

-- profiles: đọc profile mình + profile partner
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "read partner profile" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.partner_id = profiles.id
    )
  );

create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- diary_entries: full access data mình
create policy "own diary" on public.diary_entries
  for all using (auth.uid() = user_id);

-- diary_entries: partner chỉ đọc khi is_shared = true
create policy "partner read shared diary" on public.diary_entries
  for select using (
    is_shared = true and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.partner_id = diary_entries.user_id
    )
  );

-- media: full access data mình
create policy "own media" on public.media
  for all using (auth.uid() = user_id);

-- media: partner đọc khi is_in_shared_album hoặc is_in_shared_pool
create policy "partner read shared media" on public.media
  for select using (
    (is_in_shared_album = true or is_in_shared_pool = true) and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.partner_id = media.user_id
    )
  );

-- wishes: chỉ mình truy cập
create policy "own wishes" on public.wishes
  for all using (auth.uid() = user_id);

-- special_dates: chỉ mình truy cập
create policy "own special dates" on public.special_dates
  for all using (auth.uid() = user_id);

-- mood_checkins: full access data mình
create policy "own mood" on public.mood_checkins
  for all using (auth.uid() = user_id);

-- mood_checkins: partner đọc được (hiển thị ở khu chung)
create policy "partner read mood" on public.mood_checkins
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.partner_id = mood_checkins.user_id
    )
  );
