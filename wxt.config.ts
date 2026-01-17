import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 2,
  manifest: {
    name: "Duolingo Anki Extension",
    description: "Extension that integrates Duolingo errors with Anki using Gemini AI",
    version: "2.0.0",
    permissions: [
      "storage"
    ],
    background: {
      "scripts": ["entrypoints/background.ts"]
    },
    host_permissions: [
      "*://*.duolingo.com/*",
      "https://generativelanguage.googleapis.com/*"
    ]
  },

});