import { observandoLesson } from '@/util/observadorDeLeccion'
import { logger } from '@/util/logger'

export default defineContentScript({
    matches: ['*://*.duolingo.com/*'],
    main() {
        logger.success('DuoFlash Anki - Content Script iniciado');

        // Iniciar monitoreo de URL para saber cuándo enviar datos
        observandoLesson();

        logger.debug('Sistemas de monitoreo iniciados (URL Monitoring)');
    },
})
