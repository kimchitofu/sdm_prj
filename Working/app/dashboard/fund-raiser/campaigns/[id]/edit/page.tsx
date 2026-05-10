"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  ImageIcon,
  MapPin,
  Save,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { campaigns, categories, users } from "@/lib/mock-data"
import { getAllCitiesOfCountry, getCountries } from "@countrystatecity/countries-browser"

const fundRaiserUser = users.find((u) => u.role === "fund_raiser") || users[1]

const serviceTypes = [
  { id: "medical", name: "Medical Bills" },
  { id: "education", name: "Education Fees" },
  { id: "emergency", name: "Emergency Support" },
  { id: "community", name: "Community Project" },
  { id: "animals", name: "Animal Care" },
  { id: "memorial", name: "Memorial Support" },
  { id: "environment", name: "Environmental Cause" },
  { id: "sports", name: "Sports & Athletics" },
  { id: "creative", name: "Creative Cause" },
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

type GalleryItem = {
  id: string
  name: string
  preview: string
  source: "existing" | "upload"
}

function parseExistingLocation(location: string, countries: CountryOption[]) {
  const trimmed = location.trim()
  if (!trimmed) {
    return { city: "", countryCode: "", countryName: "" }
  }

  const segments = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (segments.length >= 2) {
    const countrySegment = segments[segments.length - 1]
    const matchedCountry = countries.find(
      (country) => country.name.toLowerCase() === countrySegment.toLowerCase()
    )

    if (matchedCountry) {
      return {
        city: segments.slice(0, -1).join(", "),
        countryCode: matchedCountry.isoCode,
        countryName: matchedCountry.name,
      }
    }
  }

  const exactCountry = countries.find((country) => country.name.toLowerCase() === trimmed.toLowerCase())
  if (exactCountry) {
    return {
      city: "",
      countryCode: exactCountry.isoCode,
      countryName: exactCountry.name,
    }
  }

  return {
    city: trimmed,
    countryCode: "",
    countryName: "",
  }
}

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0]

  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [hasMappedExistingLocation, setHasMappedExistingLocation] = useState(false)

  const [formData, setFormData] = useState(() => ({
    title: campaign.title,
    summary: campaign.summary,
    description: campaign.description,
    category: campaign.category,
    serviceType: campaign.serviceType,
    targetAmount: String(campaign.targetAmount),
    startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : "",
    endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : "",
    beneficiaryName: campaign.beneficiary?.name ?? "",
    beneficiaryRelationship: campaign.beneficiary?.relationship ?? "",
    countryCode: "",
    countryName: "",
    city: campaign.location ?? "",
    status: campaign.status,
    coverImage: null as File | null,
    coverImagePreview: campaign.coverImage ?? "",
    documents: [] as File[],
  }))

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
    (campaign.gallery ?? []).map((image: string, index: number) => ({
      id: `existing-${index}`,
      name: `Image ${index + 1}`,
      preview: image,
      source: "existing",
    }))
  )

  const updateFormData = (field: string, value: string | File | File[] | null) => {
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
    if (hasMappedExistingLocation || countriesLoading || countries.length === 0) return

    const parsed = parseExistingLocation(campaign.location ?? "", countries)
    setFormData((prev) => ({
      ...prev,
      city: parsed.city || prev.city,
      countryCode: parsed.countryCode,
      countryName: parsed.countryName,
    }))
    setHasMappedExistingLocation(true)
  }, [campaign.location, countries, countriesLoading, hasMappedExistingLocation])

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
    const seen = new Set<string>()
    const matches: string[] = []

    for (const city of cities) {
      const name = city.name.trim()
      const normalized = name.toLowerCase()
      if (!name || seen.has(normalized)) continue
      if (query && !normalized.includes(query)) continue

      seen.add(normalized)
      matches.push(name)
      if (matches.length >= 100) break
    }

    return matches
  }, [cities, formData.city])


  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.title.trim()) nextErrors.title = "Campaign title is required"
    if (!formData.summary.trim()) nextErrors.summary = "Short summary is required"
    if (formData.summary.trim().length > 200) nextErrors.summary = "Keep the summary within 200 characters"
    if (!formData.category) nextErrors.category = "Please select a category"
    if (!formData.serviceType) nextErrors.serviceType = "Please select a service type"
    if (!formData.description.trim()) nextErrors.description = "Campaign story is required"
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
      nextErrors.targetAmount = "Please enter a valid fundraising target"
    }
    if (!formData.startDate) nextErrors.startDate = "Start date is required"
    if (!formData.endDate) nextErrors.endDate = "End date is required"
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      nextErrors.endDate = "End date must be after the start date"
    }
    if (!formData.beneficiaryName.trim()) nextErrors.beneficiaryName = "Beneficiary name is required"
    if (!formData.countryCode) nextErrors.countryCode = "Please select a country"
    if (!formData.city.trim()) nextErrors.city = "Please enter a city"
    if (!formData.coverImagePreview) nextErrors.coverImage = "Please upload a cover image"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1600)
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

    files.forEach((file, index) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryItems((prev) => {
          const next = [
            ...prev,
            {
              id: `${file.name}-${index}-${Date.now()}`,
              name: file.name,
              preview: reader.result as string,
              source: "upload" as const,
            },
          ]
          return next.slice(0, 5)
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    if (!files.length) return
    updateFormData("documents", [...formData.documents, ...files].slice(0, 5))
  }

  const removeGalleryItem = (id: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id))
  }

  const removeDocument = (index: number) => {
    updateFormData(
      "documents",
      formData.documents.filter((_, i) => i !== index)
    )
  }

  const renderFieldError = (field: string) =>
    errors[field] ? <p className="mt-1.5 text-sm text-destructive">{errors[field]}</p> : null

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "number" ? value : Number(value)
    if (!num || Number.isNaN(num)) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Edit Campaign</h1>
            <p className="text-muted-foreground">
              Update your campaign details, media, and settings in one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden">
            <CardContent className="space-y-8 px-6 pb-6 pt-2">
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Basic information</h2>
                  <p className="text-sm text-muted-foreground">Update the campaign title, summary, category, and service type.</p>
                </div>

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
                      rows={4}
                      value={formData.summary}
                      onChange={(e) => updateFormData("summary", e.target.value.slice(0, 200))}
                      placeholder="Write a concise summary for listing cards and search results."
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
                    <Select value={formData.serviceType} onValueChange={(value) => updateFormData("serviceType", value)}>
                      <SelectTrigger className={errors.serviceType ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("serviceType")}
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Tip: keep the title specific and outcome-focused. Good campaigns make the need, beneficiary, and intended impact immediately clear.
                </div>
              </section>

              <Separator />

              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Campaign details</h2>
                  <p className="text-sm text-muted-foreground">Refine the story, funding target, dates, beneficiary details, and campaign location.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign story *</Label>
                  <Textarea
                    id="description"
                    rows={9}
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Explain the background, what the fundraising will cover, and how contributions will make a difference."
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
                        value={formData.beneficiaryName}
                        onChange={(e) => updateFormData("beneficiaryName", e.target.value)}
                        placeholder="Who will receive the funds?"
                        className={`pl-9 ${errors.beneficiaryName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {renderFieldError("beneficiaryName")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="beneficiaryRelationship">Relationship</Label>
                    <Input
                      id="beneficiaryRelationship"
                      value={formData.beneficiaryRelationship}
                      onChange={(e) => updateFormData("beneficiaryRelationship", e.target.value)}
                      placeholder="e.g. Self, sibling, local organisation"
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
                    <p className="text-xs text-muted-foreground">Select the country where the campaign or beneficiary is located.</p>
                    {renderFieldError("countryCode")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      list="edit-campaign-city-suggestions"
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
                    <datalist id="edit-campaign-city-suggestions">
                      {citySuggestions.map((cityName) => (
                        <option key={cityName} value={cityName} />
                      ))}
                    </datalist>
                    <p className="text-xs text-muted-foreground">Start typing to autofill from cities in the selected country. You can still enter a custom city manually.</p>
                    {renderFieldError("city")}
                  </div>
                </div>
              </section>

              <Separator />

              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Media & documents</h2>
                  <p className="text-sm text-muted-foreground">Manage the cover image, gallery visuals, and supporting documents.</p>
                </div>

                <div className="rounded-2xl border border-dashed bg-muted/20 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Cover image *</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Upload a strong lead image. This will appear on the campaign card and detail page.</p>
                    </div>
                    <label>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
                      <Button type="button" variant="outline" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Change cover image
                        </span>
                      </Button>
                    </label>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border bg-background">
                    {formData.coverImagePreview ? (
                      <div className="relative">
                        <img src={formData.coverImagePreview} alt="Cover preview" className="h-64 w-full object-cover" />
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
                      <p className="mt-1 text-sm text-muted-foreground">Optional supporting visuals to make your campaign page more complete.</p>
                    </div>
                    <label>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryImageChange} />
                      <Button type="button" variant="outline" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Add gallery images
                        </span>
                      </Button>
                    </label>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {galleryItems.length > 0 ? (
                      galleryItems.map((item, index) => (
                        <div key={item.id} className="overflow-hidden rounded-2xl border bg-muted/20">
                          <div className="relative">
                            <img src={item.preview} alt={`Gallery preview ${index + 1}`} className="h-36 w-full object-cover" />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-2 h-8 w-8"
                              onClick={() => removeGalleryItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="border-t px-3 py-2 text-sm text-muted-foreground">{item.name}</div>
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
                      <p className="mt-1 text-sm text-muted-foreground">Upload optional supporting files such as letters, quotations, invoices, or beneficiary documents.</p>
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
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
              </section>

              <Separator />

              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Campaign settings</h2>
                  <p className="text-sm text-muted-foreground">Adjust the campaign status or manage campaign removal before saving your changes.</p>
                </div>

                <div className="space-y-6 rounded-2xl border p-5">
                  <div className="space-y-2">
                    <Label htmlFor="status">Current status</Label>
                    <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Danger zone
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete campaign
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the campaign “{campaign.title}” and all associated data including donations and updates.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete campaign
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard/fund-raiser/campaigns")}>
                  Back to campaigns
                </Button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <Card>
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
                      {formData.serviceType ? (
                        <Badge variant="outline">
                          {serviceTypes.find((type) => type.id === formData.serviceType)?.name ?? formData.serviceType}
                        </Badge>
                      ) : null}
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
                        <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)} raised</span>
                        <span className="text-muted-foreground">Goal {formatCurrency(formData.targetAmount)}</span>
                      </div>
                      <Progress value={Math.min((campaign.raisedAmount / Math.max(Number(formData.targetAmount) || 1, 1)) * 100, 100)} className="h-2" />
                    </div>

                    <div className="grid gap-3 rounded-2xl border bg-background p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Beneficiary</span>
                        <span className="text-right font-medium">{formData.beneficiaryName || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Location</span>
                        <span className="text-right font-medium">{resolvedLocation || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
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
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="mb-2 text-xl">Changes saved successfully</DialogTitle>
            <DialogDescription>Your campaign has been updated successfully.</DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
