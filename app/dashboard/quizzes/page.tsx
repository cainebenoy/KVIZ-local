import { redirect } from "next/navigation"

export default function QuizzesPage() {
  // Redirect to quiz creation for now
  redirect("/dashboard/quizzes/create")
  return null
}
