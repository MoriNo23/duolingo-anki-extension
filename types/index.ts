// Tipos para la extensión
export interface DuolingoError {
  textoPrueba: string;
  textoEntrada: string;
  textoSolucion: string;
  timestamp: number;
  leccionId?: string;
}

export interface AnkiCard {
  front: string;
  back: string;
  categoria: string;
  consejo: string;
}

export interface AnkiDeck {
  mazo: string;
  tarjetas: AnkiCard[];
}

export interface GeminiResponse {
  mazo: string;
  tarjetas: AnkiCard[];
}

// Tipos para mensajes entre componentes
export interface MessageGetApiKey {
  type: 'GET_API_KEY';
}

export interface MessageSaveApiKey {
  type: 'SAVE_API_KEY';
  apiKey: string;
}

export interface MessageErroresAcumulados {
  type: 'ERRORES_ACUMULADOS';
  data: DuolingoError[];
}

export type ExtensionMessage = MessageGetApiKey | MessageSaveApiKey | MessageErroresAcumulados;

export interface MessageResponse {
  success: boolean;
  message?: string;
  apiKey?: string;
}

// Clase de error personalizada
export class ExtensionError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'ExtensionError';
  }
}

// Códigos de error
export const ERROR_CODES = {
  NO_API_KEY: 'NO_API_KEY',
  INVALID_API_KEY: 'INVALID_API_KEY',
  GEMINI_ERROR: 'GEMINI_ERROR',
  ANKI_ERROR: 'ANKI_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;
