import { useEffect, useState } from 'react'
import { StorageImage } from './StorageImage'

export function ImageUploadField({
  label,
  existingPath,
  onFileSelected,
}: {
  label: string
  existingPath?: string
  onFileSelected: (file: File | null) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    onFileSelected(selected)
  }

  const hasImage = Boolean(previewUrl || existingPath)

  return (
    <label className="relative flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 py-6 text-sm text-neutral-400 cursor-pointer overflow-hidden min-h-24">
      {previewUrl ? (
        <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      ) : existingPath ? (
        <StorageImage path={existingPath} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      ) : null}
      <span className="relative z-10 bg-neutral-100/80 dark:bg-neutral-900/80 px-2 py-1 rounded">
        {hasImage ? `Replace ${label.toLowerCase()}` : label}
      </span>
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </label>
  )
}
