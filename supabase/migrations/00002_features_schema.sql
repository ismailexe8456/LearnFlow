-- Add is_admin to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Update handle_new_user to include is_admin and safe date handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  dob_text TEXT;
  dob_val DATE := NULL;
BEGIN
  dob_text := new.raw_user_meta_data->>'date_of_birth';
  IF dob_text IS NOT NULL AND dob_text != '' THEN
    BEGIN
      dob_val := dob_text::DATE;
    EXCEPTION WHEN OTHERS THEN
      dob_val := NULL;
    END;
  END IF;

  INSERT INTO public.profiles (id, full_name, role, date_of_birth, avatar_url, is_kids_mode, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    dob_val,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'is_kids_mode')::BOOLEAN, false),
    COALESCE((new.raw_user_meta_data->>'is_admin')::BOOLEAN, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quizzes viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Teachers can insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update owned quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete owned quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = teacher_id);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of string options e.g. ["A", "B", "C", "D"]
  correct_option_index INTEGER NOT NULL,
  time_limit_secs INTEGER DEFAULT 30 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz questions viewable by everyone" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Teachers can insert questions" ON public.quiz_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND teacher_id = auth.uid())
);

-- Quiz Sessions Table (Live Games)
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL, -- 6 digit PIN
  status TEXT DEFAULT 'waiting' NOT NULL, -- 'waiting', 'active', 'finished'
  current_question_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions viewable by everyone" ON public.quiz_sessions FOR SELECT USING (true);
CREATE POLICY "Host can insert sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Host can update sessions" ON public.quiz_sessions FOR UPDATE USING (true);

-- Quiz Participants Table
CREATE TABLE IF NOT EXISTS public.quiz_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants viewable by everyone" ON public.quiz_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can join session" ON public.quiz_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update score" ON public.quiz_participants FOR UPDATE USING (true);

-- Flashcard Decks Table
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Decks viewable by owner" ON public.flashcard_decks FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can insert own decks" ON public.flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON public.flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON public.flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Flashcards Table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards viewable by deck owner" ON public.flashcards FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Users can insert cards to own deck" ON public.flashcards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete cards from own deck" ON public.flashcards FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
);

-- Documents Table (NotebookLM Notes)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Documents viewable by owner" ON public.documents FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);
