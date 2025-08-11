-- Enable Row Level Security (RLS) for tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policy for admins table:
-- Admins can read and insert their own email (for initial setup)
-- Only authenticated users can interact with this table
CREATE POLICY "Allow authenticated users to read admins"
ON admins FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert their own email into admins"
ON admins FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS Policies for quizzes table:
-- Authenticated users (admins) can create, read, update, delete their own quizzes
-- Public can read published quizzes
CREATE POLICY "Admins can manage their own quizzes"
ON quizzes FOR ALL TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Public can read published quizzes"
ON quizzes FOR SELECT TO anon
USING (status = 'published');

-- RLS Policies for questions table:
-- Authenticated users (admins) can manage questions related to their quizzes
-- Public can read questions related to published quizzes
CREATE POLICY "Admins can manage questions for their quizzes"
ON questions FOR ALL TO authenticated
USING (quiz_id IN (SELECT id FROM quizzes WHERE created_by = auth.uid()))
WITH CHECK (quiz_id IN (SELECT id FROM quizzes WHERE created_by = auth.uid()));

CREATE POLICY "Public can read questions for published quizzes"
ON questions FOR SELECT TO anon
USING (quiz_id IN (SELECT id FROM quizzes WHERE status = 'published'));

-- RLS Policies for leaderboard table:
-- Authenticated users (admins) can manage leaderboard entries
-- Public can read all leaderboard entries
CREATE POLICY "Admins can manage leaderboard entries"
ON leaderboard FOR ALL TO authenticated
USING (true) -- Admins can manage all leaderboard entries, not just their own
WITH CHECK (true);

CREATE POLICY "Public can read leaderboard"
ON leaderboard FOR SELECT TO anon
USING (true);
