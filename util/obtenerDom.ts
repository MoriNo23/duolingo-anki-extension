
export const partialReverseTranslate = () => {
   const elementContainer = document.querySelector('[data-test="challenge challenge-partialReverseTranslate"] label');
   if(!elementContainer) return ""
  const spans = Array.from((elementContainer as HTMLElement).querySelectorAll('span')).filter(span => !span.getAttribute('class') || span.getAttribute('contenteditable'))
const result = spans.map(span => span.innerText).join('')
return result || ""
}


export const challengeTranslate = () => {
    const elementContainer = document.querySelector('[data-test="challenge challenge-translate"]');
    if (!elementContainer) return ""; // Verificar si el contenedor existe

    // Obtener los botones dinámicamente
    const buttons = Array.from(elementContainer.querySelectorAll('[style*="z-index:"]'));

    // Si hay botones, juntar su texto
    if (buttons.length > 0) {
        const result2 = buttons.map((button) => (button as HTMLElement)?.innerText).join(" ");
        return result2.trim() || ""; // Retornar el texto combinado
    }
    
    // Si no hay botones, intentar obtener el valor de un textarea
    const textarea = elementContainer.querySelector("textarea");
    return textarea ? textarea.value.trim() : ""; // Retornar el valor del textarea o cadena vacía
};


export const completeReverseTranslation = () => {
  const elementContainer = document.querySelector('[data-test="challenge challenge-completeReverseTranslation"]');
  if(!elementContainer) return ""
  const labelElement = elementContainer?.querySelector('label');
  
  if (!labelElement?.children) {
    return "";
  }
  
  return Array.from(labelElement.children).map((item) => {
    const input = item.querySelector('input');
    if(input) return input.value;
    return (item as HTMLElement).innerText || "";
  }).join('');
}

export const radiogroupText = () => {
  const elementContainer = document.querySelector('[role="radiogroup"]');
  if (!elementContainer) return "";
  
  const elementoActivo = Array.from(elementContainer.children).find(ele => ele.ariaChecked === "true");
  return elementoActivo?.querySelector('[data-test="challenge-judge-text"]')?.textContent?.trim() || "";
};


export const challengeTapComplete = () => {
  const container = document.querySelector('[data-test="challenge challenge-tapComplete"] > div > div:nth-of-type(2) div');
  if (!container) return "";
  
  const arr = Array.from(container.children);
  const mappedArr = arr.map((item) => {
    const spanElement = item.querySelector('span > div > span');
    if(spanElement) {
      return spanElement.textContent;
    }
    return item.textContent;
  });
  return mappedArr.join("").replace(/\s+/g, ' ').trim();
}




const getErrorTest = () => document.querySelector('div[data-test="blame blame-incorrect"] h2')

const solutionError = (failedTest: Element) => {
    if (!failedTest) return ''
    return failedTest.nextSibling?.textContent || ''
}

const getTestHintTokens = () => {
    const nodos: NodeList = document.querySelectorAll('span[aria-hidden="true"]')
    const phraseArr: Array<string> = []
    nodos.forEach((span: Node) => phraseArr.push(span.textContent ?? ''))
    if (phraseArr.length > 0) {
        return phraseArr.join('') || ''
    } else {
        return ''
    }
}




export const DOM = {
    getErrorTest,
    solutionError,
    getTestHintTokens,

}
