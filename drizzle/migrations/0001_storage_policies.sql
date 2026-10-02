CREATE POLICY "Book covers are readable by everyone" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'book-covers');
CREATE POLICY "Book files are readable by everyone" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'book-files');
CREATE POLICY "Users read their own avatar" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete their own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
UPDATE public.books SET cover_url = id || '.jpg' WHERE cover_url LIKE 'http%';