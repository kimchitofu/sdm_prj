import { NextResponse } from "next/server"
import { generateAiDraftServer } from "@/app/controller/EmailAutomationController.server"
import { type EmailGenerationRequestPayload } from "@/app/entity/EmailGenerationRequest"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailGenerationRequestPayload
    const result = await generateAiDraftServer(body)
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected server error while generating an AI draft.",
      },
      { status: 500 }
    )
  }
}
