"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Heart,
  Share2,
  Calendar,
  Users,
  Eye,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Flag,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/components/providers/session-provider"

const donationPresets = [25, 50, 100, 250, 500, 1000]

type CampaignDetail = {
  id: string
  title: string
  summary: string
  description: string
  category: string
  serviceType: string
  status: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  views: number
  favouriteCount: number
  startDate: string
  endDate: string
  coverImage: string
  createdAt: string
  organiser: { id: string; name: string; avatar?: string; isVerified: boolean }
  beneficiary: { name: string; relationship?: string; description?: string }
  updates: { id: string; title: string; content: string; createdAt: string }[]
  recentDonations: { id: string; donorName: string; isAnonymous: boolean; amount: number; message?: string; createdAt: string }[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { user: sessionUser } = useAuth()

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isFavourite, setIsFavourite] = useState(false)
  const [donationAmount, setDonationAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorMessage, setDonorMessage] = useState("")
  const [showDonationSuccess, setShowDonationSuccess] = useState(false)
  const [donationDialogOpen, setDonationDialogOpen] = useState(false)
  const [isDonating, setIsDonating] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState("")

  useEffect(() => {
    fetch(`/api/campaigns/${campaignId}`)
      .then((r) => r.json())
      .then((data) => setCampaign(data.campaign ?? null))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [campaignId])

  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) return
    setIsDonating(true)
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          amount: donationAmount,
          isAnonymous,
          message: donorMessage || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setConfirmationNumber(data.confirmationNumber)
        setShowDonationSuccess(true)
        // Update raised amount locally
        setCampaign((prev) =>
          prev
            ? { ...prev, raisedAmount: prev.raisedAmount + donationAmount, donorCount: prev.donorCount + 1 }
            : prev
        )
      }
    } catch {}
    setIsDonating(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-[400px] w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-2/3 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Campaign not found</h1>
          <Link href="/browse"><Button>Back to Browse</Button></Link>
        </main>
        <Footer />
      </div>
    )
  }

  const progress = (campaign.raisedAmount / campaign.targetAmount) * 100
  const daysRemaining = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/browse" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
              </Link>
              <span>/</span>
              <span>{campaign.category}</span>
              <span>/</span>
              <span className="text-foreground truncate max-w-[200px]">{campaign.title}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Hero */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
                {campaign.coverImage && (
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {campaign.organiser.isVerified && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge
                  className="absolute top-4 right-4"
                  variant={campaign.status === 'active' ? 'default' : 'secondary'}
                >
                  {campaign.status}
                </Badge>
              </div>

              {/* Title and Meta */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{campaign.category}</Badge>
                  <Badge variant="outline">{campaign.serviceType}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
                  {campaign.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={campaign.organiser.avatar} />
                      <AvatarFallback>{campaign.organiser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-foreground font-medium">{campaign.organiser.name}</span>
                      {campaign.organiser.isVerified && (
                        <CheckCircle2 className="h-3 w-3 text-primary inline ml-1" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">Views</span>
                  </div>
                  <p className="font-semibold text-foreground">{campaign.views.toLocaleString()}</p>
                </div>
                <div className="text-center border-x border-border">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">Favourites</span>
                  </div>
                  <p className="font-semibold text-foreground">{campaign.favouriteCount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Donors</span>
                  </div>
                  <p className="font-semibold text-foreground">{campaign.donorCount.toLocaleString()}</p>
                </div>
              </div>

              {/* Content Tabs */}
              <Tabs defaultValue="story" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="story">Story</TabsTrigger>
                  <TabsTrigger value="updates">Updates ({campaign.updates.length})</TabsTrigger>
                  <TabsTrigger value="donors">Recent Donors</TabsTrigger>
                </TabsList>

                <TabsContent value="story" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="prose prose-sm max-w-none text-foreground">
                        <h3 className="text-lg font-semibold mb-3">About This Campaign</h3>
                        <p className="text-muted-foreground mb-4">{campaign.summary}</p>
                        <div className="whitespace-pre-line text-muted-foreground">
                          {campaign.description}
                        </div>

                        <Separator className="my-6" />

                        <h4 className="text-base font-semibold mb-3">Beneficiary Information</h4>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="font-medium text-foreground">{campaign.beneficiary.name}</p>
                          {campaign.beneficiary.relationship && (
                            <p className="text-sm text-muted-foreground mt-1">{campaign.beneficiary.relationship}</p>
                          )}
                          {campaign.beneficiary.description && (
                            <p className="text-sm text-muted-foreground mt-1">{campaign.beneficiary.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="updates" className="mt-6">
                  <div className="space-y-4">
                    {campaign.updates.length > 0 ? campaign.updates.map((update) => (
                      <Card key={update.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-foreground">{update.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(update.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm">{update.content}</p>
                        </CardContent>
                      </Card>
                    )) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-muted-foreground">No updates yet</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="donors" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {campaign.recentDonations.length === 0 ? (
                          <p className="text-muted-foreground text-sm text-center py-4">No donations yet. Be the first!</p>
                        ) : campaign.recentDonations.map((donation) => (
                          <div key={donation.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {donation.isAnonymous ? '?' : donation.donorName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-foreground">{donation.donorName}</p>
                                <span className="font-semibold text-primary">
                                  {formatCurrency(donation.amount)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                              {donation.message && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  &ldquo;{donation.message}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(campaign.raisedAmount)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        of {formatCurrency(campaign.targetAmount)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{Math.round(progress)}% funded</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {daysRemaining} days left
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Users className="h-4 w-4" />
                    <span>{campaign.donorCount} donors have contributed</span>
                  </div>

                  <Dialog open={donationDialogOpen} onOpenChange={(open) => {
                    setDonationDialogOpen(open)
                    if (!open) { setShowDonationSuccess(false); setDonorMessage(""); setCustomAmount(""); setDonationAmount(50); setIsAnonymous(false) }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full mb-3" size="lg">
                        Donate Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      {!showDonationSuccess ? (
                        <>
                          <DialogHeader>
                            <DialogTitle>Make a Donation</DialogTitle>
                            <DialogDescription>
                              Support &ldquo;{campaign.title}&rdquo;
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div>
                              <Label className="text-sm font-medium mb-3 block">Select Amount</Label>
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                {donationPresets.map((amount) => (
                                  <Button
                                    key={amount}
                                    variant={donationAmount === amount && !customAmount ? "default" : "outline"}
                                    onClick={() => { setDonationAmount(amount); setCustomAmount("") }}
                                    className="h-12"
                                  >
                                    ${amount}
                                  </Button>
                                ))}
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  placeholder="Enter custom amount"
                                  value={customAmount}
                                  onChange={(e) => {
                                    setCustomAmount(e.target.value)
                                    if (e.target.value) setDonationAmount(parseFloat(e.target.value))
                                  }}
                                  className="pl-7"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="anonymous" className="text-sm">Donate anonymously</Label>
                              <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                            </div>

                            {sessionUser && !isAnonymous && (
                              <p className="text-sm text-muted-foreground">
                                Donating as <span className="font-medium text-foreground">{sessionUser.firstName} {sessionUser.lastName}</span>
                              </p>
                            )}

                            <div>
                              <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                                Leave a message (optional)
                              </Label>
                              <Textarea
                                id="message"
                                placeholder="Share some words of encouragement..."
                                value={donorMessage}
                                onChange={(e) => setDonorMessage(e.target.value)}
                                rows={3}
                              />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Donation amount</span>
                                <span>{formatCurrency(donationAmount || 0)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Platform fee</span>
                                <span>$0.00</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(donationAmount || 0)}</span>
                              </div>
                            </div>

                            <Button
                              onClick={handleDonate}
                              className="w-full"
                              size="lg"
                              disabled={!donationAmount || donationAmount <= 0 || isDonating}
                            >
                              {isDonating ? 'Processing...' : 'Complete Donation'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">Thank You!</h3>
                          <p className="text-muted-foreground mb-6">
                            Your donation of {formatCurrency(donationAmount)} has been processed successfully.
                          </p>
                          <Card className="bg-muted/50 mb-6">
                            <CardContent className="p-4 text-left">
                              <p className="text-xs text-muted-foreground mb-1">Confirmation Number</p>
                              <p className="font-mono font-medium">{confirmationNumber}</p>
                            </CardContent>
                          </Card>
                          <Button onClick={() => setDonationDialogOpen(false)} className="w-full">
                            Done
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-2">
                    <Button
                      variant={isFavourite ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setIsFavourite(!isFavourite)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavourite ? 'fill-current' : ''}`} />
                      {isFavourite ? 'Saved' : 'Save'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Organiser Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Organiser</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={campaign.organiser.avatar} />
                      <AvatarFallback>{campaign.organiser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-1">
                        {campaign.organiser.name}
                        {campaign.organiser.isVerified && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
