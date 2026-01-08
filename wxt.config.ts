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
    ],
    // Firefox specific settings for Manifest V3
    browser_specific_settings: {
      gecko: {
        id: "duolingo-anki-extension@mori23.dev",
        strict_min_version: "140.0",
        data_collection_permissions: {
          "required": ["none"]
        }
      }
    }
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