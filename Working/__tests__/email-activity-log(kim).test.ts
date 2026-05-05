import {
  Campaign,
  EmailLog,
  WorkflowTemplate,
  createEmailLog,
  getEmailActivityDisplayState,
  sendManualEmail,
  sendQuickTestEmail,
  sendWorkflowEmail,
  sortEmailLogsNewestFirst,
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
  supporters: [{ name: "Donor One", email: "donor1@test.com" }],
}

const workflow: WorkflowTemplate = {
  id: 1,
  type: "CAMPAIGN_UPDATE",
  enabled: true,
  subject: "Update for {{campaignTitle}}",
  body: "A new campaign update has been posted.",
}

describe("FR-013 View email activity log with existing records", () => {
  test("displays existing email activity records", () => {
    const logs = [
      createEmailLog({
        workflowType: "QUICK_TEST",
        recipientEmail: "test@test.com",
        subject: "Test email",
        body: "Body",
        status: "SENT",
        sentAt: new Date("2026-05-08T10:00:00"),
      }),
    ]

    const displayState = getEmailActivityDisplayState(logs)

    expect(displayState.isEmpty).toBe(false)
    expect(displayState.records).toHaveLength(1)
    expect(displayState.records[0].subject).toBe("Test email")
  })
})

describe("FR-014 View email activity log with no records", () => {
  test("displays empty state message when no email activity exists", () => {
    const displayState = getEmailActivityDisplayState([])

    expect(displayState.isEmpty).toBe(true)
    expect(displayState.message).toBe("No email activity has been recorded yet.")
    expect(displayState.records).toEqual([])
  })
})

describe("FR-015 Verify quick test email appears in activity log", () => {
  test("creates a quick test email log after sending", async () => {
    const mockEmailService = jest.fn(async () => ({ success: true }))
    const mockLogRepository = createMockLogRepository()

    const log = await sendQuickTestEmail({
      workflow,
      testRecipientEmail: "smtp-inbox@test.com",
      emailService: mockEmailService,
      logRepository: mockLogRepository,
    })

    expect(mockEmailService).toHaveBeenCalledWith({
      to: "smtp-inbox@test.com",
      subject: workflow.subject,
      body: workflow.body,
    })
    expect(log.workflowType).toBe("QUICK_TEST")
    expect(log.recipientEmail).toBe("smtp-inbox@test.com")
    expect(log.status).toBe("SENT")
  })
})

describe("FR-016 Verify sent triggered workflow appears in activity log", () => {
  test("creates sent workflow logs after triggered workflow email is sent", async () => {
    const mockEmailService = jest.fn(async () => ({ success: true }))
    const mockLogRepository = createMockLogRepository()

    const result = await sendWorkflowEmail({
      workflow,
      campaign,
      event: {
        type: "CAMPAIGN_UPDATE_POSTED",
        updateTitle: "Update",
        updateContent: "Update body",
      },
      emailService: mockEmailService,
      logRepository: mockLogRepository,
    })

    expect(result.sent).toBe(true)
    expect(result.logs).toHaveLength(1)
    expect(result.logs[0].workflowType).toBe("CAMPAIGN_UPDATE")
    expect(result.logs[0].status).toBe("SENT")
  })
})

describe("FR-018 Verify manual email appears in activity log", () => {
  test("creates manual email log after manual email is sent", async () => {
    const mockEmailService = jest.fn(async () => ({ success: true }))
    const mockLogRepository = createMockLogRepository()

    const logs = await sendManualEmail({
      campaign,
      recipients: [{ name: "Donor One", email: "donor1@test.com" }],
      subject: "Manual campaign update",
      body: "This is a manual update.",
      emailService: mockEmailService,
      logRepository: mockLogRepository,
    })

    expect(mockEmailService).toHaveBeenCalledTimes(1)
    expect(logs).toHaveLength(1)
    expect(logs[0].workflowType).toBe("MANUAL")
    expect(logs[0].recipientEmail).toBe("donor1@test.com")
    expect(logs[0].status).toBe("SENT")
  })
})

describe("FR-019 Verify activity log displays correct details", () => {
  test("keeps recipient, subject, body, status, campaign, and timestamp details", () => {
    const sentAt = new Date("2026-05-08T12:30:00")
    const log = createEmailLog({
      workflowType: "MANUAL",
      recipientEmail: "donor@test.com",
      subject: "Manual email",
      body: "Manual body",
      status: "SENT",
      campaignId: 101,
      sentAt,
    })

    expect(log.workflowType).toBe("MANUAL")
    expect(log.recipientEmail).toBe("donor@test.com")
    expect(log.subject).toBe("Manual email")
    expect(log.body).toBe("Manual body")
    expect(log.status).toBe("SENT")
    expect(log.campaignId).toBe(101)
    expect(log.sentAt).toBe(sentAt)
  })
})

describe("FR-020 Verify new activity appears at top of activity log", () => {
  test("sorts email activity from newest to oldest", () => {
    const logs = [
      createEmailLog({
        workflowType: "MANUAL",
        recipientEmail: "old@test.com",
        subject: "Old email",
        body: "Old body",
        status: "SENT",
        sentAt: new Date("2026-05-01T09:00:00"),
      }),
      createEmailLog({
        workflowType: "QUICK_TEST",
        recipientEmail: "new@test.com",
        subject: "New email",
        body: "New body",
        status: "SENT",
        sentAt: new Date("2026-05-08T09:00:00"),
      }),
    ]

    const sortedLogs = sortEmailLogsNewestFirst(logs)

    expect(sortedLogs[0].subject).toBe("New email")
    expect(sortedLogs[1].subject).toBe("Old email")
  })
})

describe("FR-021 Verify activity log persistence after page refresh", () => {
  test("retrieves stored email logs after simulated refresh/reload", async () => {
    const storedLogs: EmailLog[] = []
    let nextId = 1

    const mockPersistentRepository = {
      create: jest.fn(async (log: Omit<EmailLog, "id">): Promise<EmailLog> => {
        const savedLog = { id: nextId++, ...log }
        storedLogs.push(savedLog)
        return savedLog
      }),
      findMany: jest.fn(async (): Promise<EmailLog[]> => storedLogs),
    }

    await sendManualEmail({
      campaign,
      recipients: [{ name: "Donor One", email: "donor1@test.com" }],
      subject: "Persistent email",
      body: "This should remain after refresh.",
      emailService: jest.fn(async () => ({ success: true })),
      logRepository: mockPersistentRepository,
    })

    const logsAfterRefresh = await mockPersistentRepository.findMany()
    const displayState = getEmailActivityDisplayState(logsAfterRefresh)

    expect(logsAfterRefresh).toHaveLength(1)
    expect(displayState.records[0].subject).toBe("Persistent email")
  })
})
