'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Plus, Trash2, CheckCircle, HelpCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function NewQuizPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // AI Generator inputs
  const [aiTopic, setAiTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Questions array
  const [questions, setQuestions] = useState<{
    question: string
    options: string[]
    correct_option_index: number
    time_limit_secs: number
  }[]>([])

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, numQuestions: 5 }),
      })
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
        if (!title) setTitle(`Quiz: ${aiTopic}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: 'New Question?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_option_index: 0,
        time_limit_secs: 30,
      },
    ])
  }

  const handleSaveQuiz = async () => {
    if (!title.trim() || questions.length === 0) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const quizCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        teacher_id: user.id,
        title: title.trim(),
        description: description.trim(),
        code: quizCode,
      })
      .select()
      .single()

    if (quizError || !quiz) return

    // Insert questions
    const questionRows = questions.map((q) => ({
      quiz_id: quiz.id,
      question: q.question,
      options: q.options,
      correct_option_index: q.correct_option_index,
      time_limit_secs: q.time_limit_secs,
    }))

    await supabase.from('quiz_questions').insert(questionRows)

    router.push('/dashboard/quiz')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Kahoot-Style Quiz</h1>
        <p className="text-muted-foreground">Generate questions instantly with Gemini AI or write them manually.</p>
      </div>

      {/* AI Prompt Generator Card */}
      <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" /> AI Question Generator
          </CardTitle>
          <CardDescription>Enter any topic or subject to auto-generate 5 multiple choice questions.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="e.g. World War II History, Solar System, Python Basics..."
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
          />
          <Button
            onClick={handleGenerateAI}
            disabled={isGenerating || !aiTopic.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          >
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </CardContent>
      </Card>

      {/* Main Quiz Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input id="title" placeholder="e.g. Science Midterm Review" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" placeholder="e.g. Covering units 1 through 3" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
          <Button onClick={handleAddQuestion} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Question Manually
          </Button>
        </div>

        {questions.map((q, idx) => (
          <Card key={idx} className="p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-indigo-500">Question #{idx + 1}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-red-500"
                onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={q.question}
              onChange={(e) => {
                const updated = [...questions]
                updated[idx].question = e.target.value
                setQuestions(updated)
              }}
              placeholder="Question text..."
            />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={q.correct_option_index === optIdx}
                    onChange={() => {
                      const updated = [...questions]
                      updated[idx].correct_option_index = optIdx
                      setQuestions(updated)
                    }}
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const updated = [...questions]
                      updated[idx].options[optIdx] = e.target.value
                      setQuestions(updated)
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSaveQuiz}
        disabled={!title.trim() || questions.length === 0}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-bold shadow-lg"
      >
        <CheckCircle className="w-5 h-5 mr-2" /> Save & Create Quiz
      </Button>
    </div>
  )
}
