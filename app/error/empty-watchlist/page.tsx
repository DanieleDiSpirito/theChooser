import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileX, ArrowLeft, Search, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function EmptyWatchlistPage({ searchParams }: { searchParams: { username?: string } }) {
  const username = searchParams.username

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-900/20 rounded-full w-fit">
            <FileX className="h-8 w-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Watchlist vuota</CardTitle>
          <CardDescription className="text-gray-300">
            {username ? (
              <>
                La watchlist di <span className="font-semibold text-white">"{username}"</span> è vuota.
              </>
            ) : (
              "Questa watchlist non contiene film."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-400 text-center">
            <p>Sembra che questo utente non abbia ancora aggiunto film alla sua watchlist.</p>
          </div>

          <div className="flex flex-col gap-2">
            {username && (
              <Link href={`https://letterboxd.com/${username}/`} target="_blank">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visita profilo su Letterboxd
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
