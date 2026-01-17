import React, { useState, useEffect } from 'react';
import { MessageGetApiKey, MessageSaveApiKey, MessageResponse } from '@/types';
import './styles.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface StatusMessage {
  type: Status;
  message: string;
}

function App() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  useEffect(() => {
    // Pedir API key al background
    browser.runtime.sendMessage({ 
      type: 'GET_API_KEY' 
    }, (response: MessageResponse) => {
      if (response?.success && response.apiKey) {
        setApiKey(response.apiKey);
      }
    });
  }, []);

  const validateApiKey = (key: string): 'weak' | 'medium' | 'strong' | 'invalid' => {
    if (!key) return 'invalid';
    if (key.length < 20) return 'weak';
    if (key.length < 30) return 'medium';
    return 'strong';
  };

  const getStrengthText = (strength: string): string => {
    switch (strength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setStatusMessage({
        type: 'error',
        message: 'Por favor ingresa una API key válida'
      });
      return;
    }

    setStatus('loading');
    setStatusMessage(null);

    // Enviar API key directamente al background
    browser.runtime.sendMessage({ 
      type: 'SAVE_API_KEY', 
      apiKey: apiKey.trim() 
    }, (response: MessageResponse) => {
      setStatus('idle');
      
      if (response?.success) {
        setStatusMessage({
          type: 'success',
          message: '✓ API key guardada correctamente'
        });
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage({
          type: 'error',
          message: response?.message || 'Error al guardar la API key'
        });
      }
    });
  };

  const strength = validateApiKey(apiKey);
  const isValid = strength !== 'invalid' && apiKey.trim().length > 0;

  return (
    <div className="duolingo-popup">
      <div className="header">
        <h1 className="title">DuoFlash Anki</h1>
        <p className="subtitle">Configura tu API Key de Gemini AI</p>
      </div>
      
      <div className="form-group">
        <label className="label">
          Gemini API Key:
        </label>
        <div className="input-wrapper">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            className={`api-input ${strength}`}
            disabled={status === 'loading'}
          />
          {apiKey && (
            <span className={`strength-indicator strength-${strength}`}>
              {getStrengthText(strength)}
            </span>
          )}
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={!isValid || status === 'loading'}
        className="button button-primary"
      >
        <div className="button-content">
          {status === 'loading' ? (
            <>
              <div className="spinner"></div>
              Guardando...
            </>
          ) : (
            'Guardar API Key'
          )}
        </div>
      </button>

      {statusMessage && (
        <div className={`status-message status-${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="footer">
        <p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            ¿No tienes API key? Obtén una aquí
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
