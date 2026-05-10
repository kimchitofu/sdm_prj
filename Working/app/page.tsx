import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Heart,
  Users,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Star,
  Quote,
} from 'lucide-react'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CampaignCard } from '@/components/campaigns/campaign-card'
import { categories, getFeaturedCampaigns, formatCurrency, formatNumber } from '@/lib/mock-data'
import { HeroActions } from '@/components/home/hero-actions'
import { CtaActions } from '@/components/home/cta-actions'

const featuredCampaigns = getFeaturedCampaigns()

const impactStats = [
  { label: 'Total Raised', value: '$4.5M+', icon: DollarSign },
  { label: 'Campaigns Funded', value: '1,089', icon: TrendingUp },
  { label: 'Active Donors', value: '12,800+', icon: Users },
  { label: 'Success Rate', value: '94%', icon: CheckCircle2 },
]

const howItWorksForFundRaisers = [
  {
    step: '01',
    title: 'Create Your Campaign',
    description: 'Set up your fundraising campaign in minutes with our easy-to-use tools. Add your story, photos, and funding goal.',
  },
  {
    step: '02',
    title: 'Share Your Story',
    description: 'Spread the word through social media, email, and our community. Reach thousands of potential donors.',
  },
  {
    step: '03',
    title: 'Receive Donations',
    description: 'Watch donations come in and track your progress with real-time analytics. Funds are transferred securely.',
  },
]

const howItWorksForDonees = [
  {
    step: '01',
    title: 'Discover Campaigns',
    description: 'Browse verified campaigns across categories. Find causes that resonate with your values.',
  },
  {
    step: '02',
    title: 'Make a Difference',
    description: 'Donate securely with just a few clicks. Choose to give once or set up recurring donations.',
  },
  {
    step: '03',
    title: 'Track Your Impact',
    description: 'Receive updates on campaigns you support. See exactly how your donation makes a difference.',
  },
]

const testimonials = [
  {
    name: 'Sarah Martinez',
    role: 'Fund Raiser',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    content: 'FundBridge made it incredibly easy to raise funds for my community project. We exceeded our goal by 40% thanks to their platform and supportive donor community.',
    rating: 5,
  },
  {
    name: 'James Thompson',
    role: 'Donor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'I love being able to track my donations and see the real impact they make. The transparency on this platform is unmatched.',
    rating: 5,
  },
  {
    name: 'Emily Chen',
    role: 'Fund Raiser',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'The analytics tools helped me understand my donors better and optimize my campaign. Raised $50,000 for medical expenses in just 3 weeks!',
    rating: 5,
  },
]

