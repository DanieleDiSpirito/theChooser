"use client"

import { useState, useMemo, useEffect } from "react"
import type { Film } from "@/lib/types"
import { FilmCard } from "@/components/film-card"
import { RandomFilmModal } from "@/components/random-film-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shuffle, Filter, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface WatchlistDisplayProps {
  initialFilms: Film[]
  username: string
  isLoading?: boolean
  totalFilms?: number
  displayedFilms?: number
}

export function WatchlistDisplay({
  initialFilms,
  username,
  isLoading = false,
  totalFilms = 0,
  displayedFilms = 0,
}: WatchlistDisplayProps) {
  const [films, setFilms] = useState<Film[]>(initialFilms)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("title")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedDecades, setSelectedDecades] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [randomFilm, setRandomFilm] = useState<Film | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Aggiorna i film quando cambiano quelli iniziali
  useEffect(() => {
    setFilms(initialFilms)
  }, [initialFilms])

  // Extract unique decades
  const decades = useMemo(() => {
    const decadeSet = new Set<string>()

    films.forEach((film) => {
      if (film.year) {
        const decade = `${Math.floor(film.year / 10) * 10}s`
        decadeSet.add(decade)
      }
    })

    return Array.from(decadeSet).sort()
  }, [films])

  // Apply filters and sorting
  const filteredAndSortedFilms = useMemo(() => {
    return films
      .filter((film) => {
        // Search filter
        const matchesSearch = film.title.toLowerCase().includes(searchTerm.toLowerCase())

        // Decade filter
        const matchesDecade =
          selectedDecades.length === 0 || (film.year && selectedDecades.includes(`${Math.floor(film.year / 10) * 10}s`))

        // Rating filter
        const matchesRating = !film.userRating || film.userRating >= minRating

        return matchesSearch && matchesDecade && matchesRating
      })
      .sort((a, b) => {
        let comparison = 0

        if (sortBy === "title") {
          comparison = a.title.localeCompare(b.title)
        } else if (sortBy === "year" && a.year && b.year) {
          comparison = a.year - b.year
        } else if (sortBy === "rating" && a.userRating && b.userRating) {
          comparison = a.userRating - b.userRating
        }

        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [films, searchTerm, sortBy, sortOrder, selectedDecades, minRating])

  const selectRandomFilm = () => {
    if (filteredAndSortedFilms.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAndSortedFilms.length)
      setRandomFilm(filteredAndSortedFilms[randomIndex])
      setIsModalOpen(true)
    }
  }

  const toggleDecade = (decade: string) => {
    setSelectedDecades((prev) => (prev.includes(decade) ? prev.filter((d) => d !== decade) : [...prev, decade]))
  }

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Cerca per titolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-2/3">
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Ordina per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Titolo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Ordine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente</SelectItem>
                  <SelectItem value="desc">Decrescente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={selectRandomFilm} className="bg-[#ff8000] hover:bg-[#ff9020] text-black">
              <Shuffle className="mr-2 h-4 w-4" />
              Film Casuale
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>
            {filteredAndSortedFilms.length} film trovati
            {isLoading && totalFilms > displayedFilms && (
              <span className="ml-2 text-[#ff8000]">
                ({displayedFilms}/{totalFilms} caricati)
              </span>
            )}
          </span>
          {isLoading && (
            <div className="flex items-center gap-2 text-[#ff8000]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Caricamento in corso...</span>
            </div>
          )}
        </div>
      </div>

      {filteredAndSortedFilms.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredAndSortedFilms.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            {isLoading ? "Caricamento dei primi film..." : "Nessun film trovato con i filtri selezionati"}
          </p>
        </div>
      )}

      <RandomFilmModal film={randomFilm} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
