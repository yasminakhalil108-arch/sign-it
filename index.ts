import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

import { createClient } from 'npm:@supabase/supabase-js@2'

type SummarizeRequest = {
  thread_id: string
  summary_for_user: string
  focus_area?: 'learning' | 'progress' | 'areas_to_improve' | 'general'
  limit?: number
}

type OpenAIMessage = { role: 'system' | 'user'; content: string }

// function requireEnv(name: string) {
  const v = Deno.env.get(name)
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Missing Authorization Bearer token' }), { status: 401 })
    }

    const { thread_id, summary_for_user, focus_area = 'general', limit = 50 } = 
      (await req.json()) as SummarizeRequest

    if (!thread_id || !summary_for_user) {
      return new Response(JSON.stringify({ error: 'thread_id and summary_for_user are required' }), { status: 400 })
    }

    const supabase = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_ANON_KEY')
    ).auth.getSession = async () => ({ data: { session: { access_token: jwt } } })

    // Create authenticated client
    const authClient = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_ANON_KEY'),
      {
        auth: {
          persistSession: false
        }
      }
    )

    // Create a custom auth header for all requests
    const headers = { Authorization: `Bearer ${jwt}` }

    // Fetch messages for this thread
    const { data: msgs, error: msgErr } = await authClient
      .from('messages')
      .select('id, user_id, content, created_at')
      .eq('thread_id', thread_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (msgErr) {
      return new Response(JSON.stringify({ error: msgErr.message }), { status: 400 })
    }

    if (!msgs || msgs.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages found for this thread' }), { status: 404 })
    }

    const lastMessage = msgs[0]

    // Get current user from JWT
    const { data: userData } = await authClient.auth.getUser()
    const createdBy = userData.user?.id

    if (!createdBy) {
      return new Response(JSON.stringify({ error: 'Invalid auth' }), { status: 401 })
    }

    // Format messages for LLM
    const messagesForLLM = msgs
      .slice()
      .reverse()
      .map((m) => `- [${m.created_at}] User ${m.user_id.slice(0, 8)}: ${m.content}`)
      .join('\n')

    // Build context-aware system prompt based on focus_area
    let focusPrompt = ''
    switch (focus_area) {
      case 'learning':
        focusPrompt = 'Focus on what the student has learned and key concepts covered.'
        break
      case 'progress':
        focusPrompt = 'Focus on the student\'s progress, improvements, and milestones achieved.'
        break
      case 'areas_to_improve':
        focusPrompt = 'Focus on areas where the student needs improvement and challenges faced.'
        break
      default:
        focusPrompt = 'Provide a general, balanced summary.'
    }

    const system = [
      'You are an educational assistant summarizing a learning thread discussion.',
      focusPrompt,
      'Return a JSON object with exactly these keys:',
      '1) "summary" (string, 3-8 sentences),',
      '2) "key_points" (array of 3-5 short bullet-like strings).',
      'Be neutral, avoid inventing details, and keep it concise.',
      'Respond ONLY with valid JSON, no additional text.'
    ].join('\n')

    const openaiKey = requireEnv('OPENAI_API_KEY')
    const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini'

    const openaiMessages: OpenAIMessage[] = [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `Thread ID: ${thread_id}\nFocus: ${focus_area}\n\nMessages:\n${messagesForLLM}`
      }
    ]

    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.3
      })
    })

    if (!completionRes.ok) {
      const text = await completionRes.text()
      return new Response(JSON.stringify({ error: 'OpenAI request failed', detail: text }), { status: 500 })
    }

    const completionJson = await completionRes.json()
    const content = completionJson?.choices?.[0]?.message?.content

    if (!content) {
      return new Response(JSON.stringify({ error: 'No OpenAI content returned' }), { status: 500 })
    }

    // Parse JSON response
    let summary: string | null = null
    let key_points: unknown = null

    try {
      const parsed = JSON.parse(content)
      summary = parsed.summary ?? null
      key_points = parsed.key_points ?? []
    } catch {
      // Fallback: store raw content if model didn't return JSON
      summary = content
      key_points = []
    }

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Failed to produce a summary' }), { status: 500 })
    }

    // Store summary (personalized per user)
    const { error: insErr } = await authClient
      .from('message_summaries')
      .insert({
        thread_id,
        summary_for_user,
        summary,
        key_points: key_points as any,
        focus_area,
        last_message_id: lastMessage.id,
        last_message_at: lastMessage.created_at,
        created_by: createdBy
      })

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), { status: 400 })
    }

    return new Response(JSON.stringify({ ok: true, summary, key_points }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 })
  }
})
