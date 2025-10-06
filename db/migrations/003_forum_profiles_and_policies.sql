-- Migration: create profiles table and add RLS policies for forum tables
-- NOTE: Run this migration with a supabase service role key (server-side)

-- Profiles table (link to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY,
  handle text,
  role text DEFAULT 'user', -- possible values: user, moderator, admin, superadmin
  country text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Ensure RLS is enabled for forum-related tables and add policies

-- Threads policies
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT threads
CREATE POLICY threads_select_auth ON threads
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow inserts where the author_id matches the authenticated user
CREATE POLICY threads_insert_auth ON threads
  FOR INSERT WITH CHECK (author_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Allow updates if the user is author or has moderator/admin role
CREATE POLICY threads_update_owner_or_mod ON threads
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
  ) WITH CHECK (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
  );

-- Allow delete only for moderators/admins or the author
CREATE POLICY threads_delete_owner_or_mod ON threads
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
  );

-- Posts policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_select_auth ON posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY posts_insert_auth ON posts FOR INSERT WITH CHECK (author_id = auth.uid() AND auth.uid() IS NOT NULL);
CREATE POLICY posts_update_owner_or_mod ON posts FOR UPDATE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
) WITH CHECK (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
);
CREATE POLICY posts_delete_owner_or_mod ON posts FOR DELETE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
);

-- Comments policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_select_auth ON comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY comments_insert_auth ON comments FOR INSERT WITH CHECK (author_id = auth.uid() AND auth.uid() IS NOT NULL);
CREATE POLICY comments_update_owner_or_mod ON comments FOR UPDATE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
) WITH CHECK (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
);
CREATE POLICY comments_delete_owner_or_mod ON comments FOR DELETE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
);

-- Votes policies (allow authenticated users to insert votes; can update if same user)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY votes_select_auth ON votes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY votes_insert_auth ON votes FOR INSERT WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);
CREATE POLICY votes_update_owner ON votes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY votes_delete_owner_or_mod ON votes FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
);

-- Reports policies (any authenticated user can create a report; moderators can view and act)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_insert_auth ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid() AND auth.uid() IS NOT NULL);
CREATE POLICY reports_select_mod ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
);
CREATE POLICY reports_update_mod ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('moderator','admin','superadmin'))
);

-- Topics & Cities policies: authenticated users can read
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY topics_select_auth ON topics FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY cities_select_auth ON cities FOR SELECT USING (auth.uid() IS NOT NULL);

-- Note: If you want some public read access before paywall date, modify the SELECT policies accordingly.

-- End of migration
