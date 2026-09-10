-- PPW article image storage
-- Run this once in Supabase SQL Editor.
-- NEVER put the Supabase secret key in your website.

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;

create policy "PPW public can view article images"
on storage.objects for select to public
using (bucket_id = 'article-images');

create policy "PPW admins can upload article images"
on storage.objects for insert to authenticated
with check (bucket_id = 'article-images');

create policy "PPW admins can update article images"
on storage.objects for update to authenticated
using (bucket_id = 'article-images')
with check (bucket_id = 'article-images');

create policy "PPW admins can delete article images"
on storage.objects for delete to authenticated
using (bucket_id = 'article-images');
