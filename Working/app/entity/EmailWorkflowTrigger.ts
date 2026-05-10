import type { EmailTriggerKey } from "@/app/entity/EmailAutomationRule"

export type EmailWorkflowTriggerStatus = "armed" | "watching" | "inactive"

export interface EmailWorkflowTriggerProps {
  ruleKey: EmailTriggerKey
  triggeredWhen: string
  status: EmailWorkflowTriggerStatus
  statusReason: string
  recipientCount: number
  recipientsWithEmailCount: number
  eventLabel?: string
  eventAt?: string
  thresholdLabel?: string
}

export interface EmailWorkflowTriggerSummary {
  ruleKey: EmailTriggerKey
  triggeredWhen: string
  status: EmailWorkflowTriggerStatus
  statusLabel: string
  statusReason: string
  recipientCount: number
  recipientsWithEmailCount: number
  eventLabel?: string
  eventAt?: string
  thresholdLabel?: string
  isReadyNow: boolean
}

export class EmailWorkflowTrigger {
  constructor(private readonly props: EmailWorkflowTriggerProps) {}

  getStatusLabel(): string {
    switch (this.props.status) {
      case "armed":
        return "Ready now"
      case "watching":
        return "Watching"
      case "inactive":
      default:
        return "Inactive"
    }
  }

  isReadyNow(): boolean {
    return this.props.status === "armed"
  }

  toSummary(): EmailWorkflowTriggerSummary {
    return {
      ruleKey: this.props.ruleKey,
      triggeredWhen: this.props.triggeredWhen,
      status: this.props.status,
      statusLabel: this.getStatusLabel(),
      statusReason: this.props.statusReason,
      recipientCount: this.props.recipientCount,
      recipientsWithEmailCount: this.props.recipientsWithEmailCount,
      eventLabel: this.props.eventLabel,
      eventAt: this.props.eventAt,
      thresholdLabel: this.props.thresholdLabel,
      isReadyNow: this.isReadyNow(),
    }
  }
}
