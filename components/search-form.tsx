"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film } from "lucide-react"

export function SearchForm() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return

    setIsLoading(true)
    router.push(`/watchlist/${username}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md">
        <Film className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Inserisci il tuo username di Letterboxd"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="pl-10 py-6 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-lg w-full"
        />
      </div>
      <Button
        type="submit"
        disabled={!username || isLoading}
        className="bg-[#ff8000] hover:bg-[#ff9020] text-black font-bold py-6 px-8 rounded-lg text-lg w-full max-w-md"
      >
        {isLoading ? "Caricamento..." : "Esplora Watchlist"}
      </Button>
    </form>
  )
}
