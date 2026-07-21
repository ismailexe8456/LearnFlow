'use client'

import { useChat } from 'ai/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, User } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
  })
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="flex flex-col h-[500px] bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-500" />
          LearnFlow AI Tutor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-10">
                <p>Hello! I'm your LearnFlow AI tutor.</p>
                <p className="text-sm">Ask me any question about your lessons!</p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-indigo-500" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
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
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className="flex-1 bg-white/50 dark:bg-black/40 backdrop-blur-sm"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="bg-indigo-500 hover:bg-indigo-600">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
