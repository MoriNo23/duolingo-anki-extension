import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
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
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "128": "icon/128.png"
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
  }
});