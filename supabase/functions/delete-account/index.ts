import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://allythelifegame.lovable.app",
  "https://id-preview--e4eaa82d-475e-4702-8853-8e57a03f8465.lovable.app",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace('https://', 'https://')) || origin === o)
    ? origin
    : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No autorizado. Por favor, iniciá sesión." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Missing Supabase configuration");
    }

    // Create client with user's auth to verify identity
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Token inválido. Por favor, iniciá sesión nuevamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Create admin client for deleting user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Delete user data in correct order (respecting foreign keys)
    // 1. Delete tasks
    const { error: tasksError } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("user_id", userId);

    if (tasksError) {
      console.error("Error deleting tasks:", tasksError.message);
      throw new Error(`Error al eliminar tareas: ${tasksError.message}`);
    }
    console.log("Tasks deleted successfully");

    // 2. Delete projects
    const { error: projectsError } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("user_id", userId);

    if (projectsError) {
      console.error("Error deleting projects:", projectsError.message);
      throw new Error(`Error al eliminar metas: ${projectsError.message}`);
    }
    console.log("Projects deleted successfully");

    // 3. Delete notifications
    const { error: notificationsError } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (notificationsError) {
      console.error("Error deleting notifications:", notificationsError.message);
      throw new Error(`Error al eliminar notificaciones: ${notificationsError.message}`);
    }
    console.log("Notifications deleted successfully");

    // 4. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError.message);
      throw new Error(`Error al eliminar perfil: ${profileError.message}`);
    }
    console.log("Profile deleted successfully");

    // 5. Delete auth user using admin API
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError.message);
      throw new Error(`Error al eliminar cuenta: ${deleteUserError.message}`);
    }
    console.log("Auth user deleted successfully");

    console.log(`Account deletion completed for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Cuenta eliminada exitosamente" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("delete-account error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
