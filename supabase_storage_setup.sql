insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'panfletos',
  'panfletos',
  true,
  52428800,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id)
do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

drop policy if exists "Public read panfletos files" on storage.objects;
drop policy if exists "Admins upload panfletos files" on storage.objects;
drop policy if exists "Admins update panfletos files" on storage.objects;
drop policy if exists "Admins delete panfletos files" on storage.objects;

create policy "Public read panfletos files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'panfletos');

create policy "Admins upload panfletos files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'panfletos'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins update panfletos files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'panfletos'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'panfletos'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins delete panfletos files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'panfletos'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
