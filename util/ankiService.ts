/**
 * Servicio para comunicarse con AnkiConnect local
 * Configuracion: http://127.0.0.1:8765
 */

export interface AnkiCard {
  front: string;
  back: string;
  categoria: string;
  consejo: string;
}

export interface AnkiDeckResponse {
  mazo: string;
  tarjetas: AnkiCard[];
}

const ankiConnectUrl = 'http://127.0.0.1:8765';

/**
 * Envía el mazo generado por Gemini a AnkiConnect
 */
export const enviarMazoAAki = async (mazoAnki: AnkiDeckResponse): Promise<void> => {
  console.log('=== ENVIANDO MAZO A ANKICONNECT ===');
  console.log('Mazo:', mazoAnki.mazo);
  console.log('Cantidad de tarjetas:', mazoAnki.tarjetas.length);

  const ok = await verificarAnkiConnect();
  if (!ok) {
    throw new Error('AnkiConnect no está disponible');
  }

  // Asegurar que el mazo exista
  await crearMazoSiNoExisteEnAnki(mazoAnki.mazo, ankiConnectUrl);

  // Detectar modelo disponible
  const modelos = await obtenerModelosDisponiblesEnAnki(ankiConnectUrl);
  const modeloSeleccionado = seleccionarMejorModeloDisponible(modelos);
  if (!modeloSeleccionado) {
    throw new Error('No hay modelos disponibles en Anki');
  }

  // Agregar tarjetas una por una (permite adaptar campos según modelo)
  for (const tarjeta of mazoAnki.tarjetas) {
    await agregarTarjetaAlMazoAnki(tarjeta, mazoAnki.mazo, modeloSeleccionado, ankiConnectUrl);
  }

  console.log('=== MAZO ENVIADO CORRECTAMENTE A ANKI ===');
  console.log(`Se agregaron ${mazoAnki.tarjetas.length} tarjetas al mazo "${mazoAnki.mazo}"`);
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
