"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Ban,
  Mail,
  Shield,
  Users,
  UserPlus,
  Activity,
  Download,
  Lock,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { useAuth } from "@/components/providers/session-provider"

type DbUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  role: string
  phone?: string | null
  location?: string | null
  avatar?: string | null
  bio?: string | null
  isVerified: boolean
  status: string
  createdAt: string
  lastLoginAt?: string | null
}

type AuditLogEntry = {
  id: string
  action: string
  description: string
  createdAt: string
  ipAddress?: string | null
}

export default function AdminUsersPage() {
  const { user: sessionUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (sessionUser && sessionUser.role === 'campaign_admin') {
      router.replace('/dashboard/admin/campaign-dashboard')
    }
  }, [sessionUser, router])

  const [allUsers, setAllUsers] = useState<DbUser[]>([])
  const [flaggedUserIds, setFlaggedUserIds] = useState<Set<string>>(new Set())
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [flaggedFilter, setFlaggedFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")

  const [userAuditLogs, setUserAuditLogs] = useState<AuditLogEntry[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        setAllUsers(data.users ?? [])
        setFlaggedUserIds(new Set(data.flaggedUserIds ?? []))
      })
      .catch(() => {})
      .finally(() => setIsLoadingUsers(false))
  }, [])

  const openUserDetail = (user: DbUser) => {
    setSelectedUser(user)
    setShowUserDetail(true)
    setUserAuditLogs([])
    setIsLoadingLogs(true)
    fetch(`/api/admin/users/${user.id}/audit-logs`)
      .then((r) => r.json())
      .then((data) => setUserAuditLogs(data.logs ?? []))
      .catch(() => {})
      .finally(() => setIsLoadingLogs(false))
  }

  const stats = useMemo(() => ({
    total: allUsers.length,
    active: allUsers.filter((u) => u.status === 'active').length,
    suspended: allUsers.filter((u) => u.status === 'suspended').length,
    fundRaisers: allUsers.filter((u) => u.role === 'fund_raiser').length,
    donees: allUsers.filter((u) => u.role === 'donee').length,
  }), [allUsers])

  const filteredUsers = useMemo(() => allUsers.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesFlagged =
      flaggedFilter === "all" ||
      (flaggedFilter === "flagged" && flaggedUserIds.has(user.id)) ||
      (flaggedFilter === "clean" && !flaggedUserIds.has(user.id))
    return matchesSearch && matchesRole && matchesStatus && matchesFlagged
  }), [allUsers, searchQuery, roleFilter, statusFilter, flaggedFilter, flaggedUserIds])

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'fund_raiser': return 'default' as const
      case 'donee': return 'secondary' as const
      case 'admin': return 'destructive' as const
      case 'platform_manager': return 'outline' as const
      default: return 'secondary' as const
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'fund_raiser': return 'Fund Raiser'
      case 'donee': return 'Donee'
      case 'admin': return 'Admin'
      case 'platform_manager': return 'Platform Manager'
      default: return role
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default' as const
      case 'suspended': return 'destructive' as const
      case 'frozen': return 'destructive' as const
      case 'deactivated': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      account_suspended: 'Account Suspended',
      account_activated: 'Account Activated',
      account_deactivated: 'Account Deactivated',
      account_frozen: 'Account Frozen',
      account_unfrozen: 'Account Unfrozen',
      campaign_approved: 'Campaign Approved',
      campaign_rejected: 'Campaign Rejected',
      campaign_under_review: 'Campaign Under Review',
      report_resolved: 'Report Resolved',
      report_dismissed: 'Report Dismissed',
      admin_login: 'Admin Login',
      password_changed: 'Password Changed',
      profile_updated: 'Profile Updated',
      donation_made: 'Donation Made',
      campaign_created: 'Campaign Created',
      campaign_published: 'Campaign Published',
    }
    return map[action] ?? action
  }

  const handleAction = (user: DbUser, action: string) => {
    setSelectedUser(user)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return
    setActionDialogOpen(false)

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType }),
      })

      if (res.ok) {
        const { status: newStatus } = await res.json()
        setAllUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
        )
        if (actionType === 'freeze' || actionType === 'suspend') {
          setFlaggedUserIds((prev) => new Set([...prev, selectedUser.id]))
        }
      }
    } catch {}

    setSelectedUser(null)
    setActionType("")
  }

  const getActionDialogContent = () => {
    if (!selectedUser) return { title: '', description: '', buttonLabel: '', danger: false }
    switch (actionType) {
      case 'suspend':
        return { title: 'Suspend User?', description: `This will suspend ${selectedUser.displayName}'s account. They will not be able to access the platform until reactivated.`, buttonLabel: 'Suspend', danger: false }
      case 'activate':
        return { title: 'Activate User?', description: `This will reactivate ${selectedUser.displayName}'s account and restore their access.`, buttonLabel: 'Activate', danger: false }
      case 'freeze':
        return { title: 'Freeze Account?', description: `This will temporarily freeze ${selectedUser.displayName}'s account pending investigation.`, buttonLabel: 'Freeze Account', danger: false }
      case 'unfreeze':
        return { title: 'Unfreeze Account?', description: `This will restore ${selectedUser.displayName}'s account access.`, buttonLabel: 'Unfreeze', danger: false }
      case 'deactivate':
        return { title: 'Deactivate Account?', description: `This will permanently deactivate ${selectedUser.displayName}'s account. This action cannot be easily undone.`, buttonLabel: 'Deactivate', danger: true }
      default:
        return { title: '', description: '', buttonLabel: 'Confirm', danger: false }
    }
  }

  const dialog = getActionDialogContent()

  const sidebarUser = sessionUser
    ? { name: `${sessionUser.firstName} ${sessionUser.lastName}`, email: sessionUser.email, role: sessionUser.role }
    : undefined

  return (
    <DashboardLayout role="admin" user={sidebarUser}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard title="Total Users" value={stats.total.toString()} icon={<Users className="h-5 w-5" />} description="All registered users" />
        <StatsCard title="Active Users" value={stats.active.toString()} icon={<Activity className="h-5 w-5" />} description="Currently active" />
        <StatsCard title="Suspended" value={stats.suspended.toString()} icon={<Ban className="h-5 w-5" />} description="Suspended accounts" />
        <StatsCard title="Fund Raisers" value={stats.fundRaisers.toString()} icon={<UserPlus className="h-5 w-5" />} description="Campaign creators" />
        <StatsCard title="Donees" value={stats.donees.toString()} icon={<UserCheck className="h-5 w-5" />} description="Donors" />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="fund_raiser">Fund Raiser</SelectItem>
                <SelectItem value="donee">Donee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="platform_manager">Platform Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="flagged">Flagged Activity</SelectItem>
                <SelectItem value="clean">No Flags</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoadingUsers ? (
            <div className="py-16 text-center text-muted-foreground">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar ?? undefined} />
                          <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {flaggedUserIds.has(user.id) && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Flagged
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-AU')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.lastLoginAt || user.createdAt).toLocaleDateString('en-AU')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openUserDetail(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Quick View
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/users/${user.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Full Profile & History
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <>
                              <DropdownMenuItem onClick={() => handleAction(user, 'freeze')}>
                                <Lock className="h-4 w-4 mr-2" />
                                Freeze Account
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction(user, 'suspend')}>
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            </>
                          ) : user.status === 'frozen' ? (
                            <DropdownMenuItem onClick={() => handleAction(user, 'unfreeze')}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Unfreeze Account
                            </DropdownMenuItem>
                          ) : user.status === 'suspended' ? (
                            <DropdownMenuItem onClick={() => handleAction(user, 'activate')}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Reactivate User
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleAction(user, 'deactivate')}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Deactivate Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user profile information and account history</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="profile">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">Account History</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 pt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar ?? undefined} />
                    <AvatarFallback className="text-lg">{selectedUser.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedUser.displayName}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>{getRoleLabel(selectedUser.role)}</Badge>
                      <Badge variant={getStatusBadgeVariant(selectedUser.status)}>{selectedUser.status}</Badge>
                      {flaggedUserIds.has(selectedUser.id) && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Flagged
                        </Badge>
                      )}
                      {selectedUser.isVerified && <Badge variant="outline">Verified</Badge>}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedUser.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('en-AU')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Login</p>
                    <p className="font-medium">{new Date(selectedUser.lastLoginAt || selectedUser.createdAt).toLocaleDateString('en-AU')}</p>
                  </div>
                </div>

                {selectedUser.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Bio</p>
                      <p className="text-sm">{selectedUser.bio}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  {selectedUser.status === 'active' ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'freeze') }}>
                        <Lock className="h-4 w-4 mr-2" />
                        Freeze
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'suspend') }}>
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                    </>
                  ) : selectedUser.status === 'frozen' ? (
                    <Button variant="outline" size="sm" onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'unfreeze') }}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Unfreeze
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'activate') }}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Reactivate
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email User
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                {isLoadingLogs ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Loading history...</p>
                ) : (
                  <div className="space-y-3">
                    {userAuditLogs.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-6">No account history available.</p>
                    ) : (
                      userAuditLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{getActionLabel(log.action)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{log.description}</p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                              {log.ipAddress && (
                                <span className="text-xs text-muted-foreground">IP: {log.ipAddress}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={dialog.danger ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {dialog.buttonLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
