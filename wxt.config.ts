import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Duolingo Anki Extension",
    description: "Firefox extension that integrates Duolingo errors with Anki using Gemini AI",
    version: "2.0.0",
    background: {
      service_worker: "entrypoints/background.ts",
      // o para MV2:
      // persistent: true,
      // scripts: ["entrypoints/background.ts"]
    },
    action: {
      default_popup: "entrypoints/popup/popup.html",
      default_title: "Duolingo Anki - Configuración",
      default_icon: {
        "16": "icon/16.svg",
        "32": "icon/32.svg",
        "48": "icon/48.svg",
        "96": "icon/96.svg",
        "128": "icon/128.svg"
      }
    },
    permissions: [
      "storage",
      "activeTab"
    ],
    host_permissions: [
      "*://*.duolingo.com/*",
      "https://generativelanguage.googleapis.com/*"
    ]
  },
  // Configuración específica para cada navegador
  zip: {
    name: "duolingo-anki-extension",
    zipSources: true
  },
  // Optimización para diferentes navegadores
  dev: {
    server: {
      port: 3000
    }
  }
});