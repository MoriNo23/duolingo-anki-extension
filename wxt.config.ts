import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 2,
  manifest: {
    name: "DuoFlash Anki",
    description: "Extension that integrates Duolingo errors with Anki using Gemini AI",
    version: "1.0.0",
    permissions: [
      "storage"
    ],
    background: {
      "scripts": ["entrypoints/background.ts"]
    },
    host_permissions: [
      "*://*.duolingo.com/*",
      "https://generativelanguage.googleapis.com/*"
    ],
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png", 
      48: "icons/icon-48.png",
      128: "icons/icon-128.png"
    }
  },
});