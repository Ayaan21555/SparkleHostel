import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// ─── In-memory rate limiter ────────────────────────────────────────────────
// Limits each IP to MAX_REQUESTS uploads per WINDOW_MS milliseconds
const WINDOW_MS = 60_000      // 1 minute window
const MAX_REQUESTS = 5        // max 5 uploads per minute per IP

const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  if (entry.count >= MAX_REQUESTS) {
    return true
  }

  entry.count++
  return false
}

// Clean up stale entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 5) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60_000)

// ─── CSV Parser ────────────────────────────────────────────────────────────
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h =>
    h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  )

  const fieldMap: Record<string, string> = {
    'name': 'name', 'student_name': 'name', 'full_name': 'name',
    'email': 'email', 'email_address': 'email', 'mail': 'email',
    'room': 'room_number', 'room_no': 'room_number', 'room_number': 'room_number', 'room_num': 'room_number',
    'semester': 'semester', 'sem': 'semester', 'year': 'semester',
    'branch': 'branch', 'dept': 'branch', 'department': 'branch', 'course': 'branch',
  }

  const mappedHeaders = headers.map(h => fieldMap[h] || h)

  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    mappedHeaders.forEach((header, idx) => {
      row[header] = values[idx]?.replace(/^"|"$/g, '').trim() || ''
    })

    if (row.name && row.email && row.email.includes('@')) {
      rows.push(row)
    }
  }

  return rows
}

// ─── Main Handler ──────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // Get client IP for rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  // Check rate limit
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a minute and try again." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    )
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate request body size (max 1MB)
    const contentLength = req.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 1_000_000) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 1MB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body = await req.json()
    const { content, fileType } = body

    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: "No file content provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (content.length > 500_000) {
      return new Response(
        JSON.stringify({ error: "CSV content too large. Maximum 500KB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (fileType && !['csv', 'text/csv', 'text/plain'].includes(fileType)) {
      return new Response(
        JSON.stringify({ error: "Only CSV files are supported." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const students = parseCSV(content)

    if (students.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No valid students found. CSV must have 'name' and 'email' columns." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Cap at 500 students per upload
    if (students.length > 500) {
      return new Response(
        JSON.stringify({ error: "Too many rows. Maximum 500 students per upload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const rows = students.map((s) => ({
      email: s.email.toLowerCase().trim(),
      name: s.name.trim(),
      room_number: s.room_number || null,
      semester: s.semester || null,
      branch: s.branch || null,
      role: 'student' as const,
      password_changed: false,
    }))

    const { data, error } = await supabase
      .from("users")
      .upsert(rows, { onConflict: "email", ignoreDuplicates: false })
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, count: data?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("process-student-data error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
