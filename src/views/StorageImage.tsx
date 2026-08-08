import { useEffect, useState } from 'react'
import { getSignedImageUrl } from '../lib/storage'

export function StorageImage({
  path,
  alt,
  className,
  onClick,
}: {
  path: string
  alt: string
  className?: string
  onClick?: () => void
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setUrl(null)
    getSignedImageUrl(path)
      .then((signedUrl) => {
        if (!cancelled) setUrl(signedUrl)
      })
      .catch(() => {
        // Leave url null - caller's fallback UI (behind/around this component) covers it.
      })
    return () => {
      cancelled = true
    }
  }, [path])

  if (!url) return <div className={className} />
  return <img src={url} alt={alt} className={className} onClick={onClick} />
}
