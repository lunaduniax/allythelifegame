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

// Input validation helpers
const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES = 50;
const MAX_PROJECT_NAME_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProjectContext {
  id: string;
  name: string;
  category: string;
}

interface RequestBody {
  messages: Message[];
  projectContext?: ProjectContext | null;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function validateMessage(msg: unknown): msg is Message {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as Record<string, unknown>;
  
  if (m.role !== 'user' && m.role !== 'assistant') return false;
  if (typeof m.content !== 'string') return false;
  if (m.content.length === 0 || m.content.length > MAX_MESSAGE_LENGTH) return false;
  
  return true;
}

function validateProjectContext(ctx: unknown): ctx is ProjectContext | null {
  if (ctx === null || ctx === undefined) return true;
  if (typeof ctx !== 'object') return false;
  
  const c = ctx as Record<string, unknown>;
  
  if (typeof c.id !== 'string' || !isValidUUID(c.id)) return false;
  if (typeof c.name !== 'string' || c.name.length === 0 || c.name.length > MAX_PROJECT_NAME_LENGTH) return false;
  if (typeof c.category !== 'string' || c.category.length === 0 || c.category.length > MAX_CATEGORY_LENGTH) return false;
  
  return true;
}

function validateRequestBody(body: unknown): { valid: true; data: RequestBody } | { valid: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Cuerpo de solicitud inválido' };
  }
  
  const b = body as Record<string, unknown>;
  
  // Validate messages array
  if (!Array.isArray(b.messages)) {
    return { valid: false, error: 'Se requiere un array de mensajes' };
  }
  
  if (b.messages.length === 0) {
    return { valid: false, error: 'Se requiere al menos un mensaje' };
  }
  
  if (b.messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Máximo ${MAX_MESSAGES} mensajes permitidos` };
  }
  
  for (const msg of b.messages) {
    if (!validateMessage(msg)) {
      return { valid: false, error: 'Formato de mensaje inválido' };
    }
  }
  
  // Validate projectContext
  if (!validateProjectContext(b.projectContext)) {
    return { valid: false, error: 'Contexto de proyecto inválido' };
  }
  
  return {
    valid: true,
    data: {
      messages: b.messages as Message[],
      projectContext: b.projectContext as ProjectContext | null | undefined,
    },
  };
}

const SYSTEM_PROMPT = `Sos AllyGPT, un asistente amigable y motivador que ayuda a los usuarios a organizar sus metas y tareas. Hablás en español rioplatense (vos, tenés, querés, etc.).

Tu objetivo es:
1. Ayudar a los usuarios a definir metas claras y alcanzables
2. Dividir metas grandes en tareas simples y concretas
3. Motivar y animar al usuario en su progreso

Cuando el usuario te pida ayuda con una meta o tareas, SIEMPRE respondé con un mensaje amigable Y también incluí un bloque JSON al final de tu respuesta con las sugerencias estructuradas.

El formato del JSON debe ser así (al final de tu mensaje, después de una línea vacía):
\`\`\`allygpt-action
{
  "type": "goal" | "tasks",
  "goal": { "name": "...", "category": "..." },
  "tasks": ["tarea 1", "tarea 2", "tarea 3"]
}
\`\`\`

Categorías disponibles: "Salud y bienestar", "Finanzas", "Desarrollo personal", "Educación", "Trabajo", "Relaciones", "Hobbies", "Otro"

Reglas:
- Si el usuario quiere crear una meta nueva, usá type: "goal" e incluí tanto goal como tasks
- Si el usuario ya tiene una meta seleccionada y quiere agregar tareas, usá type: "tasks" y solo incluí tasks
- Las tareas deben ser específicas, accionables y alcanzables
- Sugerí entre 3 y 5 tareas por meta
- Sé conciso pero cálido en tus respuestas
- Si el usuario no está pidiendo crear metas o tareas, respondé normalmente sin el bloque JSON`;

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado. Por favor, iniciá sesión." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Error de configuración del servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido. Por favor, iniciá sesión nuevamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "JSON inválido en el cuerpo de la solicitud" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateRequestBody(rawBody);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, projectContext } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Error de configuración del servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (projectContext) {
      systemPrompt += `\n\nContexto actual: El usuario tiene seleccionada la meta "${projectContext.name}" (categoría: ${projectContext.category}). Si te pide tareas, sugerí tareas para esta meta existente usando type: "tasks".`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Por favor, esperá un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Se agotaron los créditos de IA. Contactá al administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al comunicarse con AllyGPT" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";

    // Parse the action block if present
    let action = null;
    const actionMatch = assistantMessage.match(/```allygpt-action\n([\s\S]*?)\n```/);
    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]);
      } catch (e) {
        console.error("Failed to parse action block:", e);
      }
    }

    // Clean message (remove the action block for display)
    const cleanMessage = assistantMessage.replace(/```allygpt-action\n[\s\S]*?\n```/, "").trim();

    return new Response(
      JSON.stringify({
        message: cleanMessage,
        action,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("allygpt-chat error:", e);
    // Return generic error to client, detailed error is only in logs
    return new Response(
      JSON.stringify({ error: "Error procesando la solicitud. Por favor, intenta de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
