import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Parse and validate body
  let question: string
  try {
    const body = (await req.json()) as { question?: unknown }
    if (typeof body.question !== 'string' || !body.question.trim()) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 })
    }
    question = body.question.trim().slice(0, 500)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Graceful degradation — no API key configured
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI explanations are not configured. Try searching for a specific term above.' },
      { status: 200 }
    )
  }

  // Call Anthropic API
  try {
    const { Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are a concise financial educator for young adults.
Answer questions about personal finance in 2–4 sentences maximum.
Use plain English, avoid jargon, and include a concrete number example when possible.
Never give personalized investment advice. Never recommend specific stocks.
If the question is not about personal finance, politely decline.`,
      messages: [{ role: 'user', content: question }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response format.' }, { status: 500 })
    }

    return NextResponse.json({ answer: content.text })
  } catch (err) {
    const isRateLimit =
      err instanceof Error &&
      (err.message.includes('rate_limit') || err.message.includes('429'))

    if (isRateLimit) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Unable to generate an explanation right now.' },
      { status: 200 }
    )
  }
}
