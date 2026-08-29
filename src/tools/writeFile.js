// tools/write-file.js — tool: writes/updates a generated file in the
// active session's file table (persisted to AsyncStorage by the caller).

export const writeFileToolSpec = {
  name: "write_file",
  description: "Create or overwrite a file in the current session's project output.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Filename, e.g. index.html" },
      type: { type: "string", description: "File type, e.g. html, js, css, json, text" },
      content: { type: "string", description: "Full file content to write" },
    },
    required: ["name", "content"],
  },
};

/**
 * @param {{name:string, type?:string, content:string}} args
 * @param {Record<string, {name:string, type:string, content:string}>} filesTable
 */
export function writeFile(args, filesTable) {
  const entry = {
    name: args.name,
    type: args.type || inferType(args.name),
    content: args.content ?? "",
  };
  filesTable[args.name] = entry;
  return { ok: true, file: entry };
}

function inferType(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (["html", "htm"].includes(ext)) return "html";
  if (["js", "jsx"].includes(ext)) return "js";
  if (ext === "css") return "css";
  if (ext === "json") return "json";
  return "text";
}

export default writeFile;
