// storage.js — session persistence layer. Replaces OpenCode's SQLite
// sessions.db / the web build's IndexedDB with AsyncStorage, since React
// Native has no browser IndexedDB. Stores: chat history, plan steps,
// generated files, keyed per session ID.

import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_INDEX_KEY = "ignite:sessions:index"; // array of session summaries
const sessionKey = (id) => `ignite:session:${id}`;

function newId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Create a new empty session and return its full record. */
export async function createSession(title = "New chat") {
  const id = newId();
  const record = {
    id,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [], // { role: 'user'|'assistant', text, createdAt }
    planSteps: [], // structured plan_steps from the last agent run
    files: {}, // { [filename]: { name, type, content } }
  };
  await AsyncStorage.setItem(sessionKey(id), JSON.stringify(record));
  await touchIndex(record);
  return record;
}

export async function getSession(id) {
  const raw = await AsyncStorage.getItem(sessionKey(id));
  return raw ? JSON.parse(raw) : null;
}

export async function saveSession(record) {
  record.updatedAt = Date.now();
  await AsyncStorage.setItem(sessionKey(record.id), JSON.stringify(record));
  await touchIndex(record);
}

export async function deleteSession(id) {
  await AsyncStorage.removeItem(sessionKey(id));
  const index = await getSessionIndex();
  const next = index.filter((s) => s.id !== id);
  await AsyncStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(next));
}

/** Lightweight list for Sidebar / History screen: [{id, title, updatedAt}] */
export async function getSessionIndex() {
  const raw = await AsyncStorage.getItem(SESSIONS_INDEX_KEY);
  const list = raw ? JSON.parse(raw) : [];
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

async function touchIndex(record) {
  const index = await getSessionIndex();
  const summary = { id: record.id, title: record.title, updatedAt: record.updatedAt };
  const existingIdx = index.findIndex((s) => s.id === record.id);
  if (existingIdx >= 0) index[existingIdx] = summary;
  else index.unshift(summary);
  await AsyncStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(index));
}

/** Group a session index list into { Today, Yesterday, "This Week", Earlier } for History screen. */
export function groupByDate(sessions) {
  const now = new Date();
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOf(now);
  const yesterday = today - 86400000;
  const weekAgo = today - 6 * 86400000;

  const groups = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };
  for (const s of sessions) {
    const day = startOf(new Date(s.updatedAt));
    if (day === today) groups.Today.push(s);
    else if (day === yesterday) groups.Yesterday.push(s);
    else if (day >= weekAgo) groups["This Week"].push(s);
    else groups.Earlier.push(s);
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}
