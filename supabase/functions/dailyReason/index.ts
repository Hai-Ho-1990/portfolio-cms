
// =========================
// Imports
// =========================
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =========================
// Helpers
// =========================
function requireEnv(key: string): string {
  const val = Deno.env.get(key)
  if (!val) throw new Error(`Missing env: ${key}`)
  return val
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJsonOrThrow(url: string, init?: RequestInit) {
  const resp = await fetch(url, init)
  const text = await resp.text()
  if (!resp.ok) throw new Error(`Fetch ${url} failed ${resp.status}: ${text}`)
  return JSON.parse(text)
}

async function fetchJsonWithRetries<T = any>(
  url: string,
  init: RequestInit | undefined,
  tries = 3,
  delayMs = 800
): Promise<T> {
  let lastErr: any
  for (let i = 0; i < tries; i++) {
    try {
      const resp = await fetch(url, init)
      const text = await resp.text()
      if (!resp.ok) throw new Error(`Fetch ${url} failed ${resp.status}: ${text}`)
      return JSON.parse(text) as T
    } catch (e) {
      lastErr = e
      console.warn(`Attempt ${i + 1} failed:`, e)
      if (i < tries - 1) await sleep(delayMs * (i + 1)) // enkel backoff
    }
  }
  throw lastErr
}

// =========================
// Environment variables
// =========================
const SUPABASE_URL = requireEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
const OPENAI_KEY = requireEnv('OPENAI_API_KEY')

const CONTENTFUL_SPACE_ID = requireEnv('CONTENTFUL_SPACE_ID')
const CONTENTFUL_ENVIRONMENT = Deno.env.get('CONTENTFUL_ENVIRONMENT') || 'master'
const CONTENTFUL_CONTENT_TYPE = requireEnv('CONTENTFUL_CONTENT_TYPE')
const CONTENTFUL_MANAGEMENT_TOKEN = requireEnv('CONTENTFUL_MANAGEMENT_TOKEN')

const CRON_INVOKE_SECRET = requireEnv('CRON_INVOKE_SECRET')

// Log environment variable presence (mask secrets)
console.log('[LOG] Function started at', new Date().toISOString())
console.log('[LOG] ENV presence:', {
  SUPABASE_URL: !!SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_KEY: !!OPENAI_KEY,
  CONTENTFUL_SPACE_ID: !!CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT: !!CONTENTFUL_ENVIRONMENT,
  CONTENTFUL_CONTENT_TYPE: !!CONTENTFUL_CONTENT_TYPE,
  CONTENTFUL_MANAGEMENT_TOKEN: !!CONTENTFUL_MANAGEMENT_TOKEN,
  CRON_INVOKE_SECRET: !!CRON_INVOKE_SECRET,
})

// =========================
// Supabase client
// =========================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// =========================
// OpenAI call with retry
// =========================
async function callOpenAIWithRetry(prompt: string, retries = 3, delayMs = 1000): Promise<string> {
  for (let i = 0; i < retries; i++) {
    let controller = new AbortController();
    let timeoutId: number | undefined = undefined;
    try {
      console.log(`[LOG] [${new Date().toISOString()}] Calling OpenAI (attempt ${i + 1}) with prompt length:`, prompt.length)
      timeoutId = setTimeout(() => {
        controller.abort();
        console.error(`[ERROR] [${new Date().toISOString()}] OpenAI fetch timed out after 20s (attempt ${i + 1})`);
      }, 20000); // 20 seconds
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 120,
          temperature: 0.9,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log(`[LOG] [${new Date().toISOString()}] OpenAI fetch completed (attempt ${i + 1}), status:`, resp.status);
      if (!resp.ok) {
        const text = await resp.text();
        console.error(`[ERROR] [${new Date().toISOString()}] OpenAI response not ok: ${resp.status} - ${text}`);
        throw new Error(`OpenAI error ${resp.status}: ${text}`);
      }
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`Unexpected OpenAI response structure: ${JSON.stringify(data).slice(0, 200)}`);
      }
      const result = content.trim();
      console.log('[LOG] OpenAI result:', result);
      return result;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        console.error(`[ERROR] [${new Date().toISOString()}] OpenAI fetch aborted due to timeout (attempt ${i + 1})`);
      } else {
        console.warn(`[WARN] [${new Date().toISOString()}] OpenAI attempt ${i + 1} failed:`, err);
      }
      if (i < retries - 1) await sleep(delayMs * (i + 1)); // enkel backoff
    }
  }
  console.error('[ERROR] OpenAI failed after all retries');
  throw new Error('OpenAI failed after all retries');
}

