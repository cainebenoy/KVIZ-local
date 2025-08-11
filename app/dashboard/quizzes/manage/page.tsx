"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchQuizzes = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
      if (error) toast({ title: "Error", description: error.message })
      setQuizzes(data || [])
      setLoading(false)
    }
    fetchQuizzes()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return
    const supabase = createClient()
    const { error } = await supabase.from("quizzes").delete().eq("id", id)
    if (error) {
      toast({ title: "Error", description: error.message })
      return
    }
    setQuizzes(qs => qs.filter(q => q.id !== id))
    toast({ title: "Quiz Deleted" })
  }

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 flex flex-col items-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Manage Your Quizzes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quizzes.length === 0 ? (
            <div className="text-center text-gray-500">No quizzes found.</div>
          ) : (
            quizzes.map(quiz => (
              <div key={quiz.id} className="border rounded p-4 mb-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">{quiz.title}</div>
                  <div className="text-sm text-gray-600">{quiz.description}</div>
                  <div className="text-xs text-gray-400">Status: {quiz.status}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/quizzes/edit/${quiz.id}`}><Button variant="secondary">Edit</Button></Link>
                  <Button variant="destructive" onClick={() => handleDelete(quiz.id)}>Delete</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
