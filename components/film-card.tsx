"use client"

import { useState } from "react"
import Image from "next/image"
import type { Film } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"
import Link from "next/link"

interface FilmCardProps {
  film: Film
}

export function FilmCard({ film }: FilmCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Card className="overflow-hidden bg-gray-800 border-gray-700 hover:border-[#ff8000] transition-all duration-300 group">
      <div className="relative aspect-[125/187] overflow-hidden bg-gray-900">
        {!imageError && film.posterUrl && !film.posterUrl.includes("placeholder.svg") ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="w-8 h-8 border-2 border-gray-700 rounded-full animate-spin border-t-[#ff8000]"></div>
              </div>
            )}
            <Image
              src={film.posterUrl || "/placeholder.svg"}
              alt={film.title}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              priority={false}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.log(`Failed to load image for ${film.title}: ${film.posterUrl}`)
                setImageError(true)
              }}
              loading="lazy"
              unoptimized // Aggiungi questo per evitare problemi con domini esterni
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-2">
            <div className="text-3xl mb-2">🎬</div>
            <p className="text-xs text-center text-gray-300 line-clamp-4 leading-tight">{film.title}</p>
            {film.year && <p className="text-xs text-gray-400 mt-1">{film.year}</p>}
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-bold text-sm line-clamp-2 mb-2 leading-tight">{film.title}</h3>

        <Link href={film.letterboxdUrl} target="_blank">
          <Button size="sm" className="w-full bg-[#ff8000] hover:bg-[#ff9020] text-black font-medium text-xs py-1">
            <ExternalLink className="mr-1 h-3 w-3" />
            Letterboxd
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
