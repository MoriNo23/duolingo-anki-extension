import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Duolingo Anki Extension",
    description: "Extension that integrates Duolingo errors with Anki using Gemini AI",
    version: "2.0.0",
    manifest_version: 3,
    background: {
      service_worker: "entrypoints/background.ts"
    },
    permissions: [
      "activeTab"
    ],
    host_permissions: [
      "*://*.duolingo.com/*",
      "https://generativelanguage.googleapis.com/*"
    ]
  },
  // Firefox specific settings for Manifest V3
  browser_specific_settings: {
    gecko: {
      id: "duolingo-anki-extension@mori23.dev",
      strict_min_version: "109.0"
    }
  }
});