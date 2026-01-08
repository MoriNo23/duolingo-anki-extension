/**
 * Servicio para comunicarse con AnkiConnect local
 * Configuracion: http://127.0.0.1:8765
 */

interface AnkiCard {
  front: string;
  back: string;
  categoria: string;
  consejo: string;
}

interface AnkiDeckResponse {
  mazo: string;
  tarjetas: AnkiCard[];
}

/**
 * Envía las tarjetas a AnkiConnect
 * @param mazoAnki - Objeto con el mazo y tarjetas generadas por Gemini
 */
export const enviarMazoAAki = async (mazoAnki: AnkiDeckResponse) => {
  try {
    console.log('=== ENVIANDO MAZO A ANKICONNECT ===');
    console.log('Mazo:', mazoAnki.mazo);
    console.log('Cantidad de tarjetas:', mazoAnki.tarjetas.length);

    // Configuracion de AnkiConnect
    const ankiConnectUrl = 'http://127.0.0.1:8765';
    
    // 1. Obtener modelos disponibles
    const modelosDisponibles = await obtenerModelosDisponiblesEnAnki(ankiConnectUrl);
    console.log('Modelos disponibles:', modelosDisponibles);
    
    // 2. Seleccionar el mejor modelo (preferiblemente uno con Front/Back)
    const modeloSeleccionado = seleccionarMejorModeloDisponible(modelosDisponibles);
    console.log('Modelo seleccionado:', modeloSeleccionado);
    
    if (!modeloSeleccionado) {
      throw new Error('No se encontró ningún modelo compatible en Anki');
    }
    
    // 3. Crear el mazo si no existe
    await crearMazoSiNoExisteEnAnki(mazoAnki.mazo, ankiConnectUrl);
    
    // 4. Agregar cada tarjeta al mazo
    for (const tarjeta of mazoAnki.tarjetas) {
      await agregarTarjetaAlMazoAnki(tarjeta, mazoAnki.mazo, modeloSeleccionado, ankiConnectUrl);
    }
    
    console.log('=== MAZO ENVIADO CORRECTAMENTE A ANKI ===');
    console.log(`Se agregaron ${mazoAnki.tarjetas.length} tarjetas al mazo "${mazoAnki.mazo}"`);
    
  } catch (error) {
    console.error('Error al enviar mazo a AnkiConnect:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de modelos disponibles en Anki
 */
const obtenerModelosDisponiblesEnAnki = async (ankiUrl: string): Promise<string[]> => {
  const response = await fetch(ankiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'modelNames',
      version: 6
    })
  });
  
  const result = await response.json();
  if (result.error) {
    throw new Error(`Error obteniendo modelos: ${result.error}`);
  }
  
  return result.result || [];
};

/**
 * Selecciona el mejor modelo disponible para nuestras tarjetas
 */
const seleccionarMejorModeloDisponible = (modelos: string[]): string | null => {
  // Prioridad: Basic > Basic (and reversed card) > Cualquier otro
  const prioridad = [
    'Basic',
    'Basic (and reversed card)',
    'Basic (optional reversed card)',
    'Cloze'
  ];
  
  for (const modelo of prioridad) {
    if (modelos.includes(modelo)) {
      return modelo;
    }
  }
  
  // Si no encuentra ninguno de los prioritarios, devuelve el primero disponible
  return modelos.length > 0 ? modelos[0] : null;
};

/**
 * Obtiene los campos de un modelo específico
 */
const obtenerCamposDelModelo = async (nombreModelo: string, ankiUrl: string): Promise<string[]> => {
  const response = await fetch(ankiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'modelFieldNames',
      version: 6,
      params: {
        modelName: nombreModelo
      }
    })
  });
  
  const result = await response.json();
  if (result.error) {
    throw new Error(`Error obteniendo campos del modelo: ${result.error}`);
  }
  
  return result.result || [];
};

/**
 * Crea un mazo en Anki si no existe
 */
const crearMazoSiNoExisteEnAnki = async (nombreMazo: string, ankiUrl: string) => {
  const response = await fetch(ankiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'createDeck',
      version: 6,
      params: {
        deck: nombreMazo
      }
    })
  });
  
  const result = await response.json();
  if (result.error) {
    // Si el mazo ya existe, AnkiConnect devuelve error, pero eso está bien
    if (!result.error.includes('deck already exists')) {
      throw new Error(`Error creando mazo: ${result.error}`);
    }
  }
  
  console.log(`Mazo "${nombreMazo}" listo para usar`);
};

/**
 * Agrega una tarjeta específica a un mazo
 */
const agregarTarjetaAlMazoAnki = async (tarjeta: AnkiCard, nombreMazo: string, nombreModelo: string, ankiUrl: string) => {
  // Obtener los campos disponibles del modelo
  const camposDisponibles = await obtenerCamposDelModelo(nombreModelo, ankiUrl);
  console.log(`Campos disponibles para modelo "${nombreModelo}":`, camposDisponibles);
  
  // Adaptar los campos según lo que tenga el modelo
  let fields: any = {};
  
  if (camposDisponibles.includes('Front') && camposDisponibles.includes('Back')) {
    // Modelo estándar Basic
    fields = {
      Front: tarjeta.front,
      Back: `${tarjeta.back}

<div style="margin-top: 10px; padding: 8px; background-color: #2d2d2d; border: 1px solid #444; border-radius: 4px; color: #fff;">
<strong style="color: #4fc3f7;">Categoría:</strong> ${tarjeta.categoria}<br>
<strong style="color: #81c784;">Consejo:</strong> <span style="color: #fff;">${tarjeta.consejo}</span>
</div>`
    };
  } else if (camposDisponibles.length >= 2) {
    // Usar los primeros dos campos disponibles
    fields[camposDisponibles[0]] = tarjeta.front;
    fields[camposDisponibles[1]] = `${tarjeta.back}

<div style="margin-top: 10px; padding: 8px; background-color: #2d2d2d; border: 1px solid #444; border-radius: 4px; color: #fff;">
<strong style="color: #4fc3f7;">Categoría:</strong> ${tarjeta.categoria}<br>
<strong style="color: #81c784;">Consejo:</strong> <span style="color: #fff;">${tarjeta.consejo}</span>
</div>`;
  } else {
    throw new Error(`El modelo "${nombreModelo}" no tiene suficientes campos para las tarjetas`);
  }

  const response = await fetch(ankiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: nombreMazo,
          modelName: nombreModelo,
          fields: fields,
          tags: ['duolingo-errores', tarjeta.categoria.toLowerCase().replace(/\s+/g, '-')]
        }
      }
    })
  });
  
  const result = await response.json();
  if (result.error) {
    throw new Error(`Error agregando tarjeta: ${result.error}`);
  }
  
  console.log(`Tarjeta agregada: "${tarjeta.front}"`);
};

/**
 * Verifica si AnkiConnect está disponible
 */
export const verificarAnkiConnect = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://127.0.0.1:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'version',
        version: 6
      })
    });
    
    const result = await response.json();
    return !result.error;
  } catch (error) {
    console.error('AnkiConnect no está disponible:', error);
    return false;
  }
};
