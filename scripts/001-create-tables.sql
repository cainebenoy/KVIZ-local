-- Table: admins
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase auth.users table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft' -- 'draft' or 'published'
);

-- Table: questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  image_url TEXT, -- Optional image link
  options JSONB NOT NULL, -- Array of options, e.g., ['Option A', 'Option B']
  correct_index INT NOT NULL, -- 0-indexed position of the correct option
  timer_seconds INT NOT NULL DEFAULT 30, -- Default timer for this question
  order_number INT NOT NULL, -- Question order in quiz
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: leaderboard
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season TEXT NOT NULL,
  winner_name TEXT NOT NULL,
  winner_photo TEXT, -- Photo URL from Supabase storage
  position INT NOT NULL, -- Rank position (1st, 2nd, 3rd, etc.)
  score TEXT, -- Optional score/description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
