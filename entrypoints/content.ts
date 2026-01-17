import { observandoLesson } from '@/util/observadorDeLeccion'
import { DuolingoError, MessageErroresAcumulados } from '@/types'
import { logger } from '@/util/logger'

export default defineContentScript({
    matches: ['*://*.duolingo.com/*'],
    main() {
        logger.success('Duolingo Anki Extension - Content Script iniciado');

        const obs: MutationObserver = new MutationObserver(observandoLesson)
        
        // llamamos al observe
        if (document.body) {
            obs.observe(document.body, { childList: true, subtree: true })
            logger.debug('Observador de DOM iniciado');
        } else {
            logger.error('No se encontró document.body');
        }
    },
})
