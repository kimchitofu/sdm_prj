"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  ImageIcon,
  MapPin,
  Save,
  Send,
  Upload,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Card2, CardContent2, CardDescription2, CardHeader2, CardTitle2 } from "@/components/ui/card2"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { categories, users } from "@/lib/mock-data"
import { getAllCitiesOfCountry, getCountries } from "@countrystatecity/countries-browser"

const fundRaiserUser = users.find((u) => u.role === "fund_raiser") || users[1]

const serviceTypes = [
  { id: "medical-bills", name: "Medical Bills" },
  { id: "education-fees", name: "Education Fees" },
  { id: "emergency-support", name: "Emergency Support" },
  { id: "community-project", name: "Community Project" },
  { id: "charity-event", name: "Charity Event" },
  { id: "animal-care", name: "Animal Care" },
  { id: "memorial-support", name: "Memorial Support" },
  { id: "environmental-cause", name: "Environmental Cause" },
]

type CountryOption = {
  isoCode: string
  name: string
}

type RawCountryOption = {
  iso2?: string
  name?: string
}

type CityOption = {
  name: string
  countryCode?: string
  stateCode?: string
}

type RawCityOption = {
  name?: string
  country_code?: string
  state_code?: string
}

const steps = [
  { id: 1, name: "Basic Info", description: "Title, summary, category and service type", icon: FileText },
  { id: 2, name: "Details", description: "Story, funding goal, dates and beneficiary details", icon: DollarSign },
  { id: 3, name: "Media", description: "Upload a cover image, gallery visuals and supporting documents", icon: ImageIcon },
  { id: 4, name: "Review", description: "Check everything before publishing", icon: Eye },
]

