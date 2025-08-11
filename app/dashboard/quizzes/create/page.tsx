"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface QuizQuestion {
  question_text: string
  image: File | null
  options: string[]
  correct_index: number
  timer_seconds: number
  starred?: boolean
}

export default function CreateQuizPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [draft, setDraft] = useState(true)
  const { toast } = useToast()

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        image: null,
        options: ["", ""],
        correct_index: 0,
        timer_seconds: 30,
        starred: false,
      },
    ])
  }

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

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (publish: boolean) => {
    const supabase = createClient()
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast({ title: "Error", description: "User not authenticated." })
        return
      }

      // Insert quiz
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title,
          description,
          created_by: user.id,
          status: publish ? "published" : "draft"
        })
        .select()
        .single()
      if (quizError || !quizData) {
        toast({ title: "Error", description: quizError?.message || "Failed to create quiz." })
        return
      }

      // Insert questions
      for (let i = 0; i < questions.length; i++) {
        let imageUrl = null
        const file = questions[i].image
        if (file) {
          const filePath = `quiz-images/${quizData.id}/${Date.now()}-${file.name}`
          const { data: imgData, error: imgError } = await supabase.storage
            .from("images")
            .upload(filePath, file)
          if (imgError) {
            toast({ title: "Image Upload Error", description: imgError.message })
            return
          }
          imageUrl = supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl
        }
        const { error: qError } = await supabase
          .from("questions")
          .insert({
            quiz_id: quizData.id,
            question_text: questions[i].question_text,
            image_url: imageUrl,
            options: questions[i].options,
            correct_index: questions[i].correct_index,
            timer_seconds: questions[i].timer_seconds,
            order_number: i + 1,
            starred: questions[i].starred || false
          })
        if (qError) {
          toast({ title: "Error", description: qError.message })
          return
        }
      }
      toast({
        title: publish ? "Quiz Published" : "Quiz Saved as Draft",
        description: "Quiz and questions saved to Supabase.",
      })
      setDraft(!publish)
      setTitle("")
      setDescription("")
      setQuestions([])
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Unknown error." })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 flex flex-col items-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
          <CardDescription>Fill in the quiz details and questions below.</CardDescription>
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
              <Button onClick={addQuestion} variant="secondary">Add Question</Button>
            </div>
            {questions.map((q, idx) => (
              <Card key={idx} className="mb-4">
                <CardHeader>
                  <CardTitle>Question {idx + 1}</CardTitle>
                  <Button onClick={() => removeQuestion(idx)} variant="destructive" size="sm">Delete</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Question Text</label>
                    <Textarea value={q.question_text} onChange={e => updateQuestion(idx, "question_text", e.target.value)} placeholder="Enter question text" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={!!q.starred} onChange={e => updateQuestion(idx, "starred", e.target.checked)} id={`starred-${idx}`} />
                    <label htmlFor={`starred-${idx}`} className="font-medium cursor-pointer">Star Question ⭐</label>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Image (optional)</label>
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
            <Button onClick={() => handleSubmit(false)} variant="outline">Save as Draft</Button>
            <Button onClick={() => handleSubmit(true)} variant="default">Publish Quiz</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
