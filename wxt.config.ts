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
    },
    browser_specific_settings: {
      gecko: {
        id: "a7b8c9d0-e1f2-4a3b-8c5d-6e7f8a9b0c1d@MoriNo23.github.io",
        data_collection_permissions: {
          "is_data_collection_required": false,
          "required": ["none"],
          "data_collection_description": "This extension does not collect any personal data. It only stores user preferences locally in the browser."
        }
      }
    }
  },
});