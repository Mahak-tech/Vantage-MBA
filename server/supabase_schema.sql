-- ==============================================================================
-- MyMBA Companion – Complete Supabase PostgreSQL Schema with RLS Policies
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  university TEXT,
  specialization TEXT,
  avatar_url TEXT,
  daily_goal_minutes INT DEFAULT 45,
  today_study_minutes INT DEFAULT 0,
  study_streak INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT 'from-indigo-500 to-purple-600',
  semester TEXT DEFAULT 'Semester 1',
  credit_hours INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  storage_path TEXT,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  extracted_text TEXT,
  page_count INT DEFAULT 1,
  pages JSONB DEFAULT '[]'::jsonb,
  module_name TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('complete', 'short', 'revision', 'exam_oriented')),
  topic TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  deck_title TEXT DEFAULT 'Default Deck',
  topic TEXT,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  status TEXT DEFAULT 'learning' CHECK (status IN ('unlearned', 'learning', 'mastered')),
  ease_factor NUMERIC DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  repetitions INT DEFAULT 0,
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Question Bank Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  topic TEXT,
  type TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  wrong_options_explanation JSONB DEFAULT '{}'::jsonb,
  source_ref TEXT,
  saved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_questions INT NOT NULL,
  score INT NOT NULL,
  percentage NUMERIC NOT NULL,
  time_taken_seconds INT NOT NULL,
  difficulty TEXT,
  topic_breakdown JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT[] DEFAULT '{}',
  questions JSONB DEFAULT '[]'::jsonb,
  user_answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Visual Learning Items Table
CREATE TABLE IF NOT EXISTS visual_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT,
  mode TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Academic Tasks Table
CREATE TABLE IF NOT EXISTS academic_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exam', 'assignment', 'presentation', 'project', 'study_session')),
  due_date TIMESTAMPTZ NOT NULL,
  reminder_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Academic Terms Table (Six Terms)
CREATE TABLE IF NOT EXISTS academic_terms (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  term_number INT NOT NULL CHECK (term_number BETWEEN 1 AND 6),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'completed', 'upcoming', 'archived')),
  credits INT DEFAULT 18,
  gpa NUMERIC(3,2),
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  term_id TEXT REFERENCES academic_terms(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'submitted', 'overdue')),
  estimated_hours NUMERIC DEFAULT 4,
  progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  submitted_files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  term_id TEXT REFERENCES academic_terms(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'teach_me',
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create Policies ensuring users only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own subjects" ON subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own flashcards" ON flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own questions" ON questions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own visual items" ON visual_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own academic tasks" ON academic_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own academic terms" ON academic_terms FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own assignments" ON assignments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
