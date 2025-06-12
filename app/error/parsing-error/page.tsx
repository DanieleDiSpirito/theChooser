import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft, Search, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ParsingErrorPage({ searchParams }: { searchParams: { username?: string; message?: string } }) {
  const username = searchParams.username
  const errorMessage = searchParams.message || "Errore sconosciuto"

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-900/20 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Errore di parsing</CardTitle>
          <CardDescription className="text-gray-300">Non è stato possibile leggere la watchlist.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-400 space-y-2">
            <p>Dettaglio errore:</p>
            <div className="bg-gray-900 p-3 rounded-md overflow-auto">
              <code className="text-orange-300">{errorMessage}</code>
            </div>
            <p className="mt-4">Questo errore può verificarsi quando:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Letterboxd ha cambiato la struttura delle pagine</li>
              <li>La pagina contiene contenuti inaspettati</li>
              <li>Problemi temporanei del sito</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            {username && (
              <Link href={`https://letterboxd.com/${username}/watchlist/`} target="_blank">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visita watchlist su Letterboxd
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
