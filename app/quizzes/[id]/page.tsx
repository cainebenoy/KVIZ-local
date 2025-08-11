import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function PublicQuizPresentation({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params
  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).eq("status", "published").single()
  if (!quiz) return <div className="p-8 text-center">Quiz not found or not published.</div>
  const { data: questions } = await supabase.from("questions").select("*").eq("quiz_id", id).order("order_number", { ascending: true })
  if (!questions || questions.length === 0) return <div className="p-8 text-center">No questions found.</div>

  // Render static quiz presentation (read-only, no timer)
  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {questions.map((q: any, idx: number) => (
            <div key={q.id} className="mb-8">
              <div className="font-bold mb-2">Question {idx + 1}</div>
              <div className="mb-2 text-lg">
                {q.question_text}
                {q.starred && <span className="ml-2 text-yellow-500" title="Star Question">⭐</span>}
              </div>
              {q.image_url && <img src={q.image_url} alt="Question" className="max-h-48 mb-2 rounded" />}
              <div className="space-y-2">
                {q.options.map((opt: string, oIdx: number) => (
                  <div key={oIdx} className={`p-2 rounded border border-gray-300 ${oIdx === q.correct_index ? 'bg-green-100 border-green-500' : ''}`}>
                    {opt}
                    {oIdx === q.correct_index && <span className="ml-2 text-green-700 font-bold">(Correct)</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
