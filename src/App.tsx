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

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'add', label: 'Add', icon: '➕' },
  { id: 'foodDb', label: 'Food DB', icon: '📖' },
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
    <div className="h-svh flex justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="w-full max-w-md flex flex-col h-svh border-x border-neutral-200 dark:border-neutral-900">
        <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 border-b border-neutral-200 dark:border-neutral-900 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Dose Atlas</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-neutral-500"
          >
            Log out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          {activeTab === 'search' && searchScreen.screen === 'list' && (
            entriesLoading ? (
              <p className="text-sm text-neutral-400 text-center py-8">Loading...</p>
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

        <nav className="border-t border-neutral-200 dark:border-neutral-900 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === 'search') goToList()
              }}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-neutral-400'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default App
