import { NextResponse } from "next/server"
import { EmailAutomationTriggerController, type SendEmailRequestBody } from "@/app/controller/EmailAutomationTriggerController"

const emailAutomationTriggerController = new EmailAutomationTriggerController()

export async function POST(request: Request) {
  let body: SendEmailRequestBody

  try {
    body = (await request.json()) as SendEmailRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 })
  }

  const result = await emailAutomationTriggerController.sendEmail(body)
  return NextResponse.json(result.body, { status: result.status })
}
