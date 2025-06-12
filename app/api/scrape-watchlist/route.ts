import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    // Parse JSON safely
    let username, page
    try {
      const body = await request.json()
      username = body.username
      page = body.page || 1
    } catch (e) {
      console.error("Error parsing request JSON:", e)
      return NextResponse.json({ error: "INVALID_REQUEST", message: "Invalid request format" }, { status: 400 })
    }

    if (!username) {
      return NextResponse.json({ error: "INVALID_REQUEST", message: "Username is required" }, { status: 400 })
    }

    console.log(`Starting scrape for user: ${username}, page: ${page}`)

    const baseUrl = "https://letterboxd.com"
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
      "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    }

    // Costruisci l'URL della pagina
    const pageUrl = page === 1 ? `${baseUrl}/${username}/watchlist/` : `${baseUrl}/${username}/watchlist/page/${page}/`

    console.log(`Fetching: ${pageUrl}`)

    // Delay iniziale per essere rispettosi
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500))

    // Fetch with error handling
    let response
    try {
      response = await fetch(pageUrl, {
        headers,
        cache: "no-store",
      })
    } catch (error) {
      console.error("Network error fetching Letterboxd:", error)
      return NextResponse.json(
        { error: "NETWORK_ERROR", message: "Errore di connessione a Letterboxd" },
        { status: 500 },
      )
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "USER_NOT_FOUND", message: `L'utente "${username}" non esiste su Letterboxd.` },
          { status: 404 },
        )
      }
      return NextResponse.json(
        { error: "NETWORK_ERROR", message: `Errore di rete: ${response.status}` },
        { status: response.status },
      )
    }

    // Parse HTML with error handling
    let html
    try {
      html = await response.text()
    } catch (error) {
      console.error("Error reading response:", error)
      return NextResponse.json(
        { error: "PARSING_ERROR", message: "Errore nella lettura della risposta" },
        { status: 500 },
      )
    }

    if (!html || html.length < 1000) {
      return NextResponse.json(
        { error: "PARSING_ERROR", message: "Risposta HTML non valida o troppo corta" },
        { status: 500 },
      )
    }

    console.log(`HTML fetched successfully, length: ${html.length}`)

    // Load HTML with cheerio
    let $
    try {
      $ = cheerio.load(html)
    } catch (error) {
      console.error("Error parsing HTML:", error)
      return NextResponse.json({ error: "PARSING_ERROR", message: "Errore nel parsing dell'HTML" }, { status: 500 })
    }

    // Verifica se la watchlist è privata
    if (html.includes("This member's profile is private") || html.includes("This member's watchlist is private")) {
      return NextResponse.json(
        { error: "PRIVATE_WATCHLIST", message: `La watchlist di "${username}" è privata.` },
        { status: 403 },
      )
    }

    // Verifica se la watchlist è vuota
    if (html.includes("hasn't added any films to their watchlist yet")) {
      return NextResponse.json({ films: [], hasNextPage: false, totalPages: 1 })
    }

    // Determina il numero totale di pagine
    let totalPages = 1
    try {
      const pagination = $(".pagination")
      if (pagination.length > 0) {
        const lastPageLink = pagination.find("li:not(.next) a").last()
        if (lastPageLink.length > 0) {
          const lastPageHref = lastPageLink.attr("href")
          const pageMatch = lastPageHref?.match(/page\/(\d+)/)
          if (pageMatch) {
            totalPages = Number.parseInt(pageMatch[1])
          }
        }
      }
    } catch (error) {
      console.error("Error parsing pagination:", error)
      // Continue with default totalPages = 1
    }

    console.log(`Total pages detected: ${totalPages}`)

    // Estrai i film con poster da Letterboxd
    let films = []
    try {
      films = await extractFilmsWithPosters($, baseUrl)
      console.log(`Films extracted with posters: ${films.length}`)
    } catch (error) {
      console.error("Error extracting films:", error)
      return NextResponse.json({ error: "PARSING_ERROR", message: "Errore nell'estrazione dei film" }, { status: 500 })
    }

    // Verifica se c'è una pagina successiva
    const nextPageLink = $("a.next")
    const hasNextPage = nextPageLink.length > 0 && page < totalPages

    return NextResponse.json({ films, hasNextPage, totalPages })
  } catch (error) {
    console.error("Unhandled error in API route:", error)
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Errore interno del server. Riprova più tardi." },
      { status: 500 },
    )
  }
}