const faqs = [
  {
    question: 'How does FundBridge work?',
    answer: 'FundBridge connects fundraisers with donors through our secure platform. Fundraisers create campaigns with their story and funding goal, while donors browse and contribute to causes they care about. All transactions are secure, and funds are transferred directly to campaign organizers.',
  },
  {
    question: 'What fees does FundBridge charge?',
    answer: 'FundBridge charges a small platform fee of 2.9% + $0.30 per transaction to cover payment processing and platform maintenance. This is significantly lower than most crowdfunding platforms, ensuring more of your donation goes directly to the cause.',
  },
  {
    question: 'How do I know campaigns are legitimate?',
    answer: 'We have a thorough verification process for all campaigns. Verified organizers display a badge on their profile. We also monitor campaigns for suspicious activity and have a dedicated trust and safety team reviewing reports.',
  },
  {
    question: 'When do fundraisers receive their funds?',
    answer: 'Funds are available for withdrawal within 2-5 business days after donation. Fundraisers can choose to withdraw at any time during or after their campaign ends. We support direct bank transfers and other payout methods.',
  },
  {
    question: 'Can I donate anonymously?',
    answer: 'Yes! When making a donation, you can choose to remain anonymous. Your contribution will still count toward the campaign goal, but your name will not be displayed publicly.',
  },
  {
    question: 'What categories of campaigns are supported?',
    answer: 'We support a wide range of categories including Medical & Health, Education, Emergency Relief, Community Projects, Environment, Animals, Creative Arts, and Sports & Recreation. Our team reviews all campaigns to ensure they meet our community guidelines.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pb-16 pt-12 lg:pb-24 lg:pt-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
                Over $4.5 million raised for causes worldwide
              </Badge>
              
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Connect Hearts,{' '}
                <span className="text-primary">Fund Dreams</span>
              </h1>
              
              <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
                FundBridge is the trusted platform that connects fundraisers with donors. 
                Whether you need support or want to make a difference, we make it easy, 
                transparent, and secure.
              </p>
              
              <HeroActions />
            </div>

            {/* Hero Visual - Featured Campaign Cards Preview */}
            <div className="mt-16 hidden lg:block">
              <div className="relative mx-auto max-w-5xl">
                <div className="absolute -left-4 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -right-4 top-1/3 h-72 w-72 rounded-full bg-chart-4/10 blur-3xl" />
                <div className="relative grid grid-cols-3 gap-6">
                  {featuredCampaigns.slice(0, 3).map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className={`transform transition-transform ${
                        index === 1 ? 'scale-105 shadow-xl' : 'scale-95 opacity-80'
                      }`}
                    >
                      <CampaignCard campaign={campaign} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="border-y bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {impactStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Campaigns */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <Badge variant="outline" className="mb-2">Featured</Badge>
                <h2 className="text-3xl font-bold tracking-tight">
                  Campaigns Making a Difference
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Discover verified campaigns that need your support right now.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/browse">
                  View All Campaigns
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-muted/30 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-2">How It Works</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Simple Steps to Make an Impact
              </h2>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
              {/* For Fund Raisers */}
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    FR
                  </div>
                  For Fund Raisers
                </h3>
                <div className="space-y-6">
                  {howItWorksForFundRaisers.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-background font-mono text-sm font-bold text-primary">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-6" asChild>
                  <Link href="/auth/register?role=fund_raiser">
                    Start Your Campaign
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* For Donees (Donors) */}
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2 text-sm font-bold text-white">
                    D
                  </div>
                  For Donors
                </h3>
                <div className="space-y-6">
                  {howItWorksForDonees.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-chart-2/20 bg-background font-mono text-sm font-bold text-chart-2">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-6" asChild>
                  <Link href="/browse">
                    <Heart className="mr-2 h-4 w-4" />
                    Find Campaigns to Support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-2">Categories</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Support Causes You Care About
              </h2>
              <p className="mt-2 text-muted-foreground">
                Explore campaigns across diverse categories and find your cause.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/browse?category=${encodeURIComponent(category.name)}`}
                >
                  <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div
                        className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <Heart
                          className="h-5 w-5"
                          style={{ color: category.color }}
                        />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                      <p className="mt-2 text-sm font-medium text-primary">
                        {category.campaignCount} campaigns
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-muted/30 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-2">Why FundBridge</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Built on Trust and Transparency
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure & Protected</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Bank-level encryption protects every transaction. Your data 
                    and donations are always secure with us.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Real-Time Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track your campaign performance with detailed analytics. 
                    Understand your donors and optimize for success.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Supportive Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Join a community of over 12,000 donors and fundraisers 
                    making real change in the world.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-2">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Loved by Our Community
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-6">
                    <Quote className="absolute right-4 top-4 h-8 w-8 text-muted/20" />
                    <div className="mb-4 flex">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-azure-400 text-azure-400"
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-muted-foreground">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-muted/30 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-2">FAQ</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24" id="about">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 lg:px-20">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              
              <div className="relative">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  Ready to Make a Difference?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                  Whether you want to start a campaign or support a cause, 
                  FundBridge makes it easy to create real impact in your community.
                </p>
                <CtaActions />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
