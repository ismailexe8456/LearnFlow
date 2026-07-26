'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Plus, Bot, Send, User, Trash2, Sparkles, BookOpen } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function NotebookNotesClient({
  initialDocuments,
  userId,
}: {
  initialDocuments: any[]
  userId: string
}) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    initialDocuments.length > 0 ? initialDocuments[0].id : null
  )

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const selectedDoc = documents.find((d) => d.id === selectedDocId)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
      })
      .select()
      .single()

    if (data && !error) {
      setDocuments([data, ...documents])
      setSelectedDocId(data.id)
      setTitle('')
      setContent('')
      setIsCreating(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id)
    const updated = documents.filter((d) => d.id !== id)
    setDocuments(updated)
    if (selectedDocId === id) {
      setSelectedDocId(updated.length > 0 ? updated[0].id : null)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedDocId || isLoading) return

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDocId,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''
        const assistantId = (Date.now() + 1).toString()

        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
          )
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            NotebookLM AI Notes
          </h1>
          <p className="text-muted-foreground">Upload or paste notes and ask grounded AI questions.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> {isCreating ? 'Cancel' : 'New Note Document'}
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-white/80 dark:bg-black/60 backdrop-blur-md border-purple-500/30">
          <CardHeader>
            <CardTitle>Create AI Note Document</CardTitle>
            <CardDescription>Paste study material, lecture transcript, or chapter text.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docTitle">Document Title</Label>
                <Input
                  id="docTitle"
                  placeholder="e.g. Chapter 4: Photosynthesis & Cellular Respiration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docContent">Document Content</Label>
                <Textarea
                  id="docContent"
                  placeholder="Paste your notes or document text here..."
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Document
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Document Selector Sidebar */}
        <Card className="md:col-span-4 bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" /> My Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-3">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-8">
                    No documents saved yet. Click "New Note Document" to add one!
                  </p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id)
                        setMessages([])
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedDocId === doc.id
                          ? 'bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-300 font-semibold'
                          : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate flex-1 mr-2">
                        <p className="text-sm truncate">{doc.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDocument(doc.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* NotebookLM AI Chat Grounded in Document */}
        <Card className="md:col-span-8 bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20 h-[600px] flex flex-col">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                {selectedDoc ? `Q&A: ${selectedDoc.title}` : 'Select a document'}
              </span>
              {selectedDoc && (
                <span className="text-xs font-normal text-muted-foreground bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                  Grounded AI Mode
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {!selectedDoc ? (
              <div className="h-full flex items-center justify-center p-6 text-center text-muted-foreground">
                Select or create a document to start NotebookLM AI question answering.
              </div>
            ) : (
              <ScrollArea className="h-full p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-center space-y-2 my-4">
                      <BookOpen className="w-8 h-8 text-purple-500 mx-auto opacity-70" />
                      <p className="font-semibold text-sm">NotebookLM Grounded Assistant Ready</p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        Ask any question about "{selectedDoc.title}". The AI will analyze your notes and provide grounded answers!
                      </p>
                    </div>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {m.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-purple-500" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm ${
                          m.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                      {m.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-150"></div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          {selectedDoc && (
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder={`Ask a question about ${selectedDoc.title}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
