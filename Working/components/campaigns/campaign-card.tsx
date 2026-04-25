'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye, Users, Clock, BadgeCheck } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Campaign } from '@/lib/types'
import { formatCurrency, calculateProgress, getDaysRemaining, getStatusColor } from '@/lib/mock-data'

interface CampaignCardProps {
  campaign: Campaign
  onFavourite?: (id: string) => void
  isFavourited?: boolean
  showStatus?: boolean
  variant?: 'default' | 'compact' | 'horizontal'
}

export function CampaignCard({
  campaign,
  onFavourite,
  isFavourited = false,
  showStatus = false,
  variant = 'default',
}: CampaignCardProps) {
  const progress = calculateProgress(campaign.raisedAmount, campaign.targetAmount)
  const daysRemaining = getDaysRemaining(campaign.endDate)
  const campaignUrl = `/campaign/${campaign.id}`

  if (variant === 'horizontal') {
    return (
      <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md sm:flex-row">
        <Link href={campaignUrl} className="relative aspect-video w-full sm:aspect-auto sm:w-48 sm:min-h-[160px]">
          <Image src={campaign.coverImage} alt={campaign.title} fill className="object-cover" />
          {showStatus && (
            <Badge className={cn('absolute left-2 top-2', getStatusColor(campaign.status))}>
              {campaign.status}
            </Badge>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <Badge variant="secondary" className="mb-1 w-fit">
            {campaign.category}
          </Badge>

          <Link href={campaignUrl}>
            <h3 className="line-clamp-1 font-semibold hover:text-primary">
              {campaign.title}
            </h3>
          </Link>

          <p className="mb-3 mt-2 line-clamp-2 text-sm text-muted-foreground">
            {campaign.summary}
          </p>

          <div className="mt-auto">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-green-600">
                {formatCurrency(campaign.raisedAmount)}
              </span>
              <span className="text-muted-foreground">
                of {formatCurrency(campaign.targetAmount)}
              </span>
            </div>

            <Progress value={progress} className="h-2 bg-green-100 [&>[data-slot=progress-indicator]]:bg-green-500" />

            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {campaign.donorCount} donors
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysRemaining} days left
              </span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <Link href={campaignUrl} className="relative block aspect-[16/10]">
          <Image src={campaign.coverImage} alt={campaign.title} fill className="object-cover" />
        </Link>

        <CardContent className="p-3">
          <Link href={campaignUrl}>
            <h3 className="line-clamp-1 text-sm font-semibold hover:text-primary">
              {campaign.title}
            </h3>
          </Link>

          <div className="mt-2">
            <Progress value={progress} className="h-1.5 bg-green-100 [&>[data-slot=progress-indicator]]:bg-green-500" />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(campaign.raisedAmount)} raised
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={campaignUrl} className="relative block aspect-[16/10]">
        <Image
          src={campaign.coverImage}
          alt={campaign.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {campaign.category}
          </Badge>
        </div>

        {showStatus && campaign.status !== 'active' && (
          <Badge className={cn('absolute bottom-3 left-3', getStatusColor(campaign.status))}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        )}

        {campaign.status === 'active' && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
            <Clock className="h-3 w-3" />
            {daysRemaining} days left
          </div>
        )}
      </Link>

      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={campaign.organiser.avatar} />
            <AvatarFallback className="text-xs">
              {campaign.organiser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <span className="text-sm text-muted-foreground">
            {campaign.organiser.name}
          </span>

          {campaign.organiser.isVerified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <BadgeCheck className="h-4 w-4 text-primary" />
                </TooltipTrigger>
                <TooltipContent>Verified Organiser</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Link href={campaignUrl}>
          <h3 className="mb-2 line-clamp-2 font-semibold leading-tight transition-colors hover:text-primary">
            {campaign.title}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {campaign.summary}
        </p>

        <div className="space-y-2">
          <Progress value={progress} className="h-2 bg-green-100 [&>[data-slot=progress-indicator]]:bg-green-500" />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(campaign.raisedAmount)}
              </span>
              <span className="text-sm text-muted-foreground">
                {' '}raised of {formatCurrency(campaign.targetAmount)}
              </span>
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-4 py-3">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{campaign.donorCount.toLocaleString()}</span>
              </TooltipTrigger>
              <TooltipContent>Donors</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{campaign.views.toLocaleString()}</span>
              </TooltipTrigger>
              <TooltipContent>Views</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{campaign.favouriteCount.toLocaleString()}</span>
              </TooltipTrigger>
              <TooltipContent>Favourites</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  )
}