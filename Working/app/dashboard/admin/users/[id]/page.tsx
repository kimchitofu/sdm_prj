'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield,
  DollarSign, Heart, FileText, AlertTriangle, Activity,
  CheckCircle, XCircle, Clock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/components/providers/session-provider'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone: string | null
  location: string | null
  avatar: string | null
  bio: string | null
  isVerified: boolean
  status: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  campaigns: {
    id: string; title: string; category: string; status: string
    targetAmount: number; raisedAmount: number; donorCount: number; createdAt: string
  }[]
  donations: {
    id: string; amount: number; isAnonymous: boolean; status: string; createdAt: string
    campaign: { id: string; title: string }
  }[]
  auditLogs: {
    id: string; action: string; description: string; performedBy: string; createdAt: string
  }[]
  reports: {
    id: string; reason: string; status: string; createdAt: string
    campaign: { id: string; title: string }
  }[]
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    frozen: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    deactivated: 'bg-gray-100 text-gray-800',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function roleBadge(role: string) {
  const labels: Record<string, string> = {
    admin: 'Admin', fund_raiser: 'Fund Raiser', donee: 'Donee', platform_manager: 'Platform Manager',
  }
  return <Badge variant="secondary">{labels[role] ?? role}</Badge>
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user: sessionUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/users/${id}/profile`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => { if (d) setProfile(d.user) })
      .finally(() => setIsLoading(false))
  }, [id])

  const totalDonated = profile?.donations.reduce((s, d) => s + d.amount, 0) ?? 0
  const totalRaised = profile?.campaigns.reduce((s, c) => s + c.raisedAmount, 0) ?? 0

  if (isLoading) {
    return (
      <DashboardLayout role="admin" user={sessionUser ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email, avatar: sessionUser.avatar, role: 'Admin',
      } : undefined}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (notFound || !profile) {
    return (
      <DashboardLayout role="admin" user={sessionUser ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email, avatar: sessionUser.avatar, role: 'Admin',
      } : undefined}>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <User className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">User not found</h2>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/admin/users"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Users</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      role="admin"
      user={sessionUser ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        email: sessionUser.email, avatar: sessionUser.avatar, role: 'Admin',
      } : undefined}
    >
      {/* Back */}
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/dashboard/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Management
        </Link>
      </Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={profile.avatar ?? undefined} />
              <AvatarFallback className="text-2xl">
                {profile.firstName[0]}{profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                {roleBadge(profile.role)}
                {statusBadge(profile.status)}
                {profile.isVerified && (
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{profile.email}</span>
                {profile.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>}
                {profile.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Joined {new Date(profile.createdAt).toLocaleDateString('en-AU')}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Last login {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString('en-AU') : 'Never'}</span>
              </div>
              {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Campaigns</p>
          <p className="mt-1 text-2xl font-bold">{profile.campaigns.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Raised</p>
          <p className="mt-1 text-2xl font-bold">${totalRaised.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Donations Made</p>
          <p className="mt-1 text-2xl font-bold">{profile.donations.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Donated</p>
          <p className="mt-1 text-2xl font-bold">${totalDonated.toLocaleString()}</p>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns">
        <TabsList className="mb-4">
          <TabsTrigger value="campaigns"><FileText className="mr-1.5 h-4 w-4" />Campaigns ({profile.campaigns.length})</TabsTrigger>
          <TabsTrigger value="donations"><DollarSign className="mr-1.5 h-4 w-4" />Donations ({profile.donations.length})</TabsTrigger>
          <TabsTrigger value="reports"><AlertTriangle className="mr-1.5 h-4 w-4" />Reports ({profile.reports.length})</TabsTrigger>
          <TabsTrigger value="audit"><Activity className="mr-1.5 h-4 w-4" />Audit Log ({profile.auditLogs.length})</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader><CardTitle className="text-base">Campaign History</CardTitle></CardHeader>
            <CardContent className="p-0">
              {profile.campaigns.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No campaigns created.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Raised</TableHead>
                      <TableHead>Donors</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.campaigns.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{c.category}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell>${c.targetAmount.toLocaleString()}</TableCell>
                        <TableCell>${c.raisedAmount.toLocaleString()}</TableCell>
                        <TableCell>{c.donorCount}</TableCell>
                        <TableCell>{new Date(c.createdAt).toLocaleDateString('en-AU')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations">
          <Card>
            <CardHeader><CardTitle className="text-base">Donation History</CardTitle></CardHeader>
            <CardContent className="p-0">
              {profile.donations.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No donations made.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Anonymous</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.donations.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.campaign.title}</TableCell>
                        <TableCell>${d.amount.toLocaleString()}</TableCell>
                        <TableCell>{d.isAnonymous ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                        <TableCell>{statusBadge(d.status)}</TableCell>
                        <TableCell>{new Date(d.createdAt).toLocaleDateString('en-AU')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader><CardTitle className="text-base">Reports Filed</CardTitle></CardHeader>
            <CardContent className="p-0">
              {profile.reports.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No reports filed.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.reports.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.campaign.title}</TableCell>
                        <TableCell>{r.reason}</TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell>{new Date(r.createdAt).toLocaleDateString('en-AU')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle className="text-base">Account Audit Log</CardTitle></CardHeader>
            <CardContent className="p-0">
              {profile.auditLogs.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No audit events recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.auditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell><Badge variant="outline" className="font-mono text-xs">{log.action}</Badge></TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>{log.performedBy}</TableCell>
                        <TableCell>{new Date(log.createdAt).toLocaleDateString('en-AU')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
