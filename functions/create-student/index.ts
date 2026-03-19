import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify caller is a warden
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Not authenticated")

    const token = authHeader.replace("Bearer ", "")
    const { data: { user: callerUser } } = await supabaseAdmin.auth.getUser(token)
    if (!callerUser) throw new Error("Not authenticated")

    const { data: callerProfile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", callerUser.id)
      .single()

    if (callerProfile?.role !== "warden") throw new Error("Only wardens can add students")

    const { name, email, room_number, branch, semester } = await req.json()
    if (!name || !email) throw new Error("Name and email are required")

    // Create auth user with admin API - this properly sets the password
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: "Hostel@2024",
      email_confirm: true,
    })

    if (authError) {
      if (authError.message?.includes("already been registered")) {
        throw new Error("A student with this email already exists")
      }
      throw authError
    }

    // Insert profile row with the same UUID from auth
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      room_number: room_number || null,
      branch: branch || null,
      semester: semester || null,
      role: "student",
      password_changed: false,
    })

    if (profileError) {
      // Rollback auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      if (profileError.code === "23505") throw new Error("A student with this email already exists")
      throw profileError
    }

    return new Response(
      JSON.stringify({ success: true, userId: authData.user.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
