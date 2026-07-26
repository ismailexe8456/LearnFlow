'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Layers, Plus, RotateCw, ChevronLeft, ChevronRight, Sparkles, Trash2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function FlashcardsClient({ initialDecks, userId }: { initialDecks: any[]; userId: string }) {
  const [decks, setDecks] = useState(initialDecks)
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    initialDecks.length > 0 ? initialDecks[0].id : null
  )

  // Forms state
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
  const [deckTitle, setDeckTitle] = useState('')
  const [deckDesc, setDeckDesc] = useState('')

  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardFront, setCardFront] = useState('')
  const [cardBack, setCardBack] = useState('')

  // Study state
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const supabase = createClient()
  const selectedDeck = decks.find((d) => d.id === selectedDeckId)
  const cards = selectedDeck?.flashcards || []

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deckTitle.trim()) return

    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert({
        user_id: userId,
        title: deckTitle.trim(),
        description: deckDesc.trim(),
      })
      .select('*, flashcards(*)')
      .single()

    if (data && !error) {
      setDecks([data, ...decks])
      setSelectedDeckId(data.id)
      setDeckTitle('')
      setDeckDesc('')
      setIsCreatingDeck(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardFront.trim() || !cardBack.trim() || !selectedDeckId) return

    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        deck_id: selectedDeckId,
        front: cardFront.trim(),
        back: cardBack.trim(),
      })
      .select()
      .single()

    if (data && !error) {
      setDecks((prev) =>
        prev.map((d) =>
          d.id === selectedDeckId ? { ...d, flashcards: [...d.flashcards, data] } : d
        )
      )
      setCardFront('')
      setCardBack('')
      setIsAddingCard(false)
    }
  }

  const handleDeleteDeck = async (id: string) => {
    await supabase.from('flashcard_decks').delete().eq('id', id)
    const updated = decks.filter((d) => d.id !== id)
    setDecks(updated)
    if (selectedDeckId === id) {
      setSelectedDeckId(updated.length > 0 ? updated[0].id : null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8 text-pink-500" />
            Flashcard Decks
          </h1>
          <p className="text-muted-foreground">Create study decks and master concepts with interactive flashcards.</p>
        </div>
        <Button onClick={() => setIsCreatingDeck(!isCreatingDeck)} className="bg-pink-600 hover:bg-pink-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> {isCreatingDeck ? 'Cancel' : 'New Deck'}
        </Button>
      </div>

      {isCreatingDeck && (
        <Card className="bg-white/80 dark:bg-black/60 backdrop-blur-md border-pink-500/30">
          <CardHeader>
            <CardTitle>Create Flashcard Deck</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deckTitle">Deck Title</Label>
                <Input
                  id="deckTitle"
                  placeholder="e.g. Spanish Vocabulary Unit 1"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deckDesc">Description (Optional)</Label>
                <Input
                  id="deckDesc"
                  placeholder="e.g. Common verbs and greetings"
                  value={deckDesc}
                  onChange={(e) => setDeckDesc(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">
                Create Deck
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Deck List Sidebar */}
        <div className="md:col-span-4 space-y-3">
          <h2 className="text-lg font-bold flex items-center justify-between">
            <span>My Decks ({decks.length})</span>
          </h2>
          {decks.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No decks created yet. Click "New Deck" to get started!
            </Card>
          ) : (
            decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => {
                  setSelectedDeckId(deck.id)
                  setCurrentCardIndex(0)
                  setIsFlipped(false)
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedDeckId === deck.id
                    ? 'bg-pink-500/10 border-pink-500/40 text-pink-600 dark:text-pink-300 font-semibold'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <h3 className="font-bold text-base">{deck.title}</h3>
                  <p className="text-xs text-muted-foreground">{deck.flashcards?.length || 0} card(s)</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteDeck(deck.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Flashcard Interactive Study Stage */}
        <div className="md:col-span-8 space-y-4">
          {!selectedDeck ? (
            <Card className="p-12 text-center text-muted-foreground">
              Select or create a deck to study flashcards!
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h2 className="text-2xl font-bold">{selectedDeck.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedDeck.description || "Interactive flashcard deck."}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddingCard(!isAddingCard)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> {isAddingCard ? 'Cancel' : 'Add Card'}
                </Button>
              </div>

              {isAddingCard && (
                <Card className="bg-white/80 dark:bg-black/60 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-base">Add New Flashcard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddCard} className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="front">Front (Prompt / Question)</Label>
                        <Input
                          id="front"
                          placeholder="e.g. What is the chemical formula for water?"
                          value={cardFront}
                          onChange={(e) => setCardFront(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="back">Back (Answer)</Label>
                        <Input
                          id="back"
                          placeholder="e.g. H2O"
                          value={cardBack}
                          onChange={(e) => setCardBack(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Save Card
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {cards.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                  This deck is empty! Click "Add Card" above to add flashcards.
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Card Flip Container */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer perspective-1000 w-full min-h-[300px] flex items-center justify-center p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-pink-500/30 shadow-xl transition-transform hover:scale-[1.02]"
                  >
                    <div className="text-center space-y-4 max-w-md">
                      <span className="text-xs uppercase font-bold tracking-widest text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                        {isFlipped ? 'Answer (Back)' : 'Question (Front)'} • Click to Flip
                      </span>
                      <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                        {isFlipped ? cards[currentCardIndex]?.back : cards[currentCardIndex]?.front}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                        <RotateCw className="w-4 h-4 animate-spin-slow" /> Tap card to reveal
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      disabled={currentCardIndex === 0}
                      onClick={() => {
                        setCurrentCardIndex((prev) => prev - 1)
                        setIsFlipped(false)
                      }}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous Card
                    </Button>

                    <span className="text-sm font-semibold text-muted-foreground">
                      Card {currentCardIndex + 1} of {cards.length}
                    </span>

                    <Button
                      variant="outline"
                      disabled={currentCardIndex === cards.length - 1}
                      onClick={() => {
                        setCurrentCardIndex((prev) => prev + 1)
                        setIsFlipped(false)
                      }}
                    >
                      Next Card <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
