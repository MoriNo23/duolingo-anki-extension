# DuoFlash Anki

 <p align="center">
   <img src="public/icons/icon-128.png" width="128" height="128" alt="DuoFlash Anki" />
 </p>
 
 Extensión para Firefox (próximamente Chrome) que captura errores en Duolingo y genera tarjetas en Anki con Gemini.
 
 ## Instalación
 
 - **Descargar Anki**: https://apps.ankiweb.net/
 - **Instalar AnkiConnect** (add-on `2055492159`) y mantener Anki abierto.
 
 ```bash
 pnpm install
 pnpm run build:firefox
 # Firefox: about:debugging -> Load Temporary Add-on -> .output/firefox-mv2/
 ```
 
 ## API Key (popup)
 
 Obtén tu key en https://aistudio.google.com/api-keys, abre el popup de la extensión y pégala ahí.
 
 
 Disclaimer: Projecto meramente de investigacion y estudio de idiomas.
