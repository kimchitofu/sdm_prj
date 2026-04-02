'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 24, text: 'text-xl' },
    lg: { icon: 32, text: 'text-2xl' },
  }

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Heart className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
        </div>
        <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-chart-4" />
      </div>
      {showText && (
        <span className={cn('font-semibold tracking-tight text-foreground', sizes[size].text)}>
          FundBridge
        </span>
      )}
    </Link>
  )
}