// =========================
// Upsert Contentful entry med automatisk ID-hantering (med retries)
// =========================
async function upsertContentfulEntry(reason: string) {
  // Hämta sparat entry-id från Supabase (om det finns)
  console.log('[LOG] upsertContentfulEntry called with reason:', reason)
  const { data: entryRecord, error: supabaseErr } = await supabase
    .from('daily_reason_entry')
    .select('*')
    .eq('key', 'daily_reason')
    .maybeSingle()
  if (supabaseErr) {
    console.error('[ERROR] Supabase select error:', supabaseErr)
    // Abort further processing to avoid duplicate Contentful entries
    throw new Error(`Aborting Contentful upsert due to Supabase select error: ${supabaseErr.message || supabaseErr}`)
  }

  let entryId = entryRecord?.contentful_id || ''
  let entry: any = null

  try {
    // Hämta befintlig entry (tillåt 404 → entry=null)
    if (entryId) {
      const getResp = await fetch(
        `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${entryId}`,
        { headers: { Authorization: `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}` } }
      )
      const text = await getResp.text()
      if (!getResp.ok) {
        if (getResp.status === 404) {
          entry = null
          console.log('[LOG] Contentful entry not found, will create new.')
        } else {
          console.error(`[ERROR] Contentful fetch error ${getResp.status}: ${text}`)
          throw new Error(`Contentful fetch error ${getResp.status}: ${text}`)
        }
      } else {
        entry = JSON.parse(text)
        console.log('[LOG] Contentful entry fetched:', entry.sys?.id)
      }
    }

    const fieldsPayload = {
      fields: {
        title: { 'en-US': `#${new Date().toISOString().slice(0, 10)}` },
        body: { 'en-US': reason },
      },
    }

    if (entry) {
      // Uppdatera befintlig entry (med retries)
      console.log('[LOG] Updating existing Contentful entry:', entryId)
      entry = await fetchJsonWithRetries(
        `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${entryId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}`,
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            'X-Contentful-Version': String(entry.sys.version),
          },
          body: JSON.stringify(fieldsPayload),
        },
        3,
        800
      )
      console.log('[LOG] Contentful entry updated:', entry.sys?.id)
    } else {
      // Skapa ny entry (med retries)
      console.log('[LOG] Creating new Contentful entry')
      entry = await fetchJsonWithRetries(
        `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}`,
            'Content-Type': 'application/vnd.contentful.management.v1+json',
            'X-Contentful-Content-Type': CONTENTFUL_CONTENT_TYPE,
          },
          body: JSON.stringify(fieldsPayload),
        },
        3,
        800
      )
      const { error: upsertErr } = await supabase
        .from('daily_reason_entry')
        .upsert({ key: 'daily_reason', contentful_id: entryId }, { onConflict: 'key' })
      if (upsertErr) {
        console.error('[ERROR] Supabase upsert error:', upsertErr)
        throw new Error(`Failed to persist Contentful entry ID: ${upsertErr.message}`)
      }
      console.log('[LOG] Supabase upserted entryId:', entryId)
        .from('daily_reason_entry')
        .upsert({ key: 'daily_reason', contentful_id: entryId }, { onConflict: 'key' })
      if (upsertErr) console.error('[ERROR] Supabase upsert error:', upsertErr)
      else console.log('[LOG] Supabase upserted entryId:', entryId)
    }

    // Publicera entry (med retries)
    await (async () => {
      let lastErr: any
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`[LOG] Publishing Contentful entry (attempt ${i + 1}):`, entryId)
          const publishResp = await fetch(
            `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${entryId}/published`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}`,
                'X-Contentful-Version': String(entry.sys.version),
              },
            }
          )
          const publishText = await publishResp.text()
          if (!publishResp.ok) {
            console.error(`[ERROR] Contentful publish error ${publishResp.status}: ${publishText}`)
            throw new Error(`Contentful publish error ${publishResp.status}: ${publishText}`)
          }
          console.log('[LOG] Contentful entry published:', entryId)
          return
        } catch (e) {
          lastErr = e
          console.warn(`[WARN] Contentful publish attempt ${i + 1} failed:`, e)
          if (i < 2) await sleep(800 * (i + 1))
        }
      }
      console.error('[ERROR] Contentful publish failed after all retries:', lastErr)
      throw lastErr
    })()
    console.log('[LOG] upsertContentfulEntry completed for:', entryId)
    return entry
  } catch (err) {
    console.error('[ERROR] upsertContentfulEntry failed:', err)
    throw err
  }
}

// =========================
// Main logic
// =========================
async function generateDailyReason() {
  const prompt = `
You are an expert career copywriter specializing in creating persuasive, warm, and personal one-sentence pitches for junior frontend developers.

Your task is to generate ONE unique, concise sentence in English explaining why a recruiter should hire Hai Ho as a Junior Frontend Developer.

Use the following personal profile to shape the tone and content:

- Finishing the final year of a Frontend Developer program at IT-Högskolan in Stockholm; graduating June 2026.
- Skilled in HTML, CSS, JavaScript, React, Next.js, TypeScript, Tailwind, Git, and API integration.
- Passionate about creative projects, UI design, and improving user experience.
- Experience building full projects from idea to completion (e.g., an AI-powered recorder app with transcription).
- Reliable, responsible, honest, and someone others can depend on.
- Strong soft skills: problem-solving, communication, creativity, accountability, adaptability.
- Team player who listens, contributes ideas, and supports others; experienced with Agile teamwork.
- Motivated by growth, curiosity, and creating meaningful digital experiences.
- Comfortable with Figma, VSCode, Jira, and modern development tools.
- Targeting product companies, startups, and agencies.

Tone & style requirements:
1. One single sentence.
2. Highly personal and human, not generic.
3. Persuasive and confidence-building, yet humble and sincere.
4. Should make the recruiter feel: “This is a junior developer we want on our team.”
5. Reflect Hai’s personality, passion, responsibility, and drive.
6. Tailored to what companies commonly look for in junior frontend developers today.

Do NOT write an example — generate one new, original sentence each time the prompt is used.
`

  let reason = 'Hai Ho is a motivated junior frontend developer with strong curiosity.'

  try {
    reason = await callOpenAIWithRetry(prompt)
  } catch (err) {
    console.error('OpenAI failed:', err)
    // Fortsätt med fallback-”reason”
  }

  // Upsert i Supabase
  const { data, error } = await supabase
    .from('daily_reasons')
    .upsert(
      { key: 'daily_reason', reason, generated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    .select()
    .single()

  if (error) throw error

  // Upsert i Contentful
  try {
    await upsertContentfulEntry(reason)
  } catch (err) {
    console.error('Contentful failed:', err)
    // Låt funktionen ändå returnera data från Supabase
  }

  return data
}

// =========================
// HTTP Server (Edge Function)
// =========================
serve(async (req) => {
  try {


    const isCron = req.headers.get('x-supabase-cron') === 'true'
    const isManual = req.headers.get('x-invoke-secret') === CRON_INVOKE_SECRET

    if (!isCron && !isManual) {
      return new Response(JSON.stringify({ code: 401, message: 'Unauthorized' }), { status: 401 })
    }

    const data = await generateDailyReason()
    return new Response(JSON.stringify({ success: true, data }), { status: 200 })
  } catch (err: any) {
    console.error('Function error', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
