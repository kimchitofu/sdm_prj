"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareHeart,
  PencilLine,
  Save,
  Send,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StatsCard } from "@/components/ui/stats-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { EmailAutomationController } from "@/app/controller/EmailAutomationController"
import { isDonorSegmentKey, type DonorSegmentKey } from "@/app/entity/Donor"
import { getEmailDraftToneLabel, type EmailDraftPurpose, type EmailDraftSummary, type EmailDraftTone } from "@/app/entity/EmailDraft"
import type { EmailTriggerKey, EmailAutomationRuleSummary } from "@/app/entity/EmailAutomationRule"
import type { EmailLogSummary } from "@/app/entity/EmailLog"
import type { EmailTemplateSummary } from "@/app/entity/EmailTemplate"
import { campaigns, donations, users } from "@/lib/mock-data"

const emailAutomationController = new EmailAutomationController(campaigns, donations, users)
const defaultFundRaiserUser = emailAutomationController.getDefaultFundRaiserUser() || users[0]
const toneOptions: EmailDraftTone[] = ["warm", "appreciative", "professional", "urgent"]
const emailPurposeOptions: Array<{ value: EmailDraftPurpose; label: string }> = [
  { value: "campaign_update", label: "Campaign update" },
  { value: "thank_you", label: "Thank-you" },
  { value: "milestone_update", label: "Milestone update" },
  { value: "re_engagement", label: "Re-engagement" },
  { value: "custom", label: "Custom purpose" },
]
const workflowOrder: EmailTriggerKey[] = ["manual_update", "thank_you", "milestone", "fundraiser_coaching"]

