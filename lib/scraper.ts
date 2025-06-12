"use server"

import type { Film } from "./types"

export interface ScrapingError {
  type: "USER_NOT_FOUND" | "PRIVATE_WATCHLIST" | "NETWORK_ERROR" | "PARSING_ERROR"
  message: string
}

export interface ScrapingProgress {
  currentPage: number
  totalPages: number
  filmsFound: number
}

// Client-side function to fetch watchlist using the API
export async function fetchWatchlistPage(
  username: string,
  page = 1,
): Promise<{
  films: Film[]
  hasNextPage: boolean
  totalPages: number
}> {
  const response = await fetch("/api/scrape-watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      page,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Errore nel caricamento")
  }

  return data
}
