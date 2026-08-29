# Ignite — Expo / React Native build

Mobile-first AI dev workspace, built with Expo (React Native) so it runs on
Android, iOS, and — via Expo's web export — on Vercel as a website. This
replaces the earlier single-file HTML/Lovable build described in the PRD,
translated 1:1 into RN idioms:

| PRD concept (HTML build)        | This build (Expo/RN)                          |
|----------------------------------|-------------------------------------------------|
| `localStorage` for API keys      | `AsyncStorage` via `src/lib/auth.js`             |
| IndexedDB for sessions            | `AsyncStorage` via `src/lib/storage.js`          |
| `config.json`, `system-prompt.js`, `tools/*.js` | Same files, same role, under `src/` |
| Single `ignite.html`              | `App.js` + `src/screens/*` (React Navigation)    |
| Ignite/Studio header toggle       | Removed — header is logo + New Chat + History + Profile |
| History screen                    | Kept, **plus** a ChatGPT/Lovable-style sidebar drawer for quick chat switching |

## Project layout

```
Ignite/
├── App.js
├── app.json / package.json / babel.config.js / vercel.json
└── src/
    ├── theme/theme.js          # design tokens (PRD Section 6, unchanged)
    ├── navigation/RootNavigator.js
    ├── components/             # Header, Sidebar, InputCard, PlanTimeline, FileCard, etc.
    ├── screens/                # Home, Chat, PlanPanel, FilesPanel, FilePreview, History, Profile
    ├── lib/
    │   ├── auth.js              # API key storage (AsyncStorage, runtime only)
    │   ├── storage.js           # session/chat/plan/file persistence
    │   ├── providers.js         # provider abstraction — callModel(history, providerId, tools, systemPrompt)
    │   ├── agentLoop.js         # tool-calling agent loop + structured output + retry
    │   └── validation.js        # JSON schema validation for the agent's final response
    ├── tools/                   # read_file, write_file, run_check tool implementations
    ├── prompts/systemPrompt.js  # the agent's system prompt
    └── config/config.json       # provider list + defaults
```

## Run locally

```bash
npm install
npx expo start          # scan the QR code in Expo Go for a real device
# or
npm run web              # runs in the browser via react-native-web
```

## Deploy the web build to Vercel

`vercel.json` is already set up to run `npx expo export --platform web` and
serve the `dist/` folder. From the project root:

```bash
npm install -g vercel   # if you don't have it
vercel
```

Or connect the repo in the Vercel dashboard — it will pick up `vercel.json`
automatically (Build Command: `npx expo export --platform web`, Output
Directory: `dist`).

## API keys — how the "no key connected" behavior works

Keys are entered by the user in **Profile → Models**, tap a provider, paste
the key. Nothing is bundled or shipped with the app. If someone sends a
message (e.g. "Hi") in Chat before connecting any key, `ChatScreen.js` checks
`getProviderKey()` first and — without calling any API — replies inline:

> "Please connect your API key to start generating. Go to Profile → Models,
> or tap the model selector above, to add a key for at least one provider."

Once a key is saved for the active provider, the same message is sent to the
real agent loop (`runAgentTurn`) instead.

## Notes / things intentionally left as stubs

- The paperclip "attach" button in the input card is UI-only (no file picker
  wired up yet) — say the word if you want that connected to
  `expo-document-picker`.
- "Install APK" in File Preview is relabeled "Export file" and shares the raw
  file via the OS share sheet — a real signed APK requires an EAS Build step
  outside what a client-side app can do.
- Icons/splash image assets aren't included — drop your own into `/assets`
  and reference them back in `app.json` when ready.