// Funzione per estrarre film con poster da Letterboxd
async function extractFilmsWithPosters($: cheerio.CheerioAPI, baseUrl: string): Promise<any[]> {
  const films: any[] = []

  try {
    // Metodo principale: ul.poster-list li.poster-container
    $("ul.poster-list li.poster-container").each((_, element) => {
      try {
        const $film = $(element)
        const $div = $film.find("div").first()
        const $img = $film.find("img")

        // Informazioni base
        const filmLink = $div.attr("data-film-link")
        const title = $img.attr("alt")
        const cacheBustingKey = $div.attr("data-cache-busting-key")

        if (!filmLink || !title) {
          return
        }

        // Estrai l'anno dal link del film
        const yearMatch = filmLink.match(/\/(\d{4})\//)
        const year = yearMatch ? Number.parseInt(yearMatch[1]) : undefined

        // Estrai il rating dell'utente se presente
        const $rating = $film.find(".rating")
        let userRating: number | undefined
        if ($rating.length > 0) {
          const ratingClass = $rating.attr("class")
          const ratingMatch = ratingClass?.match(/rated-(\d+)/)
          if (ratingMatch) {
            userRating = Number.parseInt(ratingMatch[1])
          }
        }

        const film = {
          id: filmLink.replace(/\//g, "-"),
          title: title.trim(),
          letterboxdUrl: `${baseUrl}${filmLink}`,
          filmLink: filmLink,
          cacheBustingKey: cacheBustingKey,
          ...(year && { year }),
          ...(userRating && { userRating }),
        }

        films.push(film)
      } catch (error) {
        console.error("Errore nel parsing del film:", error)
      }
    })

    // Metodo fallback: div.film-poster
    if (films.length === 0) {
      console.log("Trying fallback method...")
      $("div.film-poster").each((_, element) => {
        try {
          const $element = $(element)
          const filmPath = $element.attr("data-target-link")
          const $img = $element.find("img")
          const title = $img.attr("alt")
          const cacheBustingKey = $element.attr("data-cache-busting-key")

          if (filmPath && title) {
            const yearMatch = filmPath.match(/\/(\d{4})\//)
            const year = yearMatch ? Number.parseInt(yearMatch[1]) : undefined

            films.push({
              id: filmPath.replace(/\//g, "-"),
              title: title.trim(),
              letterboxdUrl: `${baseUrl}${filmPath}`,
              filmLink: filmPath,
              cacheBustingKey: cacheBustingKey,
              ...(year && { year }),
            })
          }
        } catch (error) {
          console.error("Errore nel parsing alternativo:", error)
        }
      })
    }

    // Ora ottieni i poster per ogni film
    const filmsWithPosters = []
    for (const film of films) {
      try {
        const posterUrl = await getPosterFromLetterboxd(film.filmLink, film.cacheBustingKey)
        filmsWithPosters.push({
          ...film,
          posterUrl: posterUrl || "/placeholder.svg?height=187&width=125",
        })

        console.log(`Got poster for ${film.title}: ${posterUrl ? "SUCCESS" : "FAILED"}`)

        // Delay per essere rispettosi
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Error getting poster for ${film.title}:`, error)
        filmsWithPosters.push({
          ...film,
          posterUrl: "/placeholder.svg?height=187&width=125",
        })
      }
    }

    return filmsWithPosters
  } catch (error) {
    console.error("Error in extractFilmsWithPosters:", error)
    return films
  }
}

// Funzione per ottenere il poster da Letterboxd AJAX endpoint
async function getPosterFromLetterboxd(filmLink: string, cacheBustingKey?: string): Promise<string | null> {
  try {
    if (!cacheBustingKey) {
      console.log(`No cache busting key for ${filmLink}`)
      return null
    }

    // Costruisci l'URL del poster AJAX
    const posterAjaxUrl = `https://letterboxd.com/ajax/poster${filmLink}std/125x187/?k=${cacheBustingKey}`

    console.log(`Fetching poster AJAX: ${posterAjaxUrl}`)

    const response = await fetch(posterAjaxUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        Referer: "https://letterboxd.com/",
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch poster AJAX: ${response.status} ${response.statusText}`)
      return null
    }

    // La risposta dovrebbe essere HTML, non un'immagine
    const htmlResponse = await response.text()
    console.log(`AJAX response length: ${htmlResponse.length}`)

    // Parsa l'HTML di risposta
    const $ = cheerio.load(htmlResponse)

    // Estrai l'src dell'immagine usando il selettore equivalente a /html/body/div/img[1]
    const posterSrc = $("body > div > img:first-child").attr("src")

    if (posterSrc) {
      console.log(`Found poster src: ${posterSrc}`)

      // Se l'URL è relativo, rendilo assoluto
      if (posterSrc.startsWith("/")) {
        return `https://letterboxd.com${posterSrc}`
      } else if (posterSrc.startsWith("//")) {
        return `https:${posterSrc}`
      }

      return posterSrc
    } else {
      console.log("No poster src found in AJAX response")
      console.log("Response HTML:", htmlResponse.substring(0, 500))
      return null
    }
  } catch (error) {
    console.error("Error fetching poster from Letterboxd AJAX:", error)
    return null
  }
}
