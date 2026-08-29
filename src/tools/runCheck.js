// tools/run-check.js — tool: validates output (JSON parse / basic syntax
// balance check) before the agent is allowed to declare a file done.

export const runCheckToolSpec = {
  name: "run_check",
  description: "Validate a file's content: JSON parses cleanly, or basic bracket/tag balance holds for code/markup.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Filename to validate" },
    },
    required: ["name"],
  },
};

/**
 * @param {{name:string}} args
 * @param {Record<string, {name:string, type:string, content:string}>} filesTable
 */
export function runCheck(args, filesTable) {
  const file = filesTable?.[args.name];
  if (!file) return { ok: false, error: `No file named "${args.name}" exists yet.` };

  if (file.type === "json") {
    try {
      JSON.parse(file.content);
      return { ok: true, message: "Valid JSON." };
    } catch (e) {
      return { ok: false, error: `JSON parse error: ${e.message}` };
    }
  }

  // Lightweight balance check for braces/brackets/parens — catches the
  // most common truncation/escaping bugs without a full parser.
  const pairs = { "{": "}", "[": "]", "(": ")" };
  const stack = [];
  for (const ch of file.content) {
    if (pairs[ch]) stack.push(pairs[ch]);
    else if (Object.values(pairs).includes(ch)) {
      if (stack.pop() !== ch) {
        return { ok: false, error: `Unbalanced "${ch}" detected — likely truncated output.` };
      }
    }
  }
  if (stack.length > 0) {
    return { ok: false, error: `Unclosed ${stack.length} bracket(s) at end of file.` };
  }

  if (file.type === "html") {
    const openTags = (file.content.match(/<html[\s>]/gi) || []).length;
    const closeTags = (file.content.match(/<\/html>/gi) || []).length;
    if (openTags > 0 && openTags !== closeTags) {
      return { ok: false, error: "Mismatched <html> open/close tags." };
    }
  }

  return { ok: true, message: "Basic syntax check passed." };
}

export default runCheck;
