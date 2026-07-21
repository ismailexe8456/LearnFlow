-- Create enums
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- Create profiles table linked to auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0 NOT NULL,
  coins INTEGER DEFAULT 0 NOT NULL,
  is_kids_mode BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, date_of_birth, avatar_url, is_kids_mode)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    (new.raw_user_meta_data->>'date_of_birth')::DATE,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'is_kids_mode')::BOOLEAN, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Classes table
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classes are viewable by everyone."
  ON classes FOR SELECT USING (true);

CREATE POLICY "Teachers can insert their own classes."
  ON classes FOR INSERT WITH CHECK (auth.uid() = teacher_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

CREATE POLICY "Teachers can update their own classes."
  ON classes FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classes."
  ON classes FOR DELETE USING (auth.uid() = teacher_id);

-- Class members
CREATE TABLE class_members (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (class_id, student_id)
);

ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class members are viewable by participants and teachers."
  ON class_members FOR SELECT 
  USING (
    student_id = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM classes WHERE id = class_id AND teacher_id = auth.uid())
  );

CREATE POLICY "Students can join classes."
  ON class_members FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can remove students or students can leave."
  ON class_members FOR DELETE 
  USING (
    student_id = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM classes WHERE id = class_id AND teacher_id = auth.uid())
  );
