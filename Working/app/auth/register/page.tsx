'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { getRedirectForRole } from '@/lib/user'
import { Eye, EyeOff, Loader2, Heart, TrendingUp, Check } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, getRegisteredUsers, saveRegisteredUsers, saveCurrentUser } from '@/lib/utils'
import { toast } from 'sonner'

type UserRole = 'donee' | 'fund_raiser'

const roleOptions = [
  {
    id: 'donee' as UserRole,
    title: 'Donor',
    subtitle: 'Support causes you care about',
    icon: Heart,
    benefits: [
      'Browse and discover campaigns',
      'Save favorites and track donations',
      'Receive impact updates',
      'Tax-deductible receipts',
    ],
  },
  {
    id: 'fund_raiser' as UserRole,
    title: 'Fund Raiser',
    subtitle: 'Create campaigns and raise funds',
    icon: TrendingUp,
    benefits: [
      'Create unlimited campaigns',
      'Access analytics dashboard',
      'Track donor engagement',
      'Withdraw funds easily',
    ],
  },
]

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') as UserRole | null
  
  const [step, setStep] = useState<'role' | 'details'>(defaultRole ? 'details' : 'role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(defaultRole)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and number'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      const user = userCredential.user

      // Store user profile in Firestore
      const roleToStore = selectedRole ?? 'donee'
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: roleToStore,
        createdAt: serverTimestamp(),
      })

      toast.success('Account created successfully!', {
        description: "Welcome to FundBridge. Let's get started!",
      })
      const redirect = getRedirectForRole(roleToStore)
      router.push(redirect)
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <Logo className="text-primary-foreground" />
          
          <div className="max-w-md">
            <h1 className="mb-4 text-4xl font-bold text-primary-foreground">
              Join Our Community
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Create an account to start making a difference. Whether you want to 
              raise funds or support causes, FundBridge connects hearts with hope.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Check className="h-4 w-4" />
                </div>
                <span>Free to create an account</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Check className="h-4 w-4" />
                </div>
                <span>Secure and transparent platform</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Check className="h-4 w-4" />
                </div>
                <span>24/7 support available</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} FundBridge. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center overflow-y-auto p-6 lg:w-1/2">
        <div className="w-full max-w-md py-8">
          <div className="mb-8 lg:hidden">
            <Logo className="mb-6" />
          </div>

          {step === 'role' ? (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Create your account</h2>
                <p className="mt-1 text-muted-foreground">
                  Choose how you want to use FundBridge
                </p>
              </div>

              <div className="space-y-4">
                {roleOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                      selectedRole === option.id && 'border-primary ring-2 ring-primary/20'
                    )}
                    onClick={() => handleRoleSelect(option.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <option.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full border-2',
                            selectedRole === option.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {selectedRole === option.id && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="mt-3 text-lg">{option.title}</CardTitle>
                      <CardDescription>{option.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {option.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-primary" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <Card className="border-0 shadow-none lg:border lg:shadow-sm">
              <CardHeader className="space-y-1 px-0 lg:px-6">
                <div className="mb-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('role')}
                    className="h-auto p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  >
                    &larr; Back
                  </Button>
                </div>
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>
                  Sign up as a{' '}
                  <span className="font-medium text-foreground">
                    {selectedRole === 'fund_raiser' ? 'Fund Raiser' : 'Donor'}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-0 lg:px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData({ ...formData, firstName: e.target.value })
                          if (errors.firstName) setErrors({ ...errors, firstName: '' })
                        }}
                        className={errors.firstName ? 'border-destructive' : ''}
                        autoComplete="given-name"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => {
                          setFormData({ ...formData, lastName: e.target.value })
                          if (errors.lastName) setErrors({ ...errors, lastName: '' })
                        }}
                        className={errors.lastName ? 'border-destructive' : ''}
                        autoComplete="family-name"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                      className={errors.email ? 'border-destructive' : ''}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value })
                          if (errors.password) setErrors({ ...errors, password: '' })
                        }}
                        className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password ? (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        At least 8 characters with uppercase, lowercase, and number
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value })
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                      }}
                      className={errors.confirmPassword ? 'border-destructive' : ''}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, agreeToTerms: checked as boolean })
                        if (errors.agreeToTerms) setErrors({ ...errors, agreeToTerms: '' })
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <Label
                        htmlFor="terms"
                        className="text-sm font-normal leading-snug text-muted-foreground"
                      >
                        I agree to the{' '}
                        <Link href="#" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                      {errors.agreeToTerms && (
                        <p className="text-sm text-destructive">{errors.agreeToTerms}</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/sign-in" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
