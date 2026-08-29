// auth.js — API key storage/retrieval. Mirrors OpenCode's per-provider
// `auth login` credential pattern, adapted to React Native's AsyncStorage
// (the mobile/web equivalent of browser localStorage). Keys are entered by
// the user at runtime — this file never ships a static auth.json with keys.

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "ignite:auth:";
const ACTIVE_PROVIDER_KEY = "ignite:activeProvider";

/** Save an API key for a given provider id (e.g. "gemini"). */
export async function saveProviderKey(providerId, apiKey) {
  await AsyncStorage.setItem(KEY_PREFIX + providerId, apiKey);
}

/** Retrieve the stored API key for a provider, or null if not connected. */
export async function getProviderKey(providerId) {
  return AsyncStorage.getItem(KEY_PREFIX + providerId);
}

/** Remove a stored key (disconnect a provider). */
export async function removeProviderKey(providerId) {
  await AsyncStorage.removeItem(KEY_PREFIX + providerId);
}

/** Returns { [providerId]: boolean } for whether each provider has a key set. */
export async function getConnectedProviders(providerIds) {
  const entries = await Promise.all(
    providerIds.map(async (id) => [id, !!(await getProviderKey(id))])
  );
  return Object.fromEntries(entries);
}

/** True if at least one provider has a connected key. */
export async function hasAnyProviderConnected(providerIds) {
  const map = await getConnectedProviders(providerIds);
  return Object.values(map).some(Boolean);
}

export async function setActiveProvider(providerId) {
  await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, providerId);
}

export async function getActiveProvider(fallback) {
  return (await AsyncStorage.getItem(ACTIVE_PROVIDER_KEY)) || fallback;
}
