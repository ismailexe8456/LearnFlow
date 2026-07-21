import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Users, Database, ShieldAlert } from 'lucide-react'

export function AdminDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">Admin Control Panel</h2>
          <p className="text-muted-foreground">System-wide overview and master controls.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Maintenance Mode
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 MB</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle>Impersonate User</CardTitle>
          <CardDescription>Switch into Student or Teacher mode directly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Select a role to preview the platform from their perspective.</p>
          <div className="flex gap-4">
            <Button variant="outline">Preview as Teacher</Button>
            <Button variant="outline">Preview as Student</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
