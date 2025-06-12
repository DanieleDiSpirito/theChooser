export interface Film {
  id: string
  title: string
  letterboxdUrl: string
  posterUrl?: string
  year?: number
  userRating?: number // Rating personale dell'utente su Letterboxd
  filmLink?: string
  cacheBustingKey?: string
}

export interface ScrapingError {
  type: "USER_NOT_FOUND" | "PRIVATE_WATCHLIST" | "NETWORK_ERROR" | "PARSING_ERROR"
  message: string
}

export interface ScrapingProgress {
  currentPage: number
  totalPages: number
  filmsFound: number
}
