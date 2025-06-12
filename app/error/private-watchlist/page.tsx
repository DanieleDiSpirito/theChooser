import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, ArrowLeft, Search, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PrivateWatchlistPage({ searchParams }: { searchParams: { username?: string } }) {
  const username = searchParams.username

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-900/20 rounded-full w-fit">
            <Lock className="h-8 w-8 text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Watchlist privata</CardTitle>
          <CardDescription className="text-gray-300">
            {username ? (
              <>
                La watchlist di <span className="font-semibold text-white">"{username}"</span> è privata.
              </>
            ) : (
              "Questa watchlist è privata."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-400 space-y-2">
            <p>Per accedere a questa watchlist:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>L'utente deve rendere pubblica la sua watchlist</li>
              <li>Oppure devi essere connesso al tuo account Letterboxd</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            {username && (
              <Link href={`https://letterboxd.com/${username}/watchlist/`} target="_blank">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visita su Letterboxd
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button className="w-full bg-[#ff8000] hover:bg-[#ff9020] text-black">
                <Search className="mr-2 h-4 w-4" />
                Prova un altro username
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna alla home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
