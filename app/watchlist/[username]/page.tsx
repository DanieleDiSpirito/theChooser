import { ProgressiveWatchlist } from "@/components/progressive-watchlist"

export default function WatchlistPage({ params }: { params: { username: string } }) {
  const username = params.username

  return <ProgressiveWatchlist username={username} />
}
