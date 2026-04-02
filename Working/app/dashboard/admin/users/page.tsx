"use client"

import { useState } from "react"
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
  Calendar,
  Download,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { users } from "@/lib/mock-data"
import { User } from "@/lib/types"

// Mock admin user
const adminUser = {
  displayName: 'Admin User',
  email: 'admin@fundbridge.org',
  role: 'Admin'
}

// Stats
const totalUsers = users.length
const activeUsers = users.filter(u => u.status === 'active').length
const suspendedUsers = users.filter(u => u.status === 'suspended').length
const fundRaisers = users.filter(u => u.role === 'fund_raiser').length
const donees = users.filter(u => u.role === 'donee').length

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'fund_raiser': return 'default'
      case 'donee': return 'secondary'
      case 'admin': return 'destructive'
      case 'platform_manager': return 'outline'
      default: return 'secondary'
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
      case 'active': return 'default'
      case 'suspended': return 'destructive'
      case 'inactive': return 'secondary'
      default: return 'outline'
    }
  }

  const handleAction = (user: User, action: string) => {
    setSelectedUser(user)
    setActionType(action)
    setActionDialogOpen(true)
  }

  const confirmAction = () => {
    // In real app, perform the action
    setActionDialogOpen(false)
    setSelectedUser(null)
    setActionType("")
  }

  return (
    <DashboardLayout 
      role="admin" 
      user={{
        name: adminUser.displayName,
        email: adminUser.email,
        role: 'Admin'
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={<Users className="h-5 w-5" />}
          description="All registered users"
        />
        <StatsCard
          title="Active Users"
          value={activeUsers.toString()}
          icon={<Activity className="h-5 w-5" />}
          description="Currently active"
        />
        <StatsCard
          title="Suspended"
          value={suspendedUsers.toString()}
          icon={<Ban className="h-5 w-5" />}
          description="Suspended accounts"
        />
        <StatsCard
          title="Fund Raisers"
          value={fundRaisers.toString()}
          icon={<UserPlus className="h-5 w-5" />}
          description="Campaign creators"
        />
        <StatsCard
          title="Donees"
          value={donees.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          description="Donors"
        />
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.lastLogin || user.createdAt).toLocaleDateString()}
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleAction(user, 'suspend')}>
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction(user, 'activate')}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user profile information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-lg">{selectedUser.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.displayName}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
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
                  <p className="font-medium">{new Date(selectedUser.lastLogin || selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                {selectedUser.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'suspend') }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { setShowUserDetail(false); handleAction(selectedUser, 'activate') }}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                )}
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'suspend' ? 'Suspend User?' :
               actionType === 'activate' ? 'Activate User?' :
               'Deactivate Account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'suspend' 
                ? `This will suspend ${selectedUser?.displayName}'s account. They will not be able to access the platform until reactivated.`
                : actionType === 'activate'
                ? `This will reactivate ${selectedUser?.displayName}'s account and restore their access.`
                : `This will permanently deactivate ${selectedUser?.displayName}'s account. This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={actionType === 'deactivate' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {actionType === 'suspend' ? 'Suspend' :
               actionType === 'activate' ? 'Activate' :
               'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
