'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gamepad2 } from 'lucide-react'

export default function JoinQuizPage() {
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const router = useRouter()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim() || !nickname.trim()) return
    router.push(`/play/${pin.trim()}?nickname=${encodeURIComponent(nickname.trim())}`)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/80 dark:bg-black/60 backdrop-blur-md border-purple-500/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-extrabold">Join Live Game</CardTitle>
          <CardDescription>Enter the 6-digit Game PIN from your teacher's screen.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Game PIN</Label>
              <Input
                id="pin"
                placeholder="e.g. 849201"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="text-center font-mono text-2xl font-bold tracking-widest h-14"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Your Nickname</Label>
              <Input
                id="nickname"
                placeholder="e.g. Alex"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="text-center font-bold text-lg"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white h-14 text-lg font-bold shadow-lg hover:scale-[1.02] transition-transform">
              Enter Live Arena
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
