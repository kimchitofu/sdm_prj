import {
  Campaign,
  EmailLog,
  SendWorkflowResult,
  TriggerEvent,
  WorkflowTemplate,
  sendWorkflowEmail,
  shouldSendWorkflowEmail,
} from "./test-helpers/emailAutomationTestHelpers"

function createMockLogRepository() {
  let nextId = 1

  return {
    create: jest.fn(async (log: Omit<EmailLog, "id">): Promise<EmailLog> => ({
      id: nextId++,
      ...log,
    })),
  }
}

const campaign: Campaign = {
  id: 101,
  title: "Flood Relief Campaign",
  raisedAmount: 5000,
  targetAmount: 10000,
  fundraiserEmail: "fundraiser@test.com",
  supporters: [
    { name: "Donor One", email: "donor1@test.com" },
    { name: "Donor Two", email: "donor2@test.com" },
  ],
}

const campaignUpdateWorkflow: WorkflowTemplate = {
  id: 1,
  type: "CAMPAIGN_UPDATE",
  enabled: true,
  subject: "Update for {{campaignTitle}}: {{campaignUpdateTitle}}",
  body: "{{campaignUpdateContent}} Raised: {{raisedAmount}} / {{targetAmount}}.",
}

const thankYouWorkflow: WorkflowTemplate = {
  id: 2,
  type: "THANK_YOU",
  enabled: true,
  subject: "Thank you, {{donorName}}",
  body: "Thank you for your donation of {{donationAmount}} to {{campaignTitle}}.",
}

const milestoneWorkflow: WorkflowTemplate = {
  id: 3,
  type: "MILESTONE_UPDATE",
  enabled: true,
  subject: "{{campaignTitle}} reached {{milestonePercentage}}%",
  body: "We have reached {{milestonePercentage}}% of our target.",
}

const newDonationAlertWorkflow: WorkflowTemplate = {
  id: 4,
  type: "NEW_DONATION_ALERT",
  enabled: true,
  subject: "New donation received",
  body: "A new donation was received for {{campaignTitle}}.",
}

async function runWorkflowTest(workflow: WorkflowTemplate, event: TriggerEvent): Promise<SendWorkflowResult> {
  const mockEmailService = jest.fn(async () => ({ success: true }))
  const mockLogRepository = createMockLogRepository()

  const result = await sendWorkflowEmail({
    workflow,
    campaign,
    event,
    emailService: mockEmailService,
    logRepository: mockLogRepository,
  })

  expect(mockEmailService).toHaveBeenCalledTimes(result.recipients.length)
  expect(mockLogRepository.create).toHaveBeenCalledTimes(result.recipients.length)

  return result
}

describe("FR-006 Send campaign update workflow email automatically", () => {
  test("sends campaign update email to campaign supporters and records activity logs", async () => {
    const result = await runWorkflowTest(campaignUpdateWorkflow, {
      type: "CAMPAIGN_UPDATE_POSTED",
      updateTitle: "Shelter supplies delivered",
      updateContent: "We delivered emergency shelter supplies today.",
    })

    expect(result.sent).toBe(true)
    expect(result.recipients).toEqual(["donor1@test.com", "donor2@test.com"])
    expect(result.logs).toHaveLength(2)
    expect(result.logs[0].subject).toContain("Shelter supplies delivered")
    expect(result.logs[0].status).toBe("SENT")
  })
})

describe("FR-007 Send thank-you workflow email automatically", () => {
  test("sends thank-you email to the donor after donation completion", async () => {
    const result = await runWorkflowTest(thankYouWorkflow, {
      type: "DONATION_COMPLETED",
      donorName: "Jamie Donor",
      donorEmail: "jamie@test.com",
      donationAmount: 50,
    })

    expect(result.sent).toBe(true)
    expect(result.recipients).toEqual(["jamie@test.com"])
    expect(result.logs[0].subject).toBe("Thank you, Jamie Donor")
    expect(result.logs[0].body).toContain("50")
  })
})

