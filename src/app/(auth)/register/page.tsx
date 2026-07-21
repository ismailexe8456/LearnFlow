import { signup } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-black/50 border-white/20 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Join LearnFlow as a Student or Teacher
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 dark:bg-black/40">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
            </TabsList>
            
            {['student', 'teacher'].map((role) => (
              <TabsContent key={role} value={role}>
                <form action={async (formData) => { await signup(formData) }} className="space-y-4">
                  <input type="hidden" name="role" value={role} />
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${role}-fullName`}>Full Name</Label>
                    <Input id={`${role}-fullName`} name="fullName" placeholder="John Doe" required className="bg-white/50 dark:bg-black/40 border-white/30 backdrop-blur-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${role}-email`}>Email</Label>
                    <Input id={`${role}-email`} name="email" type="email" placeholder="m@example.com" required className="bg-white/50 dark:bg-black/40 border-white/30 backdrop-blur-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${role}-dob`}>Date of Birth</Label>
                    <Input id={`${role}-dob`} name="dateOfBirth" type="date" required className="bg-white/50 dark:bg-black/40 border-white/30 backdrop-blur-sm" />
                    {role === 'student' && (
                      <p className="text-[10px] text-muted-foreground">Used to enable Kids Mode for users under 13.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${role}-password`}>Password</Label>
                    <Input id={`${role}-password`} name="password" type="password" required className="bg-white/50 dark:bg-black/40 border-white/30 backdrop-blur-sm" />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all" type="submit">
                    Sign up as {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
