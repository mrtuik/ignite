// validation.js — validates the model's final structured response against
// the schema declared in system-prompt.js (title, summary, files[], plan_steps[]).

const REQUIRED_KEYS = ["title", "summary", "plan_steps", "files", "done"];

/** Attempts to pull a JSON object out of raw model text (strips stray fences). */
export function extractJson(rawText) {
  if (!rawText) return null;
  const cleaned = rawText.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: find the outermost { ... } block
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** @returns {{valid: boolean, errors: string[]}} */
export function validateSchema(obj) {
  const errors = [];
  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: ["Response is not a JSON object."] };
  }
  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) errors.push(`Missing required key "${key}".`);
  }
  if (obj.plan_steps && !Array.isArray(obj.plan_steps)) errors.push('"plan_steps" must be an array.');
  if (obj.files && !Array.isArray(obj.files)) errors.push('"files" must be an array.');
  if (obj.title && typeof obj.title !== "string") errors.push('"title" must be a string.');
  if (obj.summary && typeof obj.summary !== "string") errors.push('"summary" must be a string.');
  return { valid: errors.length === 0, errors };
}

/** Parses + validates in one step, returning a normalized result. */
export function parseAndValidate(rawText) {
  const obj = extractJson(rawText);
  if (!obj) return { valid: false, errors: ["Could not parse JSON from model response."], data: null };
  const { valid, errors } = validateSchema(obj);
  return { valid, errors, data: valid ? obj : obj };
}
