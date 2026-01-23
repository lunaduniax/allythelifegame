import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
  projectContext?: {
    id: string;
    name: string;
    category: string;
  } | null;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, projectContext }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
