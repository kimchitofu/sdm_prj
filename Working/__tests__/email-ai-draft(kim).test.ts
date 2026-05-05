import {
  AiDraft,
  AiDraftPayload,
  buildAiDraftPayload,
  canGenerateAiDraft,
  generateAiDraft,
  regenerateAiDraftVariation,
} from "./test-helpers/emailAutomationTestHelpers"

const baseInput = {
  campaignId: "1",
  campaignTitle: "Flood Relief Campaign",
  donorSegment: "All donors",
  purpose: "Campaign update",
  tone: "Warm",
  additionalInstructions: "Mention that every small donation helps.",
}

describe("FR-001 Generate AI-assisted email draft", () => {
  test("builds a valid AI generation request and displays generated subject and body", async () => {
    const mockAiService = jest.fn(async (_payload: AiDraftPayload): Promise<AiDraft> => ({
      subject: "Support Flood Relief Campaign",
      body: "Thank you for supporting Flood Relief Campaign.",
    }))

    const draft = await generateAiDraft(baseInput, mockAiService)

    expect(mockAiService).toHaveBeenCalledWith({
      campaignId: "1",
      campaignTitle: "Flood Relief Campaign",
      donorSegment: "All donors",
      purpose: "Campaign update",
      tone: "Warm",
      additionalInstructions: "Mention that every small donation helps.",
      regenerate: false,
    })
    expect(draft.subject).toBe("Support Flood Relief Campaign")
    expect(draft.body).toContain("Flood Relief Campaign")
  })
})

describe("FR-002 Generate AI draft with custom purpose", () => {
  test("uses the typed custom purpose instead of the default purpose label", () => {
    const payload = buildAiDraftPayload({
      ...baseInput,
      purpose: "Custom",
      customPurpose: "Invite donors to attend the campaign appreciation event",
    })

    expect(payload.purpose).toBe("Invite donors to attend the campaign appreciation event")
  })
})

describe("FR-003 Prevent AI draft generation when custom purpose is blank", () => {
  test("disables generation when custom purpose is selected but left blank", () => {
    const input = {
      ...baseInput,
      purpose: "Custom",
      customPurpose: "   ",
    }

    expect(canGenerateAiDraft(input)).toBe(false)
    expect(() => buildAiDraftPayload(input)).toThrow(
      "AI draft generation requires campaign, donor segment, purpose, and tone.",
    )
  })
})

describe("FR-004 Generate AI draft with additional prompt instructions", () => {
  test("includes additional prompt instructions in the AI request payload", () => {
    const payload = buildAiDraftPayload({
      ...baseInput,
      additionalInstructions: "Keep it concise and include a friendly closing.",
    })

    expect(payload.additionalInstructions).toBe("Keep it concise and include a friendly closing.")
  })
})

describe("FR-005 Regenerate AI draft variation", () => {
  test("submits another AI request with regenerate flag enabled", async () => {
    const mockAiService = jest
      .fn(async (_payload: AiDraftPayload): Promise<AiDraft> => ({
        subject: "Fallback subject",
        body: "Fallback body",
      }))
      .mockImplementationOnce(async () => ({
        subject: "First subject",
        body: "First body",
      }))
      .mockImplementationOnce(async () => ({
        subject: "Second subject",
        body: "Second body",
      }))

    const firstDraft = await generateAiDraft(baseInput, mockAiService)
    const secondDraft = await regenerateAiDraftVariation(baseInput, mockAiService)

    expect(firstDraft.subject).toBe("First subject")
    expect(secondDraft.subject).toBe("Second subject")
    expect(mockAiService).toHaveBeenLastCalledWith(
      expect.objectContaining({ regenerate: true }),
    )
  })
})
