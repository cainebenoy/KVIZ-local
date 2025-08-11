"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Winner {
  id?: string
  winner_name: string
  winner_photo?: string | null
  photo?: File | null
  preview?: string | null
  position: number
  score?: string | null
}

export default function LeaderboardAdminPage() {
  const [season, setSeason] = useState("")
  const [winners, setWinners] = useState<Winner[]>([])
  const [seasons, setSeasons] = useState<{ id: string, name: string }[]>([])
  const [selectedSeason, setSelectedSeason] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSeasons = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false })
      if (error) toast({ title: "Error", description: error.message })
      setSeasons(data || [])
      setLoading(false)
    }
    fetchSeasons()
  }, [])

  useEffect(() => {
    if (!selectedSeason) return setWinners([])
    const fetchWinners = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("leaderboard").select("*").eq("season", selectedSeason).order("position", { ascending: true })
      if (error) toast({ title: "Error", description: error.message })
      setWinners(data || [])
    }
    fetchWinners()
  }, [selectedSeason])

  const handleAddWinner = () => {
    setWinners([...winners, { winner_name: "", position: winners.length + 1 }])
  }

  const updateWinner = (idx: number, field: keyof Winner, value: any) => {
    setWinners(prev => {
      const updated = [...prev]
      if (field === "photo" && value) {
        updated[idx].photo = value
        updated[idx].preview = URL.createObjectURL(value)
      } else {
        updated[idx] = { ...updated[idx], [field]: value }
      }
      return updated
    })
  }

  const removeWinner = async (idx: number) => {
    setDeletingIdx(idx)
    const winner = winners[idx]
    if (winner.id) {
      const supabase = createClient()
      const { error } = await supabase.from("leaderboard").delete().eq("id", winner.id)
      if (error) {
        toast({ title: "Error", description: error.message })
        setDeletingIdx(null)
        return
      }
    }
    setWinners(prev => prev.filter((_, i) => i !== idx))
    setDeletingIdx(null)
    toast({ title: "Winner Deleted", description: "Winner entry removed successfully." })
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const updatedWinners = [...winners]
    for (let i = 0; i < updatedWinners.length; i++) {
      let photoUrl = updatedWinners[i].winner_photo || null
      const file = updatedWinners[i].photo
      if (file && file instanceof File) {
        // Validate image type and size
        if (!file.type.startsWith("image/")) {
          toast({ title: "Error", description: "Please select a valid image file." })
          setSaving(false)
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: "Error", description: "Max file size is 5MB." })
          setSaving(false)
          return
        }
        const filePath = `winner-photos/${selectedSeason}/${Date.now()}-${file.name}`
        const { error: imgError } = await supabase.storage.from("winner-photos").upload(filePath, file, { cacheControl: "3600", upsert: false })
        if (imgError) {
          console.error("Image upload error:", imgError)
          toast({ title: "Image Upload Error", description: imgError.message })
          setSaving(false)
          return
        }
        const { data: publicUrlData } = supabase.storage.from("winner-photos").getPublicUrl(filePath)
        photoUrl = publicUrlData.publicUrl
        updatedWinners[i].winner_photo = photoUrl
        updatedWinners[i].photo = null // Clear file after upload
        updatedWinners[i].preview = null
      }
      if (updatedWinners[i].id) {
        // Update existing winner
        const { error: updateError } = await supabase.from("leaderboard").update({
          winner_name: updatedWinners[i].winner_name,
          winner_photo: photoUrl,
          position: updatedWinners[i].position,
          score: updatedWinners[i].score
        }).eq("id", updatedWinners[i].id)
        if (updateError) {
          toast({ title: "Error", description: updateError.message })
          setSaving(false)
          return
        }
      } else {
        // Insert new winner
        const { error: insertError } = await supabase.from("leaderboard").insert({
          season: selectedSeason,
          winner_name: updatedWinners[i].winner_name,
          winner_photo: photoUrl,
          position: updatedWinners[i].position,
          score: updatedWinners[i].score
        })
        if (insertError) {
          toast({ title: "Error", description: insertError.message })
          setSaving(false)
          return
        }
      }
    }
    setWinners(updatedWinners)
    setSaving(false)
    toast({ title: "Leaderboard Updated", description: "All changes saved successfully." })
  }

  const handleCreateSeason = async () => {
    if (!season) return
    if (seasons.some(s => s.name === season)) {
      toast({ title: "Season Exists", description: "This season already exists." })
      return
    }
    const supabase = createClient()
    const { data, error } = await supabase.from("seasons").insert({ name: season }).select().single()
    if (error) {
      toast({ title: "Error", description: error.message })
      return
    }
    setSeasons([data, ...seasons])
    setSelectedSeason(data.name)
    setSeason("")
    toast({ title: "Season Created", description: "New season added." })
  }

  if (loading) return <div className="p-8 text-center">Loading seasons...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Manage Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Input value={season} onChange={e => setSeason(e.target.value)} placeholder="New season name" />
            <Button onClick={handleCreateSeason} variant="default">Create Season</Button>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Select Season</label>
            <select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)} className="w-full p-2 border rounded">
              <option value="">-- Select --</option>
              {seasons.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          {selectedSeason && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Winners</h3>
                <Button onClick={handleAddWinner} variant="secondary">Add Winner</Button>
              </div>
              {winners.length === 0 ? (
                <div className="text-center text-gray-500">No winners found.</div>
              ) : (
                winners.map((winner, idx) => (
                  <Card key={winner.id || idx} className="mb-2">
                    <CardContent className="flex gap-4 items-center">
                      <Input value={winner.winner_name} onChange={e => updateWinner(idx, "winner_name", e.target.value)} placeholder="Winner name" className="w-32" />
                      <Input type="file" accept="image/*" onChange={e => updateWinner(idx, "photo", e.target.files?.[0] || null)} className="w-32" />
                      {winner.preview && <img src={winner.preview} alt="preview" style={{ width: 48, borderRadius: 8 }} />}
                      {winner.winner_photo && !winner.preview && <img src={winner.winner_photo} alt="winner" style={{ width: 48, borderRadius: 8 }} />}
                      <Input type="number" min={1} value={winner.position} onChange={e => updateWinner(idx, "position", Number(e.target.value))} placeholder="Position" className="w-20" />
                      <Input value={winner.score || ""} onChange={e => updateWinner(idx, "score", e.target.value)} placeholder="Score/Description" className="w-32" />
                      <Button variant="destructive" size="sm" onClick={() => removeWinner(idx)} disabled={deletingIdx === idx} aria-pressed={deletingIdx === idx} aria-disabled={deletingIdx === idx}>
                        {deletingIdx === idx ? "Deleting..." : "Delete"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
              <Button onClick={handleSave} variant="default" disabled={saving} aria-pressed={saving} aria-disabled={saving}>
                {saving ? "Saving..." : "Save Leaderboard"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
