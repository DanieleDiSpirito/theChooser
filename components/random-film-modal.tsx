"use client"

import type { Film } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ExternalLink, Star } from "lucide-react"
import Link from "next/link"

interface RandomFilmModalProps {
  film: Film | null
  isOpen: boolean
  onClose: () => void
}

export function RandomFilmModal({ film, isOpen, onClose }: RandomFilmModalProps) {
  if (!film) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center pr-8">Il tuo film casuale</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="relative aspect-[125/187] w-48 overflow-hidden rounded-lg">
            <Image
              src={film.posterUrl || "/placeholder.svg?height=187&width=125"}
              alt={film.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">{film.title}</h2>

            {film.year && <p className="text-gray-300 mb-3">{film.year}</p>}

            {film.userRating && film.userRating > 0 && (
              <div className="flex items-center justify-center mb-4">
                <span className="text-sm text-gray-400 mr-2">La tua valutazione:</span>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < film.userRating! ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                  />
                ))}
              </div>
            )}

            <div className="space-y-3">
              <Link href={film.letterboxdUrl} target="_blank">
                <Button className="w-full bg-[#ff8000] hover:bg-[#ff9020] text-black font-bold">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Vedi su Letterboxd
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:text-white"
                onClick={onClose}
              >
                Scegli un altro film
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
