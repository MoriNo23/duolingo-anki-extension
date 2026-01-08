import { observandoLesson } from '@/util/observadorDeLeccion'


export default defineContentScript({
    matches: ['*://*.duolingo.com/*'],
    main() {


        const obs: MutationObserver = new MutationObserver(observandoLesson)
        // llamamos al observe
        if (document.body) {
            obs.observe(document.body, { childList: true, subtree: true })
        }

    },
    
})
