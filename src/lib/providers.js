// providers.js — Provider Abstraction Layer (PRD Section 7.1).
// callModel(prompt, provider, tools) routes to whichever provider the user
// has configured, normalizing each provider's very different request/response
// shape into one common { text, toolCalls, raw } result the agent loop uses.

import configJson from "../config/config.json";
import { getProviderKey } from "./auth";

const TOOL_SPEC_TO_OPENAI_FN = (spec) => ({
  type: "function",
  function: { name: spec.name, description: spec.description, parameters: spec.parameters },
});

const TOOL_SPEC_TO_GEMINI_FN = (spec) => ({
  name: spec.name,
  description: spec.description,
  parameters: spec.parameters,
});

export function getProviderConfig(providerId) {
  return configJson.providers.find((p) => p.id === providerId) || configJson.providers[0];
}

export function listProviders() {
  return configJson.providers;
}

/**
 * @param {Array<{role:string, content:string}>} history - full conversation so far
 * @param {string} providerId
 * @param {Array<object>} toolSpecs - tool specs (see tools/*.js)
 * @param {string} systemPrompt
 * @returns {Promise<{text: string|null, toolCalls: Array<{id:string,name:string,args:object}>, raw:any}>}
 */
export async function callModel(history, providerId, toolSpecs, systemPrompt) {
  const provider = getProviderConfig(providerId);
  const apiKey = await getProviderKey(providerId);
  if (!apiKey) {
    const err = new Error("NO_API_KEY");
    err.code = "NO_API_KEY";
    throw err;
  }

  switch (providerId) {
    case "anthropic":
      return callAnthropic(provider, apiKey, history, toolSpecs, systemPrompt);
    case "gemini":
      return callGemini(provider, apiKey, history, toolSpecs, systemPrompt);
    case "openai":
    case "groq":
    case "openrouter":
    default:
      return callOpenAiCompatible(provider, apiKey, history, toolSpecs, systemPrompt);
  }
}

// ---- Anthropic ----
async function callAnthropic(provider, apiKey, history, toolSpecs, systemPrompt) {
  const res = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: history.map((m) => ({ role: m.role === "tool" ? "user" : m.role, content: m.content })),
      tools: toolSpecs.map((s) => ({ name: s.name, description: s.description, input_schema: s.parameters })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Anthropic error ${res.status}`);

  const toolCalls = (data.content || [])
    .filter((b) => b.type === "tool_use")
    .map((b) => ({ id: b.id, name: b.name, args: b.input }));
  const text = (data.content || []).find((b) => b.type === "text")?.text ?? null;
  return { text, toolCalls, raw: data };
}

// ---- Gemini ----
async function callGemini(provider, apiKey, history, toolSpecs, systemPrompt) {
  const url = `${provider.endpoint}?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      tools: [{ functionDeclarations: toolSpecs.map(TOOL_SPEC_TO_GEMINI_FN) }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini error ${res.status}`);

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const toolCalls = parts
    .filter((p) => p.functionCall)
    .map((p, i) => ({ id: `${Date.now()}_${i}`, name: p.functionCall.name, args: p.functionCall.args || {} }));
  const text = parts.find((p) => p.text)?.text ?? null;
  return { text, toolCalls, raw: data };
}

// ---- OpenAI-compatible (OpenAI, Groq, OpenRouter) ----
async function callOpenAiCompatible(provider, apiKey, history, toolSpecs, systemPrompt) {
  const res = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: provider.id === "groq" ? "llama-3.3-70b-versatile" : provider.id === "openrouter" ? "openai/gpt-4.1" : "gpt-4.1",
      messages: [{ role: "system", content: systemPrompt }, ...history],
      tools: toolSpecs.map(TOOL_SPEC_TO_OPENAI_FN),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `${provider.label} error ${res.status}`);

  const msg = data?.choices?.[0]?.message || {};
  const toolCalls = (msg.tool_calls || []).map((tc) => ({
    id: tc.id,
    name: tc.function?.name,
    args: safeParseJson(tc.function?.arguments) || {},
  }));
  return { text: msg.content ?? null, toolCalls, raw: data };
}

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
