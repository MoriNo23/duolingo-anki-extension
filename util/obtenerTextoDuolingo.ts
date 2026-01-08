import { challengeTapComplete, radiogroupText, completeReverseTranslation, challengeTranslate, partialReverseTranslate } from "./obtenerDom";

export const getTestDuolingoText = () => {
    let result = ""
const arrayDeFunciones = [challengeTapComplete, radiogroupText, completeReverseTranslation, challengeTranslate, partialReverseTranslate];
const funcionNoRetornaStringVacio = (funcion:CallableFunction) => {
  const resultado = funcion();
  if (resultado === "" || resultado === null || resultado === undefined) return false;
  return resultado;
}
for (let i = 0; i < arrayDeFunciones.length; i++) {
   const sentence = funcionNoRetornaStringVacio(arrayDeFunciones[i])
result = sentence
   if(sentence) break;
  }
return result
}