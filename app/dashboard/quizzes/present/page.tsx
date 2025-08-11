"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuizPresentationPage() {
  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [mode, setMode] = useState<'quiz' | 'answer'>('quiz')
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    // Fetch quiz and questions (demo: first quiz)
    const fetchQuiz = async () => {
      const supabase = createClient()
      const { data: quizList } = await supabase.from("quizzes").select("*").eq("status", "published").limit(1)
      if (quizList && quizList.length > 0) {
        setQuiz(quizList[0])
        const { data: qs } = await supabase.from("questions").select("*").eq("quiz_id", quizList[0].id).order("order_number", { ascending: true })
        setQuestions(qs || [])
        if (qs && qs.length > 0) setTimer(qs[0].timer_seconds)
      }
    }
    fetchQuiz()
  }, [])

  useEffect(() => {
    if (!questions.length) return
    setTimer(questions[current]?.timer_seconds || 30)
    setRunning(false)
  }, [current, questions])

  useEffect(() => {
    if (!running) return
    if (timer <= 0) return
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          // Auto-next when timer ends
          if (current < questions.length - 1) {
            setCurrent(c => c + 1)
            setRunning(true)
          } else {
            setRunning(false)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running, timer, current, questions.length])

  if (!quiz || !questions.length) {
    return <div className="text-center p-8">Loading quiz...</div>
  }

  const q = questions[current]

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex gap-2 mt-2">
            <Button onClick={() => setMode('quiz')} variant={mode === 'quiz' ? 'default' : 'outline'}>Quiz Mode</Button>
            <Button onClick={() => setMode('answer')} variant={mode === 'answer' ? 'default' : 'outline'}>Answer Mode</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">Question {current + 1} of {questions.length}</span>
            <span className="font-mono text-lg">Timer: {timer}s</span>
            <Button onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</Button>
          </div>
          <div className="mb-4">
            <span className="block text-lg font-semibold mb-2">
              {q.question_text}
              {q.starred && <span className="ml-2 text-yellow-500" title="Star Question">⭐</span>}
            </span>
            {q.image_url && <img src={q.image_url} alt="Question" className="max-h-48 mb-2 rounded" />}
          </div>
          <div className="space-y-2">
            {q.options.map((opt: string, idx: number) => (
              <div key={idx} className={`p-2 rounded border ${mode === 'answer' && idx === q.correct_index ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                {opt}
                {mode === 'answer' && idx === q.correct_index && <span className="ml-2 text-green-700 font-bold">(Correct)</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-between mt-8">
            <Button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>Previous</Button>
            <Button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
