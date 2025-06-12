import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-[#ff8000] mb-6" />
          <h2 className="text-2xl font-bold mb-4">Caricamento watchlist...</h2>
          <p className="text-gray-400 text-center max-w-md mb-8">
            Stiamo recuperando i film dalla watchlist di Letterboxd. Aspettiamo che tutte le immagini siano caricate
            completamente.
          </p>

          {/* Barra di progresso simulata */}
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Caricamento in corso...</span>
              <span className="text-sm text-gray-300">Attendere prego</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
