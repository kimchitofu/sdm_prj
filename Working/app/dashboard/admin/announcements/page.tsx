'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Plus, Trash2, BellOff, Bell, AlertTriangle, Info, Wrench, Siren } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/components/providers/session-provider'

interface Announcement {
  id: string
  title: string
  message: string
  type: string
  status: string
  expiresAt: string | null
  createdAt: string
  createdBy: { firstName: string; lastName: string }
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  info:        { label: 'Info',        icon: <Info className="h-4 w-4" />,         variant: 'default',     color: 'bg-blue-50 border-blue-200' },
  warning:     { label: 'Warning',     icon: <AlertTriangle className="h-4 w-4" />, variant: 'secondary',   color: 'bg-yellow-50 border-yellow-200' },
  maintenance: { label: 'Maintenance', icon: <Wrench className="h-4 w-4" />,        variant: 'outline',     color: 'bg-orange-50 border-orange-200' },
  urgent:      { label: 'Urgent',      icon: <Siren className="h-4 w-4" />,         variant: 'destructive', color: 'bg-red-50 border-red-200' },
}

export default function AnnouncementsPage() {
  const { user: sessionUser } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    expiresAt: '',
  })

  const fetchAnnouncements = () => {
    setIsLoading(true)
    fetch('/api/admin/announcements')
      .then(r => r.json())
      .then(d => setAnnouncements(d.announcements ?? []))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchAnnouncements() }, [])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          type: form.type,
          expiresAt: form.expiresAt || null,
        }),
      })
      if (res.ok) {
        setShowCreate(false)
        setForm({ title: '', message: '', type: 'info', expiresAt: '' })
        fetchAnnouncements()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (announcement: Announcement) => {
    const newStatus = announcement.status === 'active' ? 'inactive' : 'active'
    await fetch(`/api/admin/announcements/${announcement.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchAnnouncements()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/admin/announcements/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchAnnouncements()
  }

  const activeCount = announcements.filter(a => a.status === 'active').length

  return (
    <DashboardLayout
      role="admin"
      user={sessionUser ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email,
        avatar: sessionUser.avatar,
        role: 'Admin',
      } : undefined}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="mt-1 text-muted-foreground">
            Broadcast platform-wide messages to all users.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['info', 'warning', 'maintenance', 'urgent'] as const).map(type => {
          const cfg = typeConfig[type]
          const count = announcements.filter(a => a.type === type && a.status === 'active').length
          return (
            <Card key={type}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-muted p-2">{cfg.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">Active {cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            All Announcements
            {activeCount > 0 && (
              <Badge variant="default">{activeCount} active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : announcements.length === 0 ? (
            <div className="py-16 text-center">
              <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="font-semibold">No announcements yet</p>
              <p className="text-sm text-muted-foreground">Create one to broadcast a message to all users.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => {
                const cfg = typeConfig[a.type] ?? typeConfig.info
                const isExpired = a.expiresAt && new Date(a.expiresAt) < new Date()
                return (
                  <div
                    key={a.id}
                    className={`flex items-start justify-between rounded-lg border p-4 ${a.status === 'active' && !isExpired ? cfg.color : 'bg-muted/30'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{cfg.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{a.title}</p>
                          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                          {a.status === 'inactive' && <Badge variant="outline">Inactive</Badge>}
                          {isExpired && <Badge variant="outline">Expired</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Posted by {a.createdBy.firstName} {a.createdBy.lastName} · {new Date(a.createdAt).toLocaleDateString('en-AU')}
                          {a.expiresAt && ` · Expires ${new Date(a.expiresAt).toLocaleDateString('en-AU')}`}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(a)}
                      >
                        {a.status === 'active' ? (
                          <><BellOff className="mr-1 h-3 w-3" /> Deactivate</>
                        ) : (
                          <><Bell className="mr-1 h-3 w-3" /> Activate</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(a.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Scheduled maintenance on Sunday"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea
                placeholder="Full message visible to all users…"
                rows={4}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Expires on (optional)</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.title || !form.message}>
              {saving ? 'Sending…' : 'Send Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the announcement. Users will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
