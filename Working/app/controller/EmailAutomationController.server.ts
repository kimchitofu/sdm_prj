"use server"

import { EmailGenerationRequest, type EmailGenerationRequestPayload } from "@/app/entity/EmailGenerationRequest"
import { EmailDraft, type EmailDraftSummary } from "@/app/entity/EmailDraft"
import { getDonorSegmentLabel } from "@/app/entity/Donor"

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
    status?: string
  }
}

const DEFAULT_PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"
const DEFAULT_FALLBACK_MODELS = ["gemini-2.5-flash-lite"]

export async function generateAiDraftServer(body: EmailGenerationRequestPayload): Promise<EmailDraftSummary> {
  const generationRequest = new EmailGenerationRequest(body)
  const validationError = generationRequest.validate()

  if (validationError) {
    throw new Error(validationError)
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it to your .env.local file before using AI draft generation.")
  }

  const modelsToTry = [
    DEFAULT_PRIMARY_MODEL,
    ...DEFAULT_FALLBACK_MODELS.filter((model) => model !== DEFAULT_PRIMARY_MODEL),
  ]

  let lastErrorMessage = "Gemini API request failed while generating the email draft."

  for (const modelName of modelsToTry) {
    const attempt = await requestDraftFromGemini({ apiKey, modelName, generationRequest })

    if (attempt.ok) {
      const parsed = parseDraftJson(attempt.text)

      if (!parsed.subject || !parsed.body) {
        lastErrorMessage =
          "Gemini returned a response, but it was not in the expected subject/body JSON format. Try generating again."
        continue
      }

      const draft = new EmailDraft({
        id: `ai-draft-${Date.now()}`,
        campaignId: body.campaignId,
        campaignTitle: body.campaignTitle,
        segmentKey: body.segmentKey,
        purpose: body.purpose,
        tone: body.tone,
        subject: parsed.subject.trim(),
        body: parsed.body.trim(),
        variationLabel: generationRequest.getVariationLabel(),
        generatedAt: new Date().toISOString(),
        modelName,
      })

      return draft.toSummary(getDonorSegmentLabel(body.segmentKey))
    }

    lastErrorMessage = attempt.errorMessage
  }

  throw new Error(lastErrorMessage)
}

async function requestDraftFromGemini({
  apiKey,
  modelName,
  generationRequest,
}: {
  apiKey: string
  modelName: string
  generationRequest: EmailGenerationRequest
}): Promise<
  | { ok: true; text: string }
  | { ok: false; errorMessage: string }
> {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: generationRequest.buildSystemInstruction() }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: generationRequest.buildUserPrompt() }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
          },
        }),
      }
    )

    const raw = (await geminiResponse.json().catch(() => null)) as GeminiGenerateContentResponse | null

    if (geminiResponse.ok) {
      const text = raw?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || ""
      return { ok: true, text }
    }

    const errorMessage = raw?.error?.message || "Gemini API request failed while generating the email draft."
    const isRetriable = geminiResponse.status === 503 || geminiResponse.status === 429

    if (isRetriable && attempt < maxAttempts) {
      await sleep(500 * Math.pow(2, attempt - 1))
      continue
    }

    return {
      ok: false,
      errorMessage: `${errorMessage} (model: ${modelName})`,
    }
  }

  return {
    ok: false,
    errorMessage: `Gemini API request failed after retries. (model: ${modelName})`,
  }
}

function parseDraftJson(rawText: string): { subject?: string; body?: string } {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim()

  if (!cleaned) {
    return {}
  }

  try {
    return JSON.parse(cleaned) as { subject?: string; body?: string }
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) {
      return {}
    }

    try {
      return JSON.parse(match[0]) as { subject?: string; body?: string }
    } catch {
      return {}
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
