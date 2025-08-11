import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
}

export async function AuthGuard({ children }: AuthGuardProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if the user's email is in the 'admins' table
  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .single()

  if (adminError || !adminData) {
    // User is logged in but not an admin
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-lg text-gray-700">You are not authorized to view this page.</p>
        <p className="mt-2 text-sm text-gray-500">Please contact an administrator if you believe this is an error.</p>
        <form action="/auth/sign-out" method="post" className="mt-6">
          <button type="submit" className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
            Sign Out
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