function formatDateTime(value?: string) {
  if (!value) return "No event timestamp"
  return new Date(value).toLocaleString()
}
export default function FundRaiserEmailsPage() {
  const searchParams = useSearchParams()
  const initialSegment = searchParams.get("segment")
  const initialCampaignId = searchParams.get("campaignId") || ""
  const initialSuggestedCampaignId = emailAutomationController.buildDashboard(
    defaultFundRaiserUser.id,
    emailAutomationController.createDefaultRules(),
    emailAutomationController.createDefaultTemplates(),
    [],
    {
      segment: isDonorSegmentKey(initialSegment) ? initialSegment : undefined,
      campaignId: initialCampaignId || undefined,
    }
  ).suggestedCampaignId || ""

  const [activeSection, setActiveSection] = useState<"automatic" | "manual">("automatic")
  const [rules, setRules] = useState<EmailAutomationRuleSummary[]>(() => emailAutomationController.createDefaultRules())
  const [templates, setTemplates] = useState<EmailTemplateSummary[]>(() => emailAutomationController.createDefaultTemplates())
  const [activityLogs, setActivityLogs] = useState<EmailLogSummary[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId || initialSuggestedCampaignId)
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<DonorSegmentKey>(
    isDonorSegmentKey(initialSegment) ? initialSegment : "high_value"
  )
  const [selectedWorkflowKey, setSelectedWorkflowKey] = useState<EmailTriggerKey>("manual_update")
  const [templateSubject, setTemplateSubject] = useState("")
  const [templateBody, setTemplateBody] = useState("")
  const [manualPurpose, setManualPurpose] = useState<EmailDraftPurpose>("campaign_update")
  const [customPurposeText, setCustomPurposeText] = useState("")
  const [manualTone, setManualTone] = useState<EmailDraftTone>("warm")
  const [additionalPrompt, setAdditionalPrompt] = useState("")
  const [generatedDraft, setGeneratedDraft] = useState<EmailDraftSummary | null>(null)
  const [savedDrafts, setSavedDrafts] = useState<EmailDraftSummary[]>([])
  const [variationIndex, setVariationIndex] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [manualAiStatus, setManualAiStatus] = useState<{ type: "idle" | "error" | "success"; message: string }>({
    type: "idle",
    message: "",
  })

  const currentUser = useCurrentUser({
    id: defaultFundRaiserUser.id,
    email: defaultFundRaiserUser.email,
    role: defaultFundRaiserUser.role,
    displayName: defaultFundRaiserUser.displayName,
    firstName: defaultFundRaiserUser.firstName,
    lastName: defaultFundRaiserUser.lastName,
    isVerified: defaultFundRaiserUser.isVerified,
    status: defaultFundRaiserUser.status,
    createdAt: defaultFundRaiserUser.createdAt,
    avatar: defaultFundRaiserUser.avatar,
  })

  const resolvedFundRaiserUser =
    emailAutomationController.resolveFundRaiserUser(currentUser) || defaultFundRaiserUser

  const dashboard = useMemo(
    () =>
      emailAutomationController.buildDashboard(resolvedFundRaiserUser.id, rules, templates, activityLogs, {
        segment: selectedSegmentKey,
        campaignId: selectedCampaignId,
      }),
    [resolvedFundRaiserUser.id, rules, templates, activityLogs, selectedSegmentKey, selectedCampaignId]
  )

  const selectedCampaign =
    dashboard.fundRaiserCampaigns.find((campaign) => campaign.id === selectedCampaignId) ||
    dashboard.fundRaiserCampaigns[0]

  const selectedWorkflow =
    dashboard.workflowItems.find((item) => item.rule.key === selectedWorkflowKey) ||
    dashboard.workflowItems[0]

  const selectedSegment = dashboard.selectedSegment
  const automaticAudience = selectedWorkflow?.audiencePreview
  const selectedTrigger = selectedWorkflow?.triggerSummary
  const isCoachingWorkflow = selectedWorkflow?.rule.key === "fundraiser_coaching"

  useEffect(() => {
    const hasSelectedCampaign = dashboard.fundRaiserCampaigns.some((campaign) => campaign.id === selectedCampaignId)
    if ((!selectedCampaignId || !hasSelectedCampaign) && dashboard.suggestedCampaignId) {
      setSelectedCampaignId(dashboard.suggestedCampaignId)
    }
  }, [selectedCampaignId, dashboard.suggestedCampaignId, dashboard.fundRaiserCampaigns])

  useEffect(() => {
    if (selectedWorkflow?.template) {
      setTemplateSubject(selectedWorkflow.template.subjectTemplate)
      setTemplateBody(selectedWorkflow.template.bodyTemplate)
    }
  }, [selectedWorkflow?.template?.ruleKey, selectedWorkflow?.template?.subjectTemplate, selectedWorkflow?.template?.bodyTemplate])

  useEffect(() => {
    setSavedDrafts(emailAutomationController.getSavedDrafts(resolvedFundRaiserUser.id))
  }, [resolvedFundRaiserUser.id])

  const handleToggleRule = (ruleId: string) => {
    setRules((current) => emailAutomationController.toggleRule(current, ruleId))
  }

  const handleSaveTemplate = () => {
    if (!selectedWorkflow?.template) return

    setTemplates((current) =>
      emailAutomationController.updateTemplate(current, selectedWorkflow.template!.ruleKey, {
        subjectTemplate: templateSubject,
        bodyTemplate: templateBody,
      })
    )

    toast({ title: "Template updated", description: "The email template has been updated for this workflow." })
  }

  const handleResetTemplate = () => {
    if (!selectedWorkflow?.template) return

    const nextTemplates = emailAutomationController.resetTemplate(templates, selectedWorkflow.template.ruleKey)
    setTemplates(nextTemplates)

    const resetTemplate = nextTemplates.find((item) => item.ruleKey === selectedWorkflow.template?.ruleKey)
    setTemplateSubject(resetTemplate?.subjectTemplate || "")
    setTemplateBody(resetTemplate?.bodyTemplate || "")

    toast({ title: "Template reset", description: "The workflow template was reset to its default version." })
  }

  const handleQuickTest = async () => {
    if (!selectedWorkflow?.template) return

    try {
      const result = await emailAutomationController.sendQuickTestEmail({
        ruleKey: selectedWorkflow.rule.key,
        templateSummary: selectedWorkflow.template,
        fundRaiserUser: resolvedFundRaiserUser,
        campaign: selectedCampaign,
        selectedSegment: selectedWorkflow.rule.audience === "donor" ? selectedSegment : undefined,
      })

      setActivityLogs((current) => [result.log, ...current])
      toast({ title: "Quick test sent", description: "Test email sent to the configured SMTP inbox." })
    } catch (error) {
      toast({
        title: "Unable to send quick test",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAutomaticDelivery = async (deliveryMode: "send" | "queue") => {
    if (!selectedWorkflow?.template) return

    try {
      const result = await emailAutomationController.deliverAutomaticWorkflowEmail({
        ruleKey: selectedWorkflow.rule.key,
        templateSummary: selectedWorkflow.template,
        fundRaiserUser: resolvedFundRaiserUser,
        campaign: selectedCampaign,
        deliveryMode,
        logs: activityLogs,
      })

      setActivityLogs((current) => [result.log, ...current])
      toast({
        title: deliveryMode === "send" ? "Triggered workflow sent" : "Triggered workflow queued",
        description:
          deliveryMode === "send"
            ? `Email sent to ${result.deliveredCount} recipient${result.deliveredCount === 1 ? "" : "s"}.`
            : "The matched event was queued for this workflow.",
      })
    } catch (error) {
      toast({
        title: deliveryMode === "send" ? "Unable to send workflow" : "Unable to queue workflow",
        description: error instanceof Error ? error.message : "Please review the selected campaign and try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateDraft = async (regenerate = false) => {
    if (!selectedCampaign || !selectedSegment) {
      const message = "Select a campaign context and donor segment first."
      setManualAiStatus({ type: "error", message })
      toast({
        title: "Missing audience",
        description: message,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setManualAiStatus({
      type: "idle",
      message: regenerate ? "Generating another variation..." : "Generating AI draft...",
    })

    try {
      const nextVariation = regenerate ? variationIndex + 1 : 1
      const draft = await emailAutomationController.generateAiDraft({
        campaign: selectedCampaign,
        selectedSegment,
        purpose: manualPurpose,
        tone: manualTone,
        variationIndex: nextVariation,
        additionalPrompt,
        customPurposeText: manualPurpose === "custom" ? customPurposeText : undefined,
      })

      setVariationIndex(nextVariation)
      setGeneratedDraft(draft)
      setManualAiStatus({
        type: "success",
        message: regenerate ? "A new variation was generated." : "AI draft generated. You can edit it before sending.",
      })
      toast({
        title: regenerate ? "New variation generated" : "AI draft generated",
        description: "You can edit the subject and message before saving or sending.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again."
      setManualAiStatus({ type: "error", message })
      toast({
        title: "Unable to generate AI draft",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDraft = () => {
    if (!generatedDraft) {
      toast({ title: "No draft to save", description: "Generate or edit a draft first.", variant: "destructive" })
      return
    }

    const nextDrafts = emailAutomationController.saveDraft(resolvedFundRaiserUser.id, generatedDraft)
    setSavedDrafts(nextDrafts)
    toast({ title: "Draft saved", description: "The generated draft was saved for later use." })
  }

  const handleManualDelivery = async (deliveryMode: "send" | "queue") => {
    if (!generatedDraft) {
      toast({
        title: "No draft selected",
        description: "Generate or choose a saved draft first.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await emailAutomationController.deliverManualAudienceEmail({
        draft: generatedDraft,
        campaign: selectedCampaign,
        selectedSegment,
        deliveryMode,
      })

      setActivityLogs((current) => [result.log, ...current])
      toast({
        title: deliveryMode === "send" ? "Manual update sent" : "Manual update queued",
        description:
          deliveryMode === "send"
            ? `Email sent to ${result.deliveredCount} recipient${result.deliveredCount === 1 ? "" : "s"}.`
            : "The manual update was queued for the selected donor segment.",
      })
    } catch (error) {
      toast({
        title: deliveryMode === "send" ? "Unable to send manual update" : "Unable to queue manual update",
        description: error instanceof Error ? error.message : "Please review the selected campaign and audience.",
        variant: "destructive",
      })
    }
  }

  const handleGeneratedDraftChange = (field: "subject" | "body", value: string) => {
    setGeneratedDraft((current) => {
      if (!current) return current
      return {
        ...current,
        [field]: value,
      }
    })
  }

  const handleUseSavedDraft = (draft: EmailDraftSummary) => {
    setGeneratedDraft(draft)
    setManualAiStatus({ type: "idle", message: "Saved draft loaded." })
    if (draft.segmentKey) {
      setSelectedSegmentKey(draft.segmentKey)
    }
    toast({ title: "Draft loaded", description: "The saved draft is now ready for editing or sending." })
  }

  const handleDeleteDraft = (draftId: string) => {
    const nextDrafts = emailAutomationController.deleteSavedDraft(resolvedFundRaiserUser.id, draftId)
    setSavedDrafts(nextDrafts)

    if (generatedDraft?.id === draftId) {
      setGeneratedDraft(null)
    }

    toast({ title: "Draft deleted", description: "The saved draft was removed." })
  }

  const automaticActionsDisabled =
    !selectedWorkflow?.rule.isEnabled || !selectedTrigger?.isReadyNow || !selectedWorkflow?.template
  const hasCustomPurpose = manualPurpose !== "custom" || Boolean(customPurposeText.trim())
  const canGenerateAi = Boolean(selectedCampaign && selectedSegment && hasCustomPurpose)
  const manualDeliveryDisabled = !generatedDraft || !selectedSegment || selectedSegment.recipientsWithEmailCount <= 0

  return (
    <DashboardLayout role="fund_raiser">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email automation</h1>
            <p className="text-muted-foreground">
              Manage automatic donor workflows, AI-assisted campaign updates, and live email activity from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={activeSection === "automatic" ? "default" : "outline"} onClick={() => setActiveSection("automatic")}>
              <MessageSquareHeart className="mr-2 h-4 w-4" />
              Automatic workflows
            </Button>
            <Button type="button" variant={activeSection === "manual" ? "default" : "outline"} onClick={() => setActiveSection("manual")}>
              <WandSparkles className="mr-2 h-4 w-4" />
              Manual updates
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Emails sent" value={dashboard.stats.emailsSent} icon={<Mail className="h-4 w-4" />} />
          <StatsCard title="Donor emails" value={dashboard.stats.donorEmailsSent} icon={<MessageSquareHeart className="h-4 w-4" />} />
          <StatsCard title="Fund-raiser emails" value={dashboard.stats.fundRaiserEmailsSent} icon={<Send className="h-4 w-4" />} />
          <StatsCard title="Active workflows" value={dashboard.stats.activeRules} icon={<CheckCircle2 className="h-4 w-4" />} />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-6 py-3">
          <span className="text-base font-semibold text-foreground">Campaign context</span>
          <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
            <SelectTrigger className="h-9 w-full border-0 bg-transparent px-2 shadow-none md:w-[320px]">
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {dashboard.fundRaiserCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeSection === "automatic" ? (
<div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
  <Card>
    <CardHeader>
      <CardTitle>Automatic workflows</CardTitle>
      <CardDescription>
        Turn workflows on or off, then select one to edit its template.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {workflowOrder.map((workflowKey) => {
        const item = dashboard.workflowItems.find((entry) => entry.rule.key === workflowKey)
        if (!item) return null

        const isSelected = item.rule.key === selectedWorkflowKey

        return (
          <button
            key={item.rule.id}
            type="button"
            onClick={() => setSelectedWorkflowKey(item.rule.key)}
            className={`w-full rounded-lg border p-4 text-left transition ${
              isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.rule.label}</p>
                  {isSelected ? <Badge variant="secondary">Selected</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{item.rule.description}</p>
                <p className="text-xs text-muted-foreground">
                  Trigger: {item.triggerSummary.triggeredWhen}
                </p>
              </div>

              <Switch
                checked={item.rule.isEnabled}
                onCheckedChange={() => handleToggleRule(item.rule.id)}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </button>
        )
      })}
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>{selectedWorkflow?.template?.label || "Workflow template"}</CardTitle>
      <CardDescription>
        Edit the selected workflow template, then test, queue, or send it when needed.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Trigger:</span>{" "}
        {selectedTrigger?.triggeredWhen || "Choose a workflow to view its trigger."}
        {selectedTrigger?.eventAt ? (
          <>
            {" "}Last matched event: {formatDateTime(selectedTrigger.eventAt)}.
          </>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-sm text-muted-foreground">Audience</p>
          <p className="text-base font-semibold">{automaticAudience?.label || "No workflow selected"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-sm text-muted-foreground">Recipients</p>
          <p className="text-2xl font-semibold">{automaticAudience?.recipientCount ?? 0}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-sm text-muted-foreground">Emails captured</p>
          <p className="text-2xl font-semibold">{automaticAudience?.recipientsWithEmailCount ?? 0}</p>
        </div>
      </div>

      {isCoachingWorkflow ? (
        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          Fundraising coaching prompts are generated by the system from campaign activity and are not manually edited here.
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium">Subject template</label>
        <Input value={templateSubject} onChange={(event) => setTemplateSubject(event.target.value)} readOnly={isCoachingWorkflow} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Body template</label>
        <Textarea
          value={templateBody}
          onChange={(event) => setTemplateBody(event.target.value)}
          rows={10}
          readOnly={isCoachingWorkflow}
        />
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        Supported placeholders: <code>{"{{campaignTitle}}"}</code>, <code>{"{{raisedAmount}}"}</code>, <code>{"{{targetAmount}}"}</code>, <code>{"{{donorCount}}"}</code>, <code>{"{{milestonePercent}}"}</code>, <code>{"{{fundRaiserName}}"}</code>
      </div>

      <div className="flex flex-wrap gap-2">
        {!isCoachingWorkflow ? (
          <>
            <Button type="button" onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Save template
            </Button>
            <Button type="button" variant="outline" onClick={handleResetTemplate}>
              <PencilLine className="mr-2 h-4 w-4" />
              Reset default
            </Button>
          </>
        ) : null}
        <Button type="button" variant="outline" onClick={handleQuickTest}>
          <Mail className="mr-2 h-4 w-4" />
          Quick test
        </Button>
        <Button type="button" variant="outline" onClick={() => handleAutomaticDelivery("queue")} disabled={automaticActionsDisabled}>
          <Clock3 className="mr-2 h-4 w-4" />
          Queue triggered workflow
        </Button>
        <Button type="button" onClick={() => handleAutomaticDelivery("send")} disabled={automaticActionsDisabled}>
          <Send className="mr-2 h-4 w-4" />
          Send triggered workflow
        </Button>
      </div>

      {automaticActionsDisabled ? (
        <p className="text-sm text-muted-foreground">
          {!selectedWorkflow?.rule.isEnabled
            ? "Turn this workflow on before queueing or sending it."
            : selectedTrigger?.statusReason || "This workflow is waiting for its trigger condition."}
        </p>
      ) : null}
    </CardContent>
  </Card>
</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle>Manual updates</CardTitle>
                <CardDescription>
                  Choose a donor segment and email purpose, then generate an AI-assisted draft for the selected campaign context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Donor segment</label>
                  <Select value={selectedSegmentKey} onValueChange={(value) => setSelectedSegmentKey(value as DonorSegmentKey)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a donor segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {dashboard.segmentOptions.map((segment) => (
                        <SelectItem key={segment.key} value={segment.key}>
                          {segment.label} ({segment.recipientCount} recipients)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Recipients</p>
                    <p className="text-2xl font-semibold">{selectedSegment?.recipientCount ?? 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Emails captured</p>
                    <p className="text-2xl font-semibold">{selectedSegment?.recipientsWithEmailCount ?? 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Selected audience</p>
                    <p className="text-base font-semibold">{selectedSegment?.label || "No segment selected"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email purpose</label>
                  <Select value={manualPurpose} onValueChange={(value) => setManualPurpose(value as EmailDraftPurpose)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailPurposeOptions.map((purpose) => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {manualPurpose === "custom" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom purpose</label>
                    <Input
                      value={customPurposeText}
                      onChange={(event) => setCustomPurposeText(event.target.value)}
                      placeholder="Example: Invite past donors to share the campaign with colleagues this week."
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={manualTone} onValueChange={(value) => setManualTone(value as EmailDraftTone)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((tone) => (
                        <SelectItem key={tone} value={tone}>
                          {getEmailDraftToneLabel(tone)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional prompt message</label>
                  <Textarea
                    value={additionalPrompt}
                    onChange={(event) => setAdditionalPrompt(event.target.value)}
                    rows={5}
                    placeholder="Example: Mention that the campaign update should sound hopeful and highlight how close we are to the next target."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => handleGenerateDraft(false)} disabled={isGenerating || !canGenerateAi}>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate with AI"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleGenerateDraft(true)} disabled={isGenerating || !generatedDraft || !canGenerateAi}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerate variation
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={!generatedDraft}>
                    <Save className="mr-2 h-4 w-4" />
                    Save generated content
                  </Button>
                </div>

                {!canGenerateAi ? (
                  <p className="text-sm text-muted-foreground">Select a campaign context, donor segment, and email purpose to generate an AI draft.</p>
                ) : null}
                {isGenerating ? <p className="text-sm text-muted-foreground">Generating AI draft...</p> : null}
                {!isGenerating && manualAiStatus.message ? (
                  <p className={`text-sm ${manualAiStatus.type === "error" ? "text-destructive" : manualAiStatus.type === "success" ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {manualAiStatus.message}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated draft</CardTitle>
                <CardDescription>
                  Review and edit the AI-generated draft before sending it to the selected donor segment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={generatedDraft?.subject || ""}
                    onChange={(event) => handleGeneratedDraftChange("subject", event.target.value)}
                    placeholder="Generate a draft to start editing"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Body</label>
                  <Textarea
                    value={generatedDraft?.body || ""}
                    onChange={(event) => handleGeneratedDraftChange("body", event.target.value)}
                    rows={12}
                    placeholder="The AI-generated draft will appear here."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => handleManualDelivery("send")} disabled={manualDeliveryDisabled}>
                    <Send className="mr-2 h-4 w-4" />
                    Send now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Email activity</CardTitle>
              <CardDescription>
                Recent workflow tests, queued emails, and sent emails from both the automatic and manual sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No email activity yet. Run a quick test, queue a workflow, or send a manual update.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboard.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{log.ruleLabel}</p>
                            <p className="text-xs text-muted-foreground">{log.campaignTitle || "No campaign"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{log.recipientName}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === "sent" ? "default" : "secondary"}>{log.statusLabel}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[340px] truncate">{log.subject}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved AI drafts</CardTitle>
              <CardDescription>
                Reuse previously generated drafts, then continue editing or sending them from the manual update flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedDrafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved drafts yet.</p>
              ) : (
                savedDrafts.map((draft) => (
                  <div key={draft.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{draft.subject}</p>
                        <p className="text-sm text-muted-foreground">{draft.previewText}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge variant="secondary">{draft.toneLabel}</Badge>
                          {draft.segmentLabel ? <Badge variant="outline">{draft.segmentLabel}</Badge> : null}
                          <Badge variant="outline">{draft.variationLabel}</Badge>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleUseSavedDraft(draft)}>
                          Use draft
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleDeleteDraft(draft.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
