"use client"

import { useState, useMemo } from "react"
import {
  Flag,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { campaignReports, messageReports } from "@/lib/mock-data"
import type { CampaignReport, MessageReport, ReportStatus } from "@/lib/types"

const adminUser = {
  displayName: 'Super Admin',
  email: 'admin@gmail.com',
}

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  fraud: 'Fraud',
  inappropriate_content: 'Inappropriate Content',
  misleading_information: 'Misleading Information',
  harassment: 'Harassment',
  copyright_violation: 'Copyright Violation',
  other: 'Other',
}

const statusConfig: Record<ReportStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  under_review: { label: 'Under Review', variant: 'default' },
  resolved: { label: 'Resolved', variant: 'outline' },
  dismissed: { label: 'Dismissed', variant: 'outline' },
}

export default function ReportsQueuePage() {
  const [cReports, setCReports] = useState<CampaignReport[]>(campaignReports)
  const [mReports, setMReports] = useState<MessageReport[]>(messageReports)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCReport, setSelectedCReport] = useState<CampaignReport | null>(null)
  const [selectedMReport, setSelectedMReport] = useState<MessageReport | null>(null)
  const [showCDetail, setShowCDetail] = useState(false)
  const [showMDetail, setShowMDetail] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string>("")
  const [resolutionNote, setResolutionNote] = useState("")
  const [actionTarget, setActionTarget] = useState<'campaign' | 'message'>('campaign')

  const allPending = cReports.filter(r => r.status === 'pending').length + mReports.filter(r => r.status === 'pending').length
  const allUnderReview = cReports.filter(r => r.status === 'under_review').length + mReports.filter(r => r.status === 'under_review').length
  const allResolved = cReports.filter(r => r.status === 'resolved' || r.status === 'dismissed').length +
    mReports.filter(r => r.status === 'resolved' || r.status === 'dismissed').length

  const filteredCReports = useMemo(() => cReports.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      r.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reasonLabels[r.reason]?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }), [cReports, statusFilter, searchQuery])

  const filteredMReports = useMemo(() => mReports.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      r.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.messageContent.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }), [mReports, statusFilter, searchQuery])

  const handleCAction = (report: CampaignReport, action: string) => {
    setSelectedCReport(report)
    setActionType(action)
    setActionTarget('campaign')
    setResolutionNote("")
    setActionDialogOpen(true)
  }

  const handleMAction = (report: MessageReport, action: string) => {
    setSelectedMReport(report)
    setActionType(action)
    setActionTarget('message')
    setResolutionNote("")
    setActionDialogOpen(true)
  }

  const confirmAction = () => {
    const newStatus: ReportStatus = actionType === 'resolve' ? 'resolved' : actionType === 'dismiss' ? 'dismissed' : 'under_review'
    if (actionTarget === 'campaign' && selectedCReport) {
      setCReports(prev => prev.map(r =>
        r.id === selectedCReport.id
          ? { ...r, status: newStatus, resolvedBy: adminUser.displayName, resolvedAt: new Date().toISOString(), resolution: resolutionNote }
          : r
      ))
    } else if (actionTarget === 'message' && selectedMReport) {
      setMReports(prev => prev.map(r =>
        r.id === selectedMReport.id ? { ...r, status: newStatus } : r
      ))
    }
    setActionDialogOpen(false)
    setShowCDetail(false)
    setShowMDetail(false)
    setSelectedCReport(null)
    setSelectedMReport(null)
  }

  const dialogContent = (() => {
    switch (actionType) {
      case 'resolve':
        return { title: 'Resolve Report?', description: 'Mark this report as resolved. Please add a resolution note.', buttonLabel: 'Resolve', danger: false }
      case 'dismiss':
        return { title: 'Dismiss Report?', description: 'Dismiss this report as unfounded. The reported content will remain on the platform.', buttonLabel: 'Dismiss', danger: false }
      case 'under_review':
        return { title: 'Mark as Under Review?', description: 'This report will be marked as under review while being investigated.', buttonLabel: 'Mark Under Review', danger: false }
      default:
        return { title: '', description: '', buttonLabel: 'Confirm', danger: false }
    }
  })()

  return (
    <DashboardLayout
      role="user_admin"
      user={{ name: adminUser.displayName, email: adminUser.email, role: 'Admin' }}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Reports Queue</h1>
        <p className="text-muted-foreground">Manage reported campaigns and flagged messages from users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard title="Pending" value={allPending.toString()} icon={<Flag className="h-5 w-5" />} description="Awaiting review" />
        <StatsCard title="Under Review" value={allUnderReview.toString()} icon={<Eye className="h-5 w-5" />} description="Being investigated" />
        <StatsCard title="Resolved / Dismissed" value={allResolved.toString()} icon={<CheckCircle className="h-5 w-5" />} description="Closed reports" />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Campaign Reports vs Message Reports */}
      <Tabs defaultValue="campaigns">
        <TabsList className="mb-4">
          <TabsTrigger value="campaigns" className="gap-2">
            <Flag className="h-4 w-4" />
            Reported Campaigns
            {allPending > 0 && <Badge variant="destructive" className="ml-1 text-xs px-1.5">{cReports.filter(r => r.status === 'pending').length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Reported Messages
            {mReports.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5">{mReports.filter(r => r.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Campaign Reports */}
        <TabsContent value="campaigns">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium max-w-[180px]">
                        <p className="truncate">{report.campaignTitle}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{report.reportedByName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{reasonLabels[report.reason]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[report.status].variant} className="text-xs">
                          {statusConfig[report.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedCReport(report); setShowCDetail(true) }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(report.status === 'pending' || report.status === 'under_review') && (
                            <>
                              <Button size="sm" variant="ghost" className="text-blue-500"
                                onClick={() => handleCAction(report, 'under_review')}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-green-600"
                                onClick={() => handleCAction(report, 'resolve')}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-muted-foreground"
                                onClick={() => handleCAction(report, 'dismiss')}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No campaign reports found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Reports */}
        <TabsContent value="messages">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm text-muted-foreground italic">
                          &quot;{report.messageContent.slice(0, 60)}...&quot;
                        </p>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{report.senderName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{report.reportedByName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{reasonLabels[report.reason]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[report.status].variant} className="text-xs">
                          {statusConfig[report.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedMReport(report); setShowMDetail(true) }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(report.status === 'pending' || report.status === 'under_review') && (
                            <>
                              <Button size="sm" variant="ghost" className="text-green-600"
                                onClick={() => handleMAction(report, 'resolve')}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-muted-foreground"
                                onClick={() => handleMAction(report, 'dismiss')}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No message reports found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Report Detail Dialog */}
      <Dialog open={showCDetail} onOpenChange={setShowCDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Campaign Report Details</DialogTitle>
            <DialogDescription>Review the full report before taking action.</DialogDescription>
          </DialogHeader>
          {selectedCReport && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Campaign</p>
                <p className="font-medium">{selectedCReport.campaignTitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Reported By</p>
                  <p className="font-medium">{selectedCReport.reportedByName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reason</p>
                  <Badge variant="outline">{reasonLabels[selectedCReport.reason]}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedCReport.status].variant}>
                    {statusConfig[selectedCReport.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Reported</p>
                  <p className="font-medium">{new Date(selectedCReport.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reporter&apos;s Description</p>
                <p className="text-sm bg-muted rounded p-3">{selectedCReport.description}</p>
              </div>
              {selectedCReport.resolution && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolution Note</p>
                  <p className="text-sm">{selectedCReport.resolution}</p>
                </div>
              )}
              {(selectedCReport.status === 'pending' || selectedCReport.status === 'under_review') && (
                <div className="flex gap-2 flex-wrap pt-2">
                  <Button size="sm" className="text-blue-500" variant="outline"
                    onClick={() => { setShowCDetail(false); handleCAction(selectedCReport, 'under_review') }}>
                    Mark Under Review
                  </Button>
                  <Button size="sm" className="text-green-600" variant="outline"
                    onClick={() => { setShowCDetail(false); handleCAction(selectedCReport, 'resolve') }}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                  </Button>
                  <Button size="sm" variant="outline"
                    onClick={() => { setShowCDetail(false); handleCAction(selectedCReport, 'dismiss') }}>
                    <XCircle className="h-4 w-4 mr-1" /> Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Report Detail Dialog */}
      <Dialog open={showMDetail} onOpenChange={setShowMDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message Report Details</DialogTitle>
            <DialogDescription>Review the flagged message before taking action.</DialogDescription>
          </DialogHeader>
          {selectedMReport && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Flagged Message Content</p>
                <div className="bg-muted rounded p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500 inline mr-1" />
                  {selectedMReport.messageContent}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sender</p>
                  <p className="font-medium">{selectedMReport.senderName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reported By</p>
                  <p className="font-medium">{selectedMReport.reportedByName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reason</p>
                  <Badge variant="outline">{reasonLabels[selectedMReport.reason]}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedMReport.status].variant}>
                    {statusConfig[selectedMReport.status].label}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reporter&apos;s Description</p>
                <p className="text-sm bg-muted rounded p-3">{selectedMReport.description}</p>
              </div>
              {(selectedMReport.status === 'pending' || selectedMReport.status === 'under_review') && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="text-green-600" variant="outline"
                    onClick={() => { setShowMDetail(false); handleMAction(selectedMReport, 'resolve') }}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                  </Button>
                  <Button size="sm" variant="outline"
                    onClick={() => { setShowMDetail(false); handleMAction(selectedMReport, 'dismiss') }}>
                    <XCircle className="h-4 w-4 mr-1" /> Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <Label htmlFor="resolution" className="text-sm">Resolution Note (optional)</Label>
            <Textarea
              id="resolution"
              placeholder="Add a note explaining the resolution..."
              value={resolutionNote}
              onChange={e => setResolutionNote(e.target.value)}
              className="mt-1.5 text-sm"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {dialogContent.buttonLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
