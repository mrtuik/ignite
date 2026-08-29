// agentLoop.js — Ignite's agent loop (PRD Section 7.3).
// prompt -> model response -> if tool_call, execute -> feed result back ->
// repeat until a valid structured "done" response or max iterations.
// Structured output is validated (Section 7.4) with one auto-retry on
// parse/schema failure (Section 7.6).

import configJson from "../config/config.json";
import { SYSTEM_PROMPT } from "../prompts/systemPrompt";
import { callModel } from "./providers";
import { readFileToolSpec, readFile } from "../tools/readFile";
import { writeFileToolSpec, writeFile } from "../tools/writeFile";
import { runCheckToolSpec, runCheck } from "../tools/runCheck";
import { parseAndValidate } from "./validation";

const TOOL_SPECS = [readFileToolSpec, writeFileToolSpec, runCheckToolSpec];

function executeTool(name, args, filesTable) {
  switch (name) {
    case "read_file":
      return readFile(args, filesTable);
    case "write_file":
      return writeFile(args, filesTable);
    case "run_check":
      return runCheck(args, filesTable);
    default:
      return { ok: false, error: `Unknown tool "${name}"` };
  }
}

/**
 * Runs the full agent loop for one user turn.
 *
 * @param {object} opts
 * @param {string} opts.userMessage
 * @param {Array<{role:string, content:string}>} opts.priorHistory
 * @param {string} opts.providerId
 * @param {Record<string, object>} opts.filesTable - mutated in place with any written files
 * @param {(step:{type:string,label:string,detail:string,duration_s:number}) => void} [opts.onStep] - called as each plan step streams in
 * @returns {Promise<{title:string, summary:string, plan_steps:Array, files:Array, done:boolean}>}
 */
export async function runAgentTurn({ userMessage, priorHistory = [], providerId, filesTable, onStep }) {
  const maxIterations = configJson.maxAgentIterations || 8;
  const history = [...priorHistory, { role: "user", content: userMessage }];

  let iterations = 0;
  let lastResult = null;
  let retriedInvalidSchema = false;

  while (iterations < maxIterations) {
    iterations += 1;
    const started = Date.now();
    const response = await callModel(history, providerId, TOOL_SPECS, SYSTEM_PROMPT);

    if (response.toolCalls && response.toolCalls.length > 0) {
      // Record an "action" plan step per tool call, execute, and feed results back.
      const toolResultsText = [];
      for (const call of response.toolCalls) {
        const result = executeTool(call.name, call.args, filesTable);
        const durationS = Math.max(1, Math.round((Date.now() - started) / 1000));
        const step = {
          type: "action",
          label: describeToolCall(call),
          detail: JSON.stringify(result, null, 2),
          duration_s: durationS,
        };
        onStep?.(step);
        toolResultsText.push(`Tool "${call.name}" result: ${JSON.stringify(result)}`);
      }
      history.push({ role: "assistant", content: response.text || "(tool call)" });
      history.push({ role: "user", content: `[tool_results]\n${toolResultsText.join("\n")}` });
      continue; // loop again so the model can react to tool output
    }

    // No tool calls -> model believes it's ready with a final structured answer.
    const { valid, errors, data } = parseAndValidate(response.text);
    if (valid) {
      lastResult = data;
      break;
    }

    if (!retriedInvalidSchema) {
      // Section 7.6: auto-retry once, feeding the validation error back.
      retriedInvalidSchema = true;
      history.push({ role: "assistant", content: response.text || "" });
      history.push({
        role: "user",
        content: `Your last response did not match the required JSON schema. Errors: ${errors.join(
          " "
        )} Re-send ONLY the corrected JSON object, matching the schema exactly.`,
      });
      continue;
    }

    // Second failure — surface a best-effort structured object rather than crashing.
    lastResult = {
      title: "Response error",
      summary: "The model's response could not be parsed into the expected format after a retry.",
      plan_steps: [],
      files: [],
      done: false,
    };
    break;
  }

  if (!lastResult) {
    lastResult = {
      title: "Incomplete",
      summary: `Stopped after ${maxIterations} steps without a final result. Try continuing or simplifying the request.`,
      plan_steps: [],
      files: [],
      done: false,
    };
  }

  return lastResult;
}

function describeToolCall(call) {
  if (call.name === "write_file") return `Writing ${call.args?.name || "file"}`;
  if (call.name === "read_file") return `Reading ${call.args?.name || "file"}`;
  if (call.name === "run_check") return `Checking ${call.args?.name || "file"} parses`;
  return call.name;
}
