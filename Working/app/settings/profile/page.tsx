"use client"

import { useMemo, useState } from "react"
import {
  Bell,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { users } from "@/lib/mock-data"

const fundRaiserUser = users.find((u) => u.role === "fund_raiser") || users[1]

export default function ProfileSettingsPage() {
  const displayName = useMemo(() => {
    return (fundRaiserUser as { displayName?: string; name?: string })?.displayName ||
      (fundRaiserUser as { displayName?: string; name?: string })?.name ||
      "Fund Raiser User"
  }, [])

  const email = (fundRaiserUser as { email?: string }).email || "user@example.com"
  const avatar = (fundRaiserUser as { avatar?: string }).avatar

  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: displayName,
    email,
    phone: "+65 9123 4567",
    location: "Singapore",
    bio: "Running fundraising campaigns for community and social impact causes.",
    emailNotifications: "all",
    profileVisibility: "public",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1800)
  }

  return (
    <DashboardLayout
      role="fund_raiser"
      user={{
        name: displayName,
        email,
        avatar,
        role: "Fund Raiser",
      }}
    >
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account details, public profile information, and notification preferences.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Update your personal and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateField("location", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Profile bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={5}
                    placeholder="Tell supporters a little about yourself or your organisation."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Preferences</CardTitle>
                <CardDescription>Control how updates and profile information are shown.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email notifications</Label>
                    <Select
                      value={formData.emailNotifications}
                      onValueChange={(value) => updateField("emailNotifications", value)}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select notification preference" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All notifications</SelectItem>
                        <SelectItem value="important">Important only</SelectItem>
                        <SelectItem value="minimal">Minimal updates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile visibility</Label>
                    <Select
                      value={formData.profileVisibility}
                      onValueChange={(value) => updateField("profileVisibility", value)}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select profile visibility" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Change your password and keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => updateField("currentPassword", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => updateField("newPassword", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{formData.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">{formData.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant="secondary">Fund Raiser</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Account status</span>
                    <Badge className="bg-azure-100 text-azure-700 hover:bg-azure-100">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Profile visibility</span>
                    <span className="font-medium capitalize text-foreground">{formData.profileVisibility}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Notifications</span>
                    <span className="font-medium capitalize text-foreground">{formData.emailNotifications}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Save Changes</CardTitle>
                <CardDescription>Your changes will update your account profile details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="mb-2 text-xl">Settings saved</DialogTitle>
            <DialogDescription>
              Your profile settings have been updated successfully.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
