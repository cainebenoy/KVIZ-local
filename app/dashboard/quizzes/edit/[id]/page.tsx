"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface QuizQuestion {
  id?: string
  question_text: string
  image_url?: string | null
  image?: File | null
  options: string[]
  correct_index: number
  timer_seconds: number
  order_number: number
}

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params?.id as string
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [status, setStatus] = useState("draft")
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      const supabase = createClient()
      const { data: quiz, error: quizError } = await supabase.from("quizzes").select("*").eq("id", quizId).single()
      if (quizError || !quiz) {
        toast({ title: "Error", description: quizError?.message || "Quiz not found." })
        setLoading(false)
        return
      }
      setTitle(quiz.title)
      setDescription(quiz.description)
      setStatus(quiz.status)
      const { data: qs, error: qError } = await supabase.from("questions").select("*").eq("quiz_id", quizId).order("order_number", { ascending: true })
      if (qError) toast({ title: "Error", description: qError.message })
      setQuestions(qs || [])
      setLoading(false)
    }
    if (quizId) fetchQuiz()
  }, [quizId])

  const updateQuestion = (idx: number, field: keyof QuizQuestion, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev]
      updated[qIdx].options[oIdx] = value
      return updated
    })
  }

  const addOption = (qIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev]
      if (updated[qIdx].options.length < 5) updated[qIdx].options.push("")
      return updated
    })
  }

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev]
      if (updated[qIdx].options.length > 2) updated[qIdx].options.splice(oIdx, 1)
      return updated
    })
  }

  const removeQuestion = async (idx: number) => {
    const q = questions[idx]
    if (q.id) {
      const supabase = createClient()
      await supabase.from("questions").delete().eq("id", q.id)
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async (publish: boolean) => {
    const supabase = createClient()
    // Update quiz
    const { error: quizError } = await supabase.from("quizzes").update({
      title,
      description,
      status: publish ? "published" : "draft"
    }).eq("id", quizId)
    if (quizError) {
      toast({ title: "Error", description: quizError.message })
      return
    }
    // Update or insert questions
    for (let i = 0; i < questions.length; i++) {
      let imageUrl = questions[i].image_url || null
      const file = questions[i].image
      if (file) {
        const filePath = `quiz-images/${quizId}/${Date.now()}-${file.name}`
        const { data: imgData, error: imgError } = await supabase.storage.from("images").upload(filePath, file)
        if (imgError) {
          toast({ title: "Image Upload Error", description: imgError.message })
          return
        }
        imageUrl = supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl
      }
      if (questions[i].id) {
        // Update existing question
        const { error: qError } = await supabase.from("questions").update({
          question_text: questions[i].question_text,
          image_url: imageUrl,
          options: questions[i].options,
          correct_index: questions[i].correct_index,
          timer_seconds: questions[i].timer_seconds,
          order_number: i + 1
        }).eq("id", questions[i].id)
        if (qError) {
          toast({ title: "Error", description: qError.message })
          return
        }
      } else {
        // Insert new question
        const { error: qError } = await supabase.from("questions").insert({
          quiz_id: quizId,
          question_text: questions[i].question_text,
          image_url: imageUrl,
          options: questions[i].options,
          correct_index: questions[i].correct_index,
          timer_seconds: questions[i].timer_seconds,
          order_number: i + 1
        })
        if (qError) {
          toast({ title: "Error", description: qError.message })
          return
        }
      }
    }
    toast({ title: publish ? "Quiz Published" : "Quiz Saved as Draft", description: "Quiz updated." })
    router.push("/dashboard/quizzes/manage")
  }

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 flex flex-col items-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Edit Quiz</CardTitle>
          <CardDescription>Update quiz details and questions below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block font-medium mb-1">Quiz Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter quiz title" />
          </div>
          <div>
            <label className="block font-medium mb-1">Quiz Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter quiz description" />
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
            </div>
            {questions.map((q, idx) => (
              <Card key={q.id || idx} className="mb-4">
                <CardHeader>
                  <CardTitle>Question {idx + 1}</CardTitle>
                  <Button onClick={() => removeQuestion(idx)} variant="destructive" size="sm">Delete</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Question Text</label>
                    <Textarea value={q.question_text} onChange={e => updateQuestion(idx, "question_text", e.target.value)} placeholder="Enter question text" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Image (optional)</label>
                    {q.image_url && <img src={q.image_url} alt="Question" className="max-h-32 mb-2 rounded" />}
                    <Input type="file" accept="image/*" onChange={e => updateQuestion(idx, "image", e.target.files?.[0] || null)} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Options</label>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 mb-2">
                        <Input value={opt} onChange={e => handleOptionChange(idx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} className="flex-1" />
                        <Button onClick={() => removeOption(idx, oIdx)} variant="ghost" size="sm" disabled={q.options.length <= 2}>Remove</Button>
                      </div>
                    ))}
                    <Button onClick={() => addOption(idx)} variant="secondary" size="sm" disabled={q.options.length >= 5}>Add Option</Button>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Correct Answer</label>
                    <select value={q.correct_index} onChange={e => updateQuestion(idx, "correct_index", Number(e.target.value))} className="w-full p-2 border rounded">
                      {q.options.map((opt, oIdx) => (
                        <option key={oIdx} value={oIdx}>{opt || `Option ${oIdx + 1}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Timer (seconds)</label>
                    <Input type="number" min={5} max={300} value={q.timer_seconds} onChange={e => updateQuestion(idx, "timer_seconds", Number(e.target.value))} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-4 justify-end">
            <Button onClick={() => handleSave(false)} variant="outline">Save as Draft</Button>
            <Button onClick={() => handleSave(true)} variant="default">Publish Quiz</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
