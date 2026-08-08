import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import { SearchView } from './views/SearchView'
import { EntryDetail } from './views/EntryDetail'
import { EntryForm } from './views/EntryForm'
import { FoodDbView } from './views/FoodDbView'
import { LoginView } from './views/LoginView'
import { listMealEntries, createMealEntry, updateMealEntry, deleteMealEntry } from './lib/mealEntries'
import type { MealEntry } from './types'

type Tab = 'search' | 'add' | 'foodDb'
type SearchScreen = { screen: 'list' } | { screen: 'detail'; id: string } | { screen: 'edit'; id: string }

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="19" height="19" viewBox="0 0 20 20" fill="none">
      <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.4" />
      <line x1="13" y1="13" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function AddIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16">
      <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="1.6" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function FoodDbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2.5" width="14" height="15" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <line x1="6.5" y1="6.5" x2="13.5" y2="6.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="6.5" y1="10" x2="13.5" y2="10" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function CompassMark({ className }: { className?: string }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
      <rect x="9.15" y="1.4" width="1.7" height="2.6" rx="0.6" fill="currentColor" opacity="0.55" />
      <rect x="9.15" y="16" width="1.7" height="2.6" rx="0.6" fill="currentColor" opacity="0.35" />
      <rect x="1.4" y="9.15" width="2.6" height="1.7" rx="0.6" fill="currentColor" opacity="0.35" />
      <rect x="16" y="9.15" width="2.6" height="1.7" rx="0.6" fill="currentColor" opacity="0.35" />
      <path d="M10 4.6 L12.6 10 L10 11.6 Z" fill="currentColor" />
      <path d="M10 4.6 L7.4 10 L10 11.6 Z" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

const tabs: { id: Tab; label: string; Icon: (props: { className?: string }) => React.JSX.Element }[] = [
  { id: 'search', label: 'Search', Icon: SearchIcon },
  { id: 'add', label: 'Add', Icon: AddIcon },
  { id: 'foodDb', label: 'Food DB', Icon: FoodDbIcon },
]

function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined) // undefined = still checking
  const [activeTab, setActiveTab] = useState<Tab>('search')
  const [entries, setEntries] = useState<MealEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchScreen, setSearchScreen] = useState<SearchScreen>({ screen: 'list' })
  const [placeFilter, setPlaceFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    listMealEntries()
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setEntriesLoading(false))
  }, [session])

  function goToList() {
    setSearchScreen({ screen: 'list' })
  }

  function selectPlace(place: string) {
    setPlaceFilter(place)
    setDateFilter(null)
    goToList()
  }

  function selectDate(date: string) {
    setDateFilter(date)
    setPlaceFilter(null)
    goToList()
  }

  async function saveEntry(entry: MealEntry) {
    try {
      const exists = entries.some((e) => e.id === entry.id)
      const saved = exists ? await updateMealEntry(entry) : await createMealEntry(entry)
      setEntries((prev) => (exists ? prev.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...prev]))
      if (activeTab === 'add') {
        setActiveTab('search')
      }
      setSearchScreen({ screen: 'detail', id: saved.id })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function removeEntry(id: string) {
    try {
      await deleteMealEntry(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
      goToList()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const selectedEntry =
    searchScreen.screen !== 'list' ? entries.find((e) => e.id === searchScreen.id) : undefined

  if (session === undefined) {
    return null // still checking for an existing session
  }

  if (session === null) {
    return <LoginView />
  }

  return (
    <div className="h-svh flex justify-center bg-bg text-fg font-body">
      <div className="w-full max-w-md flex flex-col h-svh border-x border-line">
        <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CompassMark className="text-accent opacity-90" />
            <h1 className="font-display text-lg tracking-wide text-fg [font-variant:small-caps]">Dose Atlas</h1>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-muted"
          >
            Log out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          {activeTab === 'search' && searchScreen.screen === 'list' && (
            entriesLoading ? (
              <p className="text-sm text-muted text-center py-8">Loading...</p>
            ) : (
              <SearchView
                entries={entries}
                placeFilter={placeFilter}
                dateFilter={dateFilter}
                onFilterPlace={setPlaceFilter}
                onFilterDate={setDateFilter}
                onSelectEntry={(id) => setSearchScreen({ screen: 'detail', id })}
              />
            )
          )}

          {activeTab === 'search' && searchScreen.screen === 'detail' && selectedEntry && (
            <EntryDetail
              entry={selectedEntry}
              onBack={goToList}
              onEdit={() => setSearchScreen({ screen: 'edit', id: selectedEntry.id })}
              onDelete={() => removeEntry(selectedEntry.id)}
              onSelectPlace={selectPlace}
              onSelectDate={selectDate}
            />
          )}

          {activeTab === 'search' && searchScreen.screen === 'edit' && selectedEntry && (
            <EntryForm
              title="Edit entry"
              initial={selectedEntry}
              onSave={saveEntry}
              onCancel={() => setSearchScreen({ screen: 'detail', id: selectedEntry.id })}
            />
          )}

          {activeTab === 'add' && (
            <EntryForm title="Add entry" onSave={saveEntry} onCancel={() => setActiveTab('search')} />
          )}

          {activeTab === 'foodDb' && <FoodDbView />}
        </main>

        <nav className="mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] flex rounded-2xl bg-surface shadow-[0_8px_22px_-10px_rgba(0,0,0,0.4)] ring-1 ring-line">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                if (id === 'search') goToList()
              }}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                activeTab === id ? 'text-accent' : 'text-muted'
              }`}
            >
              <Icon className="leading-none" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default App
