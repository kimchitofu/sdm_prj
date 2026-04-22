"use client"

import { useState, useMemo, useEffect } from "react"
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
  Unlock,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { users, auditLogs } from "@/lib/mock-data"
import { User } from "@/lib/types"
import { getRegisteredUsers } from "@/lib/utils"

const adminUser = {
  displayName: 'Super Admin',
  email: 'admin@gmail.com',
  role: 'Admin'
}

// Flagged user IDs (users with suspicious audit activity)
const flaggedUserIds = new Set(
  auditLogs
    .filter(l => l.action === 'account_frozen' || l.action === 'account_suspended')
    .map(l => l.userId)
)

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [flaggedFilter, setFlaggedFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([])

  useEffect(() => {
    setRegisteredUsers(getRegisteredUsers() as User[])
  }, [])

  const allUsers = useMemo(() => {
    const existingEmails = new Set(users.map(u => u.email.toLowerCase()))
    const newUsers = registeredUsers.filter(u => !existingEmails.has(u.email.toLowerCase()))
    return [...users, ...newUsers]
  }, [registeredUsers])

  const stats = useMemo(() => ({
    total: allUsers.length,
    active: allUsers.filter(u => u.status === 'active').length,
    suspended: allUsers.filter(u => u.status === 'suspended').length,
    fundRaisers: allUsers.filter(u => u.role === 'fund_raiser').length,
    donees: allUsers.filter(u => u.role === 'donee').length,
  }), [allUsers])

  const filteredUsers = useMemo(() => allUsers.filter(user => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesFlagged = flaggedFilter === "all" ||
      (flaggedFilter === "flagged" && flaggedUserIds.has(user.id)) ||
      (flaggedFilter === "clean" && !flaggedUserIds.has(user.id))
    return matchesSearch && matchesRole && matchesStatus && matchesFlagged
  }), [allUsers, searchQuery, roleFilter, statusFilter, flaggedFilter])

  const getUserAuditLogs = (userId: string) =>
    auditLogs.filter(l => l.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'fund_raiser': return 'default' as const
      case 'donee': return 'secondary' as const
      case 'user_admin': return 'destructive' as const
      case 'platform_management': return 'outline' as const
      default: return 'secondary' as const
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'fund_raiser': return 'Fund Raiser'
      case 'donee': return 'Donee'
      case 'user_admin': return 'Admin'
      case 'platform_management': return 'Platform Manager'
      default: return role
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default' as const
      case 'suspended': return 'destructive' as const
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

  const handleAction = (user: User, action: string) => {
    setSelectedUser(user)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const confirmAction = () => {
    setActionDialogOpen(false)
    setSelectedUser(null)
    setActionType("")
  }

  const getActionDialogContent = () => {
    if (!selectedUser) return { title: '', description: '', buttonLabel: '', danger: false }
    switch (actionType) {
      case 'suspend':
        return {
          title: 'Suspend User?',
          description: `This will suspend ${selectedUser.displayName}'s account. They will not be able to access the platform until reactivated.`,
          buttonLabel: 'Suspend',
          danger: false,
        }
      case 'activate':
        return {
          title: 'Activate User?',
          description: `This will reactivate ${selectedUser.displayName}'s account and restore their access.`,
          buttonLabel: 'Activate',
          danger: false,
        }
      case 'freeze':
        return {
          title: 'Freeze Account?',
          description: `This will temporarily freeze ${selectedUser.displayName}'s account pending investigation. They will be notified via email.`,
          buttonLabel: 'Freeze Account',
          danger: false,
        }
      case 'unfreeze':
        return {
          title: 'Unfreeze Account?',
          description: `This will restore ${selectedUser.displayName}'s account access.`,
          buttonLabel: 'Unfreeze',
          danger: false,
        }
      case 'deactivate':
        return {
          title: 'Deactivate Account?',
          description: `This will permanently deactivate ${selectedUser.displayName}'s account. This action cannot be easily undone.`,
          buttonLabel: 'Deactivate',
          danger: true,
        }
      default:
        return { title: '', description: '', buttonLabel: 'Confirm', danger: false }
    }
  }

  const dialog = getActionDialogContent()

  return (
    <DashboardLayout
      role="admin"
      user={{
        name: adminUser.displayName,
        email: adminUser.email,
        role: 'admin'
      }}
    >
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
                <SelectItem value="user_admin">Admin</SelectItem>
                <SelectItem value="platform_management">Platform Manager</SelectItem>
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            {/* SA-UC09: Flagged Activity Filter */}
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
                        <AvatarImage src={user.avatar} />
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
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.lastLoginAt || user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowUserDetail(true) }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details & History
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

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 pt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar} />
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
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Login</p>
                    <p className="font-medium">{new Date(selectedUser.lastLoginAt || selectedUser.createdAt).toLocaleDateString()}</p>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'freeze') }}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Freeze
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'suspend') }}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'activate') }}
                    >
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

              {/* Account History Tab */}
              <TabsContent value="history" className="pt-4">
                <div className="space-y-3">
                  {getUserAuditLogs(selectedUser.id).length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">No account history available.</p>
                  ) : (
                    getUserAuditLogs(selectedUser.id).map((log) => (
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
