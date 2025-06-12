import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserX, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"

export default function UserNotFoundPage({ searchParams }: { searchParams: { username?: string } }) {
  const username = searchParams.username

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-900/20 rounded-full w-fit">
            <UserX className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl">Utente non trovato</CardTitle>
          <CardDescription className="text-gray-300">
            {username ? (
              <>
                L'utente <span className="font-semibold text-white">"{username}"</span> non esiste su Letterboxd.
              </>
            ) : (
              "L'utente specificato non esiste su Letterboxd."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-400 space-y-2">
            <p>Possibili cause:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Username digitato incorrettamente</li>
              <li>L'account è stato eliminato</li>
              <li>L'account non è mai esistito</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
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
