// =========================
// Imports
// =========================
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =========================
// Helpers
// =========================

/*
  Säkerställer att en env-variabel finns.
  Stoppar funktionen direkt om den saknas.
*/
function requireEnv(key: string): string {
  const val = Deno.env.get(key)
  if (!val) throw new Error(`Missing env: ${key}`)
  return val
}

/*
  Används för retries och enkel backoff
*/
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/*
  Fetch-wrapper som:
  - läser response som text
  - kastar error vid HTTP-fel
  - returnerar JSON
*/
async function fetchJsonOrThrow(url: string, init?: RequestInit) {
  const resp = await fetch(url, init)
  const text = await resp.text()
  if (!resp.ok) throw new Error(`Fetch ${url} failed ${resp.status}: ${text}`)
  return JSON.parse(text)
}

/*
  Fetch med retry-logik.
  Används mot externa API:er som kan fallera tillfälligt.
*/
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
      if (i < tries - 1) await sleep(delayMs * (i + 1))
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

// =========================
// Supabase client
// =========================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// =========================
// OpenAI call with retry
//
// - Genererar text med retry + timeout
// =========================
async function callOpenAIWithRetry(prompt: string, retries = 3, delayMs = 1000): Promise<string> {
  for (let i = 0; i < retries; i++) {
    let controller = new AbortController();
    let timeoutId: number | undefined = undefined;
    try {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 20000);

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

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`OpenAI error ${resp.status}: ${text}`);
      }

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(`Unexpected OpenAI response structure: ${JSON.stringify(data).slice(0, 200)}`);
      }

      const result = content.trim();
      console.log('[SUCCESS] OpenAI generated reason');
      return result;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (i < retries - 1) await sleep(delayMs * (i + 1));
    }
  }
  throw new Error('OpenAI failed after all retries');
}

/* =====================================================
   CONTENTFUL UPSERT
   - Skapar eller uppdaterar en entry
   - Sparar Contentful-ID i Supabase
===================================================== */
async function upsertContentfulEntry(reason: string) {
      /*
    Hämta tidigare sparat Contentful-entry-ID
  */
  const { data: entryRecord, error: supabaseErr } = await supabase
    .from('daily_reason_entry')
    .select('*')
    .eq('key', 'daily_reason')
    .maybeSingle()

  if (supabaseErr) {
    throw new Error(`Aborting Contentful upsert due to Supabase select error: ${supabaseErr.message || supabaseErr}`)
  }

  let entryId = entryRecord?.contentful_id || ''
  let entry: any = null

  /*
    Om ett ID finns: försök hämta entry från Contentful
  */
  try {
    if (entryId) {
      const getResp = await fetch(
        `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}/entries/${entryId}`,
        { headers: { Authorization: `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}` } }
      )
      const text = await getResp.text()

      if (!getResp.ok) {
        if (getResp.status === 404) {
          entry = null
        } else {
          throw new Error(`Contentful fetch error ${getResp.status}: ${text}`)
        }
      } else {
        entry = JSON.parse(text)
      }
    }

     /*
    Data som skickas till Contentful
  */
    const fieldsPayload = {
      fields: {
        title: { 'en-US': `#${new Date().toISOString().slice(0, 10)}` },
        body: { 'en-US': reason },
      },
    }

    /*
    Uppdatera eller skapa entry
  */
    if (entry) {
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
      console.log('[SUCCESS] Contentful entry updated');
    } else {

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

       /*
      Spara nytt Contentful-ID i Supabase
    */
      const entryId = entry?.sys?.id;
      if (!entryId) {
        throw new Error('No entryId returned from Contentful entry creation');
      }

      const { error: upsertErr } = await supabase
        .from('daily_reason_entry')
        .upsert({ key: 'daily_reason', contentful_id: entryId }, { onConflict: 'key' });

      if (upsertErr) {
        throw new Error(`Failed to persist Contentful entry ID: ${upsertErr.message || upsertErr}`);
      }

      console.log('[SUCCESS] Contentful entry created');
    }

      /*
    Publicera entry
  */
    await (async () => {
      let lastErr: any
      for (let i = 0; i < 3; i++) {
        try {
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
            throw new Error(`Contentful publish error ${publishResp.status}: ${publishText}`)
          }

          console.log('[SUCCESS] Contentful entry published');
          return
        } catch (e) {
          lastErr = e
          if (i < 2) await sleep(800 * (i + 1))
        }
      }
      throw lastErr
    })()

    return entry
  } catch (err) {
    throw err
  }
}

/* =====================================================
   MAIN LOGIC
   - Genererar text
   - Sparar i Supabase
   - Synkar till Contentful
===================================================== */
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
4. Should make the recruiter feel: "This is a junior developer we want on our team."
5. Reflect Hai's personality, passion, responsibility, and drive.
6. Tailored to what companies commonly look for in junior frontend developers today.

Do NOT write an example — generate one new, original sentence each time the prompt is used.
`

  let reason = 'Hai Ho is a motivated junior frontend developer with strong curiosity.'

  try {
    reason = await callOpenAIWithRetry(prompt)
  } catch (err) {
    console.error('OpenAI failed:', err)
  }

  const { data, error } = await supabase
    .from('daily_reasons')
    .upsert(
      { key: 'daily_reason', reason, generated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    .select()
    .single()


  if (error) throw error

  /*
    Uppdatera Contentful (fel stoppar inte flödet)
  */
  try {
    await upsertContentfulEntry(reason)
  } catch (err) {
    console.error('Contentful failed:', err)
  }

  return data
}

// =========================
// HTTP Server (Edge Function)
// =========================
serve(async (req) => {
  try {
    const isCron = req.headers.get('x-supabase-cron') === 'true';
    const isManual = req.headers.get('x-invoke-secret') === CRON_INVOKE_SECRET;
    /*
      Blockerar alla otillåtna anrop
    */
    if (!isCron && !isManual) {
      return new Response(JSON.stringify({ code: 401, message: 'Unauthorized' }), { status: 401 });
    }
    /*
      Cron warm-ping: kör ingen logik
    */
    if (isCron) {
      return new Response(JSON.stringify({ success: true, message: 'warm ping' }), { status: 200 });
    }
    /*
      Manuell trigger: kör hela flödet
    */
    const data = await generateDailyReason();
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    console.error('Function error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
