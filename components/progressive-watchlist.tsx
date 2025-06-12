"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { WatchlistDisplay } from "@/components/watchlist-display"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { Film } from "@/lib/types"
import useSWR from "swr"

interface ProgressiveWatchlistProps {
  username: string
  initialFilms?: Film[]
}

// Fetcher function for SWR with improved error handling
const fetcher = async (url: string, params: any) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Server returned non-JSON response: ${await response.text().catch(() => "Unknown error")}`)
    }

    const data = await response.json()

    if (!response.ok) {
      const error: any = new Error("An error occurred while fetching the data.")
      error.info = data
      error.status = response.status
      throw error
    }

    return data
  } catch (error: any) {
    console.error("Fetch error:", error)
    // Rethrow with better error message
    if (error.message.includes("Server returned non-JSON response")) {
      throw new Error("Il server ha restituito un errore. Riprova più tardi.")
    }
    throw error
  }
}

export function ProgressiveWatchlist({ username, initialFilms = [] }: ProgressiveWatchlistProps) {
  const [films, setFilms] = useState<Film[]>(initialFilms)
  const [displayedFilms, setDisplayedFilms] = useState<Film[]>(initialFilms) // Film attualmente mostrati
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState("Inizializzazione...")
  const [isFirstPageLoaded, setIsFirstPageLoaded] = useState(false)
  const [stillFetching, setStillFetching] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  // Use refs to avoid dependency issues
  const filmsRef = useRef<Film[]>(initialFilms)
  const shouldFetchNextPage = useRef<boolean>(true)

  // Update ref when films change
  useEffect(() => {
    filmsRef.current = films
  }, [films])

  // Aggiorna i film mostrati quando arrivano nuovi film
  useEffect(() => {
    if (films.length > displayedFilms.length) {
      const newFilms = films.slice(displayedFilms.length)
      console.log(`Adding ${newFilms.length} new films to display`)

      // Aggiungi i nuovi film alla lista mostrata
      setDisplayedFilms((prevDisplayed) => [...prevDisplayed, ...newFilms])
    }
  }, [films, displayedFilms.length])

  // Use SWR for the current page
  const { data, error: swrError } = useSWR(
    shouldFetchNextPage.current ? ["/api/scrape-watchlist", { username, page: currentPage }] : null,
    ([url, params]) => fetcher(url, params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      errorRetryCount: 3,
      onSuccess: (data) => {
        console.log(`Page ${currentPage} loaded successfully. Films found: ${data.films?.length || 0}`)

        // Aggiungi immediatamente i film alla lista completa
        setFilms((prev) => {
          const newFilms = [...prev, ...(data.films || [])]
          console.log(`Total films now: ${newFilms.length}`)
          return newFilms
        })

        setTotalPages(data.totalPages || 1)

        // Se è la prima pagina, imposta loading a false e mostra i film
        if (currentPage === 1) {
          setIsFirstPageLoaded(true)
          setLoading(false)
          console.log("First page loaded, showing films immediately")
        }

        // Reset retry count on success
        setRetryCount(0)

        // Check if we should load the next page
        if (data.hasNextPage && currentPage < (data.totalPages || 1)) {
          // Aggiorna il messaggio di caricamento
          setLoadingMessage(`Caricando pagina ${currentPage + 1} di ${data.totalPages}...`)

          setTimeout(() => {
            setCurrentPage((prev) => prev + 1)
          }, 1000) // Ridotto il delay per un caricamento più fluido
        } else {
          shouldFetchNextPage.current = false
          setStillFetching(false)
          setLoadingMessage("Caricamento completato!")
          console.log("All pages loaded!")
        }
      },
      onError: (err) => {
        console.error("SWR error:", err)

        // Handle specific API errors
        if (err.info?.error === "PRIVATE_WATCHLIST") {
          setErrorType("PRIVATE_WATCHLIST")
          setError(`La watchlist di "${username}" è privata.`)
          setLoading(false)
          setStillFetching(false)
          shouldFetchNextPage.current = false
          return
        } else if (err.info?.error === "USER_NOT_FOUND") {
          setErrorType("USER_NOT_FOUND")
          setError(`L'utente "${username}" non esiste su Letterboxd.`)
          setLoading(false)
          setStillFetching(false)
          shouldFetchNextPage.current = false
          return
        }

        // For other errors, try to retry a few times
        if (retryCount < 3) {
          setRetryCount((prev) => prev + 1)
          setLoadingMessage(`Errore di connessione. Tentativo ${retryCount + 1}/3...`)

          setTimeout(
            () => {
              console.log(`Retrying... attempt ${retryCount + 1}`)
            },
            2000 * (retryCount + 1),
          ) // Exponential backoff
        } else {
          // After 3 retries, show error
          setErrorType("SCRAPING_ERROR")
          setError("Errore nel caricamento della watchlist. Riprova più tardi.")
          setLoading(false)
          setStillFetching(false)
          shouldFetchNextPage.current = false
        }
      },
    },
  )

  const updateLoadingMessage = useCallback((page: number, total: number, currentFilmsCount: number) => {
    const messages = [
      `Caricando pagina ${page} di ${total}...`,
      `Aggiungendo nuovi film alla lista...`,
      `${currentFilmsCount} film caricati finora...`,
      `Caricamento poster da Letterboxd...`,
      `Elaborando film della pagina ${page}...`,
    ]
    const messageIndex = Math.floor(Math.random() * messages.length)
    setLoadingMessage(messages[messageIndex])
  }, [])

  // Update loading message periodically
  useEffect(() => {
    if (!stillFetching) return

    const interval = setInterval(() => {
      updateLoadingMessage(currentPage, totalPages, displayedFilms.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [stillFetching, currentPage, totalPages, displayedFilms.length, updateLoadingMessage])

  if (error) {
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

          <div className="flex items-center justify-center py-16">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-red-900/20 rounded-full w-fit">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <CardTitle className="text-2xl">
                  {errorType === "PRIVATE_WATCHLIST"
                    ? "Watchlist privata"
                    : errorType === "USER_NOT_FOUND"
                      ? "Utente non trovato"
                      : "Errore nel caricamento"}
                </CardTitle>
                <CardDescription className="text-gray-300">{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {errorType === "PRIVATE_WATCHLIST" && (
                    <Link href={`https://letterboxd.com/${username}/watchlist/`} target="_blank">
                      <Button className="w-full bg-[#ff8000] hover:bg-[#ff9020] text-black">
                        Visita su Letterboxd
                      </Button>
                    </Link>
                  )}
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
        </div>
      </div>
    )
  }

  const progressPercentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold ml-4">
            Watchlist di <span className="text-[#ff8000]">{username}</span>
          </h1>
        </div>

        {/* Progress Bar - Show only if still fetching additional pages */}
        {stillFetching && isFirstPageLoaded && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[#ff8000]" />
                  <div>
                    <h3 className="font-medium text-white">Caricamento pagine aggiuntive</h3>
                    <p className="text-sm text-gray-400">{loadingMessage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#ff8000]">{progressPercentage}%</div>
                  <div className="text-xs text-gray-400">
                    {currentPage}/{totalPages} pagine
                  </div>
                  <div className="text-xs text-gray-400">{displayedFilms.length} film mostrati</div>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2 mt-3" />
            </CardContent>
          </Card>
        )}

        {/* Film Display - Usa displayedFilms invece di films */}
        {displayedFilms.length > 0 ? (
          <WatchlistDisplay
            initialFilms={displayedFilms}
            username={username}
            isLoading={stillFetching}
            totalFilms={films.length}
            displayedFilms={displayedFilms.length}
          />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-gray-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#ff8000] rounded-full animate-spin border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Caricamento prima pagina...</h2>
            <p className="text-gray-400 text-center max-w-md">
              Stiamo caricando la prima pagina della watchlist e i poster direttamente da Letterboxd...
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">Nessun film trovato nella watchlist</p>
          </div>
        )}
      </div>
    </div>
  )
}
