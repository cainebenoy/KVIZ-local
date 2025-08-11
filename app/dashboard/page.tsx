import { AuthGuard } from "@/components/auth-guard"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-50 p-4 dark:bg-gray-950">
        <header className="flex w-full max-w-4xl items-center justify-between py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        </header>
        <main className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 py-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">Welcome, {user?.email}! You have admin access.</p>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <CardHeader>
                <CardTitle>Manage Quizzes</CardTitle>
                <CardDescription>Create, edit, and publish quizzes.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Link href="/dashboard/quizzes/create"><Button className="mt-2">Create New Quiz</Button></Link>
                <Link href="/dashboard/quizzes/manage"><Button variant="secondary">Manage Quizzes</Button></Link>
                <Link href="/dashboard/quizzes/present"><Button variant="outline">Present Quiz</Button></Link>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <CardHeader>
                <CardTitle>Manage Leaderboard</CardTitle>
                <CardDescription>Add, edit, and delete season winners and scores.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Link href="/dashboard/leaderboard"><Button className="mt-2">Manage Leaderboard</Button></Link>
                <Link href="/leaderboard"><Button variant="secondary">View Public Leaderboard</Button></Link>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>Add or remove admin users.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/admins"><Button className="mt-2">Manage Admins</Button></Link>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <CardHeader>
                <CardTitle>Public Quiz View</CardTitle>
                <CardDescription>Shareable read-only quiz presentation.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quizzes"><Button className="mt-2" variant="outline">View Quizzes (Public)</Button></Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
