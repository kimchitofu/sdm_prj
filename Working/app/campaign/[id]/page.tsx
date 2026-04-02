"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  Heart, 
  Share2, 
  Calendar, 
  MapPin, 
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
  MessageCircle
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
import { PublicNavbar } from "@/components/layout/public-navbar"
import { Footer } from "@/components/layout/footer"
import { CampaignCard } from "@/components/campaigns/campaign-card"
import { campaigns, donations, campaignUpdates } from "@/lib/mock-data"

const donationPresets = [25, 50, 100, 250, 500, 1000]

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  
  const campaign = campaigns.find(c => c.id === campaignId) || campaigns[0]
  const relatedCampaigns = campaigns.filter(c => c.category === campaign.category && c.id !== campaign.id).slice(0, 3)
  const campaignDonations = donations.filter(d => d.campaignId === campaign.id).slice(0, 5)
  const updates = campaignUpdates.filter(u => u.campaignId === campaign.id)
  
  const [isFavourite, setIsFavourite] = useState(false)
  const [donationAmount, setDonationAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorMessage, setDonorMessage] = useState("")
  const [showDonationSuccess, setShowDonationSuccess] = useState(false)
  const [donationDialogOpen, setDonationDialogOpen] = useState(false)
  
  const progress = (campaign.raisedAmount / campaign.targetAmount) * 100
  const daysRemaining = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  
  const handleDonate = () => {
    setShowDonationSuccess(true)
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

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
                <img 
                  src={campaign.coverImage} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                {campaign.isVerified && (
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
                    <MapPin className="h-4 w-4" />
                    {campaign.location}
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
                  <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
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
                          <p className="text-sm text-muted-foreground mt-1">{campaign.beneficiary.relationship}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="updates" className="mt-6">
                  <div className="space-y-4">
                    {updates.length > 0 ? updates.map((update) => (
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
                          <p className="text-sm text-muted-foreground/70">Check back later for campaign updates</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="donors" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {campaignDonations.map((donation) => (
                          <div key={donation.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {donation.isAnonymous ? '?' : donation.donorName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-foreground">
                                  {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                                </p>
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
                    <Progress value={progress} className="h-3 mb-2" />
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

                  <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
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
                                    variant={donationAmount === amount ? "default" : "outline"}
                                    onClick={() => {
                                      setDonationAmount(amount)
                                      setCustomAmount("")
                                    }}
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
                                    if (e.target.value) {
                                      setDonationAmount(parseFloat(e.target.value))
                                    }
                                  }}
                                  className="pl-7"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="anonymous" className="text-sm">Donate anonymously</Label>
                              <Switch
                                id="anonymous"
                                checked={isAnonymous}
                                onCheckedChange={setIsAnonymous}
                              />
                            </div>

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

                            <Button onClick={handleDonate} className="w-full" size="lg" disabled={!donationAmount}>
                              Complete Donation
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
                              <p className="font-mono font-medium">DON-{Date.now().toString(36).toUpperCase()}</p>
                            </CardContent>
                          </Card>
                          <Button 
                            onClick={() => {
                              setShowDonationSuccess(false)
                              setDonationDialogOpen(false)
                            }}
                            className="w-full"
                          >
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
                        <DropdownMenuItem>
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
                      <p className="text-sm text-muted-foreground">{campaign.location}</p>
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

          {/* Related Campaigns */}
          {relatedCampaigns.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Related Campaigns</h2>
                <Link href={`/browse?category=${campaign.category}`}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCampaigns.map((relatedCampaign) => (
                  <CampaignCard key={relatedCampaign.id} campaign={relatedCampaign} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