const initialFormData = {
  title: "",
  summary: "",
  description: "",
  category: "",
  serviceType: "",
  targetAmount: "",
  startDate: "",
  endDate: "",
  beneficiaryName: "",
  beneficiaryRelationship: "",
  countryCode: "",
  countryName: "",
  city: "",
  coverImage: null as File | null,
  coverImagePreview: "",
  galleryImages: [] as File[],
  galleryPreviews: [] as string[],
  documents: [] as File[],
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [citiesLoading, setCitiesLoading] = useState(false)

  const updateFormData = (field: string, value: string | File | File[] | string[] | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      try {
        const rawCountries = await getCountries()

        if (!isMounted) return

        const nextCountries = (rawCountries ?? [])
          .map((country: RawCountryOption) => ({
            isoCode: country.iso2 ?? "",
            name: country.name ?? "",
          }))
          .filter((country) => country.isoCode && country.name)
          .sort((a, b) => a.name.localeCompare(b.name))

        setCountries(nextCountries)
      } catch (error) {
        console.error("Failed to load country data", error)
        setCountries([])
      } finally {
        if (isMounted) setCountriesLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    if (!formData.countryCode) {
      setCities([])
      setCitiesLoading(false)
      return
    }

    setCitiesLoading(true)

    ;(async () => {
      try {
        const rawCities = await getAllCitiesOfCountry(formData.countryCode)

        if (!isMounted) return

        const nextCities = (rawCities ?? [])
          .map((city: RawCityOption) => ({
            name: city.name ?? "",
            countryCode: city.country_code,
            stateCode: city.state_code,
          }))
          .filter((city) => city.name)
          .sort((a, b) => a.name.localeCompare(b.name))

        setCities(nextCities)
      } catch (error) {
        console.error("Failed to load cities", error)
        if (isMounted) setCities([])
      } finally {
        if (isMounted) setCitiesLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [formData.countryCode])

  const resolvedLocation = useMemo(() => {
    const city = formData.city.trim()
    const country = formData.countryName.trim()

    if (city && country) return `${city}, ${country}`
    if (country) return country
    return city
  }, [formData.city, formData.countryName])

  const citySuggestions = useMemo(() => {
    const query = formData.city.trim().toLowerCase()
    const unique = new Set<string>()
    const matches: string[] = []

    for (const city of cities) {
      const name = city.name.trim()
      const normalized = name.toLowerCase()
      if (!name || unique.has(normalized)) continue
      if (query && !normalized.includes(query)) continue

      unique.add(normalized)
      matches.push(name)

      if (matches.length >= 100) break
    }

    return matches
  }, [cities, formData.city])

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Campaign title is required"
      if (!formData.summary.trim()) newErrors.summary = "Short summary is required"
      if (!formData.category) newErrors.category = "Please select a category"
      if (!formData.serviceType) newErrors.serviceType = "Please select a service type"
      if (formData.summary.trim().length > 200) newErrors.summary = "Keep the summary within 200 characters"
    }

    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = "Campaign story is required"
      if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
        newErrors.targetAmount = "Please enter a valid fundraising target"
      }
      if (!formData.startDate) newErrors.startDate = "Start date is required"
      if (!formData.endDate) newErrors.endDate = "End date is required"
      if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
        newErrors.endDate = "End date must be after the start date"
      }
      if (!formData.beneficiaryName.trim()) newErrors.beneficiaryName = "Beneficiary name is required"
      if (!formData.countryCode) newErrors.countryCode = "Please select a country"
      if (!formData.city.trim()) newErrors.city = "Please enter a city"
    }

    if (step === 3) {
      if (!formData.coverImagePreview) newErrors.coverImage = "Please upload a cover image"
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const validateBeforePublish = () => {
    const allErrors: Record<string, string> = {}

    ;[1, 2, 3].forEach((step) => {
      const stepErrors: Record<string, string> = {}

      if (step === 1) {
        if (!formData.title.trim()) stepErrors.title = "Campaign title is required"
        if (!formData.summary.trim()) stepErrors.summary = "Short summary is required"
        if (!formData.category) stepErrors.category = "Please select a category"
        if (!formData.serviceType) stepErrors.serviceType = "Please select a service type"
        if (formData.summary.trim().length > 200) stepErrors.summary = "Keep the summary within 200 characters"
      }

      if (step === 2) {
        if (!formData.description.trim()) stepErrors.description = "Campaign story is required"
        if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
          stepErrors.targetAmount = "Please enter a valid fundraising target"
        }
        if (!formData.startDate) stepErrors.startDate = "Start date is required"
        if (!formData.endDate) stepErrors.endDate = "End date is required"
        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
          stepErrors.endDate = "End date must be after the start date"
        }
        if (!formData.beneficiaryName.trim()) stepErrors.beneficiaryName = "Beneficiary name is required"
        if (!formData.countryCode) stepErrors.countryCode = "Please select a country"
        if (!formData.city.trim()) stepErrors.city = "Please enter a city"
      }

      if (step === 3 && !formData.coverImagePreview) {
        stepErrors.coverImage = "Please upload a cover image"
      }

      Object.assign(allErrors, stepErrors)
    })

    setErrors(allErrors)
    return Object.keys(allErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    updateFormData("coverImage", file)

    const reader = new FileReader()
    reader.onloadend = () => {
      updateFormData("coverImagePreview", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    if (!files.length) return

    const nextImages = [...formData.galleryImages, ...files].slice(0, 5)
    updateFormData("galleryImages", nextImages)

    Promise.all(
      nextImages.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
      )
    ).then((previews) => updateFormData("galleryPreviews", previews))
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    if (!files.length) return
    updateFormData("documents", [...formData.documents, ...files].slice(0, 5))
  }

  const removeGalleryImage = (index: number) => {
    const nextImages = formData.galleryImages.filter((_, i) => i !== index)
    const nextPreviews = formData.galleryPreviews.filter((_, i) => i !== index)
    updateFormData("galleryImages", nextImages)
    updateFormData("galleryPreviews", nextPreviews)
  }

  const removeDocument = (index: number) => {
    updateFormData(
      "documents",
      formData.documents.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = (isDraft: boolean) => {
    if (!isDraft && !validateBeforePublish()) {
      const firstErrorStep = [1, 2, 3].find((step) => !validateStep(step)) || 1
      setCurrentStep(firstErrorStep)
      return
    }

    setShowSuccess(true)
    setTimeout(() => {
      router.push("/dashboard/fund-raiser/campaigns")
    }, 1600)
  }

  const formatCurrency = (value: string) => {
    const num = Number(value)
    if (!num || Number.isNaN(num)) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const completionPercentage = useMemo(() => {
    const fields = [
      formData.title,
      formData.summary,
      formData.category,
      formData.serviceType,
      formData.description,
      formData.targetAmount,
      formData.startDate,
      formData.endDate,
      formData.beneficiaryName,
      formData.countryCode,
      formData.city,
      formData.coverImagePreview,
    ]

    const completed = fields.filter((field) => String(field).trim().length > 0).length
    return Math.round((completed / fields.length) * 100)
  }, [formData, resolvedLocation])

  const currentStepConfig = steps.find((step) => step.id === currentStep) || steps[0]
  const StepIcon = currentStepConfig.icon

  const renderFieldError = (field: string) =>
    errors[field] ? <p className="mt-1.5 text-sm text-destructive">{errors[field]}</p> : null

  return (
    <DashboardLayout
      role="fund_raiser"
      user={{
        name: fundRaiserUser.displayName,
        email: fundRaiserUser.email,
        avatar: fundRaiserUser.avatar,
        role: "Fund Raiser",
      }}
    >
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            Create New Campaign
          </h1>
          <p className="text-muted-foreground">
            Set up your fundraising campaign in a few simple steps.
          </p>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-1 flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep >= step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`-mt-6 mx-2 h-0.5 flex-1 ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card2 className="overflow-hidden ">
            <CardHeader2 className="border-b bg-muted/30 pb-5 py-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <StepIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{currentStepConfig.name}</CardTitle>
                  <CardDescription className="mt-1 text-sm">{currentStepConfig.description}</CardDescription>
                </div>
              </div>
            </CardHeader2>

            <CardContent className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title">Campaign title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Help rebuild our community learning centre"
                        value={formData.title}
                        onChange={(e) => updateFormData("title", e.target.value)}
                        className={errors.title ? "border-destructive" : ""}
                      />
                      {renderFieldError("title")}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="summary">Short summary *</Label>
                        <span className="text-xs text-muted-foreground">{formData.summary.length}/200</span>
                      </div>
                      <Textarea
                        id="summary"
                        placeholder="Write a concise summary for listing cards and search results."
                        value={formData.summary}
                        onChange={(e) => updateFormData("summary", e.target.value.slice(0, 200))}
                        rows={4}
                        className={errors.summary ? "border-destructive" : ""}
                      />
                      {renderFieldError("summary")}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                        <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {renderFieldError("category")}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service type *</Label>
                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) => updateFormData("serviceType", value)}
                      >
                        <SelectTrigger className={errors.serviceType ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {renderFieldError("serviceType")}
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Tip: keep the title specific and outcome-focused. Good campaigns make the need,
                    beneficiary, and intended impact immediately clear.
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Campaign story *</Label>
                    <Textarea
                      id="description"
                      placeholder="Explain the background, what the fundraising will cover, and how contributions will make a difference."
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      rows={9}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {renderFieldError("description")}
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="targetAmount">Target amount *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="targetAmount"
                          type="number"
                          placeholder="10000"
                          value={formData.targetAmount}
                          onChange={(e) => updateFormData("targetAmount", e.target.value)}
                          className={`pl-9 ${errors.targetAmount ? "border-destructive" : ""}`}
                        />
                      </div>
                      {renderFieldError("targetAmount")}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => updateFormData("startDate", e.target.value)}
                          className={`pl-9 ${errors.startDate ? "border-destructive" : ""}`}
                        />
                      </div>
                      {renderFieldError("startDate")}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => updateFormData("endDate", e.target.value)}
                          className={`pl-9 ${errors.endDate ? "border-destructive" : ""}`}
                        />
                      </div>
                      {renderFieldError("endDate")}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryName">Beneficiary name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="beneficiaryName"
                          placeholder="Who will receive the funds?"
                          value={formData.beneficiaryName}
                          onChange={(e) => updateFormData("beneficiaryName", e.target.value)}
                          className={`pl-9 ${errors.beneficiaryName ? "border-destructive" : ""}`}
                        />
                      </div>
                      {renderFieldError("beneficiaryName")}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryRelationship">Relationship</Label>
                      <Input
                        id="beneficiaryRelationship"
                        placeholder="e.g. Self, sibling, local organisation"
                        value={formData.beneficiaryRelationship}
                        onChange={(e) => updateFormData("beneficiaryRelationship", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="countryCode">Country *</Label>
                      <Select
                        value={formData.countryCode}
                        onValueChange={(value) => {
                          const selectedCountry = countries.find((country) => country.isoCode === value)
                          updateFormData("countryCode", value)
                          updateFormData("countryName", selectedCountry?.name ?? "")
                          updateFormData("city", "")
                        }}
                      >
                        <SelectTrigger className={errors.countryCode ? "border-destructive" : ""}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder={countriesLoading ? "Loading countries..." : "Select country"} />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.isoCode} value={country.isoCode}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the country where the campaign or beneficiary is located.
                      </p>
                      {renderFieldError("countryCode")}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        list="campaign-city-suggestions"
                        placeholder={
                          formData.countryCode
                            ? citiesLoading
                              ? "Loading cities..."
                              : "Start typing to search for a city"
                            : "Select a country first"
                        }
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        disabled={!formData.countryCode || citiesLoading}
                        className={errors.city ? "border-destructive" : ""}
                      />
                      <datalist id="campaign-city-suggestions">
                        {citySuggestions.map((cityName) => (
                          <option key={cityName} value={cityName} />
                        ))}
                      </datalist>
                      <p className="text-xs text-muted-foreground">
                        Start typing to autofill from cities in the selected country. You can still enter a custom city manually.
                      </p>
                      {renderFieldError("city")}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-dashed bg-muted/20 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Cover image *</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Upload a strong lead image. This will appear on the campaign card and detail page.
                        </p>
                      </div>
                      <label>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
                        <Button type="button" variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload cover image
                          </span>
                        </Button>
                      </label>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-2xl border bg-background">
                      {formData.coverImagePreview ? (
                        <div className="relative">
                          <img
                            src={formData.coverImagePreview}
                            alt="Cover preview"
                            className="h-64 w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute right-3 top-3"
                            onClick={() => {
                              updateFormData("coverImage", null)
                              updateFormData("coverImagePreview", "")
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                          <div className="rounded-2xl bg-muted p-4">
                            <ImageIcon className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">No cover image uploaded yet</p>
                            <p className="text-sm text-muted-foreground">Recommended ratio: 16:9, JPG or PNG.</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {renderFieldError("coverImage")}
                  </div>

                  <div className="rounded-2xl border p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Gallery images</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Optional supporting visuals to make your campaign page more complete.
                        </p>
                      </div>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGalleryImageChange}
                        />
                        <Button type="button" variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Add gallery images
                          </span>
                        </Button>
                      </label>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {formData.galleryPreviews.length > 0 ? (
                        formData.galleryPreviews.map((preview, index) => (
                          <div key={`${preview}-${index}`} className="overflow-hidden rounded-2xl border bg-muted/20">
                            <div className="relative">
                              <img src={preview} alt={`Gallery preview ${index + 1}`} className="h-36 w-full object-cover" />
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="absolute right-2 top-2 h-8 w-8"
                                onClick={() => removeGalleryImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="border-t px-3 py-2 text-sm text-muted-foreground">
                              {formData.galleryImages[index]?.name || `Image ${index + 1}`}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full flex min-h-36 items-center justify-center rounded-2xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
                          No gallery images added yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Supporting documents</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Upload optional supporting files such as letters, quotations, invoices, or beneficiary documents.
                        </p>
                      </div>
                      <label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          multiple
                          className="hidden"
                          onChange={handleDocumentChange}
                        />
                        <Button type="button" variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload documents
                          </span>
                        </Button>
                      </label>
                    </div>

                    <div className="mt-5 space-y-3">
                      {formData.documents.length > 0 ? (
                        formData.documents.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeDocument(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
                          No documents uploaded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-muted/30 shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Basic information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Title</span>
                          <span className="max-w-[70%] text-right font-medium">{formData.title || "Not set"}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-medium">{formData.category || "Not set"}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Service type</span>
                          <span className="font-medium">{formData.serviceType || "Not set"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30 shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Funding details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Target amount</span>
                          <span className="font-medium text-primary">{formatCurrency(formData.targetAmount)}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Campaign period</span>
                          <span className="text-right font-medium">
                            {formData.startDate || "Not set"} - {formData.endDate || "Not set"}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Beneficiary</span>
                          <span className="font-medium">{formData.beneficiaryName || "Not set"}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">Location</span>
                          <span className="font-medium">{resolvedLocation || "Not set"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-muted/30 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Summary and story</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div>
                        <p className="mb-1 font-medium text-foreground">Summary</p>
                        <p className="text-muted-foreground">{formData.summary || "Not set"}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="mb-1 font-medium text-foreground">Campaign story</p>
                        <p className="whitespace-pre-line text-muted-foreground">
                          {formData.description || "Not set"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Media and documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-muted-foreground">Cover image</span>
                        <span className="font-medium">{formData.coverImage ? formData.coverImage.name : "Not added"}</span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-muted-foreground">Gallery images</span>
                        <span className="font-medium">{formData.galleryImages.length}</span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-muted-foreground">Supporting documents</span>
                        <span className="font-medium">{formData.documents.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" onClick={() => handleSubmit(true)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save draft
                  </Button>

                  {currentStep < steps.length ? (
                    <Button onClick={handleNext}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => handleSubmit(false)}>
                      <Send className="mr-2 h-4 w-4" />
                      Publish campaign
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card2>

          <Card className="h-fit xl:sticky xl:top-24">
            <CardHeader>
              <CardTitle className="text-base">Live preview</CardTitle>
              <CardDescription>How the campaign card will look to supporters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="overflow-hidden rounded-2xl border bg-muted/20">
                <div className="aspect-[16/10] bg-muted">
                  {formData.coverImagePreview ? (
                    <img src={formData.coverImagePreview} alt="Campaign preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.category ? <Badge variant="secondary">{formData.category}</Badge> : null}
                    {formData.serviceType ? <Badge variant="outline">{formData.serviceType}</Badge> : null}
                  </div>

                  <div>
                    <h3 className="line-clamp-2 font-semibold text-foreground">
                      {formData.title || "Your campaign title will appear here"}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {formData.summary || "Add a short summary so supporters can quickly understand your cause."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">$0 raised</span>
                      <span className="text-muted-foreground">Goal {formatCurrency(formData.targetAmount)}</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <div className="grid gap-3 rounded-2xl border bg-background p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Beneficiary</span>
                      <span className="font-medium">{formData.beneficiaryName || "Not set"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-right font-medium">{resolvedLocation || "Not set"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Campaign dates</span>
                      <span className="text-right font-medium">
                        {formData.startDate || "--"} to {formData.endDate || "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="mb-2 text-xl">Campaign created successfully</DialogTitle>
            <DialogDescription>
              Your campaign has been saved. Redirecting you to the campaign management page now.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
