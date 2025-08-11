import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Winner {
  id: string
  season: string
  winner_name: string
  winner_photo: string | null
  position: number
  score: string | null
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: leaderboardEntries, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("season", { ascending: false })
    .order("position", { ascending: true })

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return <div className="text-center text-red-500">Failed to load leaderboard.</div>
  }

  // Group entries by season
  const seasons: { [key: string]: Winner[] } = leaderboardEntries.reduce((acc, entry) => {
    if (!acc[entry.season]) {
      acc[entry.season] = []
    }
    acc[entry.season].push(entry)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">See the champions of each season!</p>
      </header>

      <main className="mx-auto max-w-6xl space-y-10">
        {Object.entries(seasons).map(([seasonName, winners]) => (
          <section key={seasonName} className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-3xl font-semibold text-gray-900 dark:text-white">{seasonName}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {winners.map((winner) => (
                <Card key={winner.id} className="flex flex-col items-center p-4 text-center">
                  <CardHeader className="pb-2">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-200 dark:border-gray-700">
                      <Image
                        src={winner.winner_photo || "/placeholder.svg?height=96&width=96&query=winner-photo"}
                        alt={`${winner.winner_name}'s photo`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                      />
                    </div>
                    <CardTitle className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                      {winner.winner_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Position: {winner.position}</p>
                    {winner.score && <p className="text-md text-gray-600 dark:text-gray-400">Score: {winner.score}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
