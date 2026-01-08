import { DOM } from '@/util/obtenerDom'
import { getTestDuolingoText } from '@/util/obtenerTextoDuolingo'
import { agregarErrorAlArray } from '@/util/almacenamiento'


export const handleclickComprobar = () => {
   const callback = (mutationList: any, observer: any) => {
        console.log(`Se detectaron ${mutationList.length} mutaciones`)

        let timer

        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    const test = DOM.getTestHintTokens()

                    const input = getTestDuolingoText()

                    const solucion = DOM.solutionError(DOM.getErrorTest() as Element)

                    interface ErrorDelUsuario {
                        textoPrueba: string
                        textoEntrada: string
                        textoSolucion: string
                    }

                    const inputs: ErrorDelUsuario = {
                        textoPrueba: test,
                        textoEntrada: input,
                        textoSolucion: solucion,
                    }

                    function enviarSiCompleto(obj: ErrorDelUsuario): obj is Required<ErrorDelUsuario> {
                        const valores = Object.values(obj)

                        return valores.every((valor) => {
                            return typeof valor === 'string' && valor.trim() !== ''
                        })
                    }


                    // Opcional: enviar solo si está completo
                    if (enviarSiCompleto(inputs)) {
                        // Agregar este error al array acumulado
                        agregarErrorAlArray(inputs)
                        console.log('Error agregado al array:', inputs)
                        return inputs
                    }
                }, 300)
            }
        }

        observer.disconnect()
    }

    const OBSerrors = new MutationObserver(callback)
    OBSerrors.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
    })
}
