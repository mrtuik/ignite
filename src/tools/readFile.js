// tools/read-file.js — tool: reads a generated file's content from the
// active session's in-memory/AsyncStorage-backed file table.

export const readFileToolSpec = {
  name: "read_file",
  description: "Read the current content of a file that has already been written in this session.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "The filename to read, e.g. index.html" },
    },
    required: ["name"],
  },
};

/**
 * @param {{name: string}} args
 * @param {Record<string, {name:string, type:string, content:string}>} filesTable
 */
export function readFile(args, filesTable) {
  const file = filesTable?.[args.name];
  if (!file) {
    return { ok: false, error: `No file named "${args.name}" exists yet in this session.` };
  }
  return { ok: true, content: file.content };
}

export default readFile;
