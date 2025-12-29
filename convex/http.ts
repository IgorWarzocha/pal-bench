/**
 * convex/http.ts
 * HTTP API endpoints for external LLM submissions.
 * Handles authentication, validation, and hallucination detection.
 */
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function jsonError(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: JSON_HEADERS,
  });
}

interface SubmissionBody {
  model: string;
  name: string;
  pokedexNumber: number;
  description: string;
  svgCode: string;
}

function validateSubmissionBody(body: unknown): body is SubmissionBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "name" in body &&
    "pokedexNumber" in body &&
    "description" in body &&
    "svgCode" in body &&
    "model" in body
  );
}

http.route({
  path: "/api/submit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError("Missing or invalid Authorization header", 401);
    }

    const apiKey = authHeader.slice(7);
    const secretResult = await ctx.runQuery(
      internal.submission.validateSecret,
      { key: apiKey },
    );

    if (!secretResult) {
      return jsonError("Invalid or inactive API key", 403);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    if (!validateSubmissionBody(body)) {
      return jsonError(
        "Missing required fields: name, pokedexNumber, description, svgCode, model",
        400,
      );
    }

    const { name, pokedexNumber, description, svgCode, model } = body;

    if (model !== secretResult.model) {
      return jsonError(
        `Model mismatch: body model "${model}" does not match API key model "${secretResult.model}"`,
        400,
      );
    }

    if (typeof name !== "string" || name.trim() === "") {
      return jsonError("name must be a non-empty string", 400);
    }

    if (
      typeof pokedexNumber !== "number" ||
      !Number.isInteger(pokedexNumber) ||
      pokedexNumber < 1
    ) {
      return jsonError("pokedexNumber must be a positive integer", 400);
    }

    if (typeof description !== "string") {
      return jsonError("description must be a string", 400);
    }

    if (typeof svgCode !== "string" || svgCode.trim() === "") {
      return jsonError("svgCode must be a non-empty string", 400);
    }

    const trimmedSvg = svgCode.trim();
    if (!trimmedSvg.toLowerCase().includes("<svg")) {
      return jsonError("svgCode must contain valid SVG markup", 400);
    }

    const pokedexResult = await ctx.runQuery(
      internal.pokedex.validatePokedexEntry,
      { id: pokedexNumber, name: name.trim() },
    );

    const isHallucination = !pokedexResult.valid;
    const hallucinationReason = isHallucination
      ? pokedexResult.error
      : undefined;

    const submissionId = await ctx.runMutation(
      internal.submission.createSubmission,
      {
        model: secretResult.model,
        name: name.trim(),
        pokedexNumber,
        description,
        svgCode: trimmedSvg,
        isHallucination,
        hallucinationReason,
      },
    );

    return new Response(
      JSON.stringify({
        success: true,
        submissionId,
        model: secretResult.model,
        isHallucination,
        ...(hallucinationReason && { hallucinationReason }),
      }),
      { status: 201, headers: JSON_HEADERS },
    );
  }),
});

http.route({
  path: "/api/submit",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