describe("FR-008 Send milestone update workflow email automatically", () => {
  test("sends milestone update email to campaign supporters after milestone is reached", async () => {
    const result = await runWorkflowTest(milestoneWorkflow, {
      type: "MILESTONE_REACHED",
      milestonePercentage: 50,
      previousRaisedAmount: 4500,
      newRaisedAmount: 5000,
    })

    expect(result.sent).toBe(true)
    expect(result.recipients).toEqual(["donor1@test.com", "donor2@test.com"])
    expect(result.logs[0].subject).toBe("Flood Relief Campaign reached 50%")
  })
})

describe("FR-009 Send new donation alert email automatically", () => {
  test("sends new donation alert email to the fund raiser", async () => {
    const result = await runWorkflowTest(newDonationAlertWorkflow, {
      type: "DONATION_COMPLETED",
      donorName: "Alex Donor",
      donorEmail: "alex@test.com",
      donationAmount: 100,
    })

    expect(result.sent).toBe(true)
    expect(result.recipients).toEqual(["fundraiser@test.com"])
    expect(result.logs[0].workflowType).toBe("NEW_DONATION_ALERT")
  })
})

describe("FR-010 Prevent automatic workflow email when workflow is disabled", () => {
  test("does not send or log email when the workflow is disabled", async () => {
    const mockEmailService = jest.fn(async () => ({ success: true }))
    const mockLogRepository = createMockLogRepository()

    const result = await sendWorkflowEmail({
      workflow: { ...thankYouWorkflow, enabled: false },
      campaign,
      event: {
        type: "DONATION_COMPLETED",
        donorEmail: "donor@test.com",
      },
      emailService: mockEmailService,
      logRepository: mockLogRepository,
    })

    expect(result.sent).toBe(false)
    expect(result.reason).toBe("WORKFLOW_DISABLED")
    expect(mockEmailService).not.toHaveBeenCalled()
    expect(mockLogRepository.create).not.toHaveBeenCalled()
  })
})

describe("FR-011 Prevent automatic workflow email when trigger condition is not met", () => {
  test("does not send email when the event type does not match the workflow trigger", async () => {
    const mockEmailService = jest.fn(async () => ({ success: true }))
    const mockLogRepository = createMockLogRepository()

    const result = await sendWorkflowEmail({
      workflow: campaignUpdateWorkflow,
      campaign,
      event: {
        type: "DONATION_COMPLETED",
        donorEmail: "donor@test.com",
      },
      emailService: mockEmailService,
      logRepository: mockLogRepository,
    })

    expect(result.sent).toBe(false)
    expect(result.reason).toBe("TRIGGER_NOT_MET")
    expect(mockEmailService).not.toHaveBeenCalled()
    expect(mockLogRepository.create).not.toHaveBeenCalled()
  })

  test("returns false when checking send eligibility before a trigger occurs", () => {
    const canSend = shouldSendWorkflowEmail(campaignUpdateWorkflow, campaign, {
      type: "DONATION_COMPLETED",
    })

    expect(canSend).toBe(false)
  })
})

describe("FR-012 Prevent workflow email when no valid recipient emails are available", () => {
  test("does not send or log email when recipients are invalid or unavailable", async () => {
    const campaignWithInvalidRecipients: Campaign = {
      ...campaign,
      supporters: [
        { name: "No Email", email: "" },
        { name: "Invalid Email", email: "not-an-email" },
      ],
    }
    const mockEmailService = jest.fn(async () => ({ success: true }))
    const mockLogRepository = createMockLogRepository()

    const result = await sendWorkflowEmail({
      workflow: campaignUpdateWorkflow,
      campaign: campaignWithInvalidRecipients,
      event: {
        type: "CAMPAIGN_UPDATE_POSTED",
        updateTitle: "New update",
        updateContent: "Update content",
      },
      emailService: mockEmailService,
      logRepository: mockLogRepository,
    })

    expect(result.sent).toBe(false)
    expect(result.reason).toBe("NO_VALID_RECIPIENTS")
    expect(mockEmailService).not.toHaveBeenCalled()
    expect(mockLogRepository.create).not.toHaveBeenCalled()
  })
})
