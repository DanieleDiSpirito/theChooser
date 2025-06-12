import { SearchForm } from "@/components/search-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">theChooser</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Esplora la tua watchlist e scopri il prossimo film da guardare
          </p>
          <SearchForm />
        </div>
      </div>
    </div>
  )
}
