"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAdmins = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: true })
      if (error) toast({ title: "Error", description: error.message })
      setAdmins(data || [])
      setLoading(false)
    }
    fetchAdmins()
  }, [])

  const handleAdd = async () => {
    if (!email) return
    const supabase = createClient()
    const { error } = await supabase.from("admins").insert({ email })
    if (error) {
      toast({ title: "Error", description: error.message })
      return
    }
    setAdmins(a => [...a, { email }])
    setEmail("")
    toast({ title: "Admin Added" })
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return
    const supabase = createClient()
    const { error } = await supabase.from("admins").delete().eq("id", id)
    if (error) {
      toast({ title: "Error", description: error.message })
      return
    }
    setAdmins(a => a.filter(admin => admin.id !== id))
    toast({ title: "Admin Removed" })
  }

  if (loading) return <div className="p-8 text-center">Loading admins...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 flex flex-col items-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Manage Admins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email address" />
            <Button onClick={handleAdd} variant="default">Add Admin</Button>
          </div>
          {admins.length === 0 ? (
            <div className="text-center text-gray-500">No admins found.</div>
          ) : (
            admins.map(admin => (
              <div key={admin.id || admin.email} className="border rounded p-3 mb-2 flex justify-between items-center">
                <span>{admin.email}</span>
                <Button variant="destructive" size="sm" onClick={() => handleRemove(admin.id)}>Remove</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
