import React, { useState, useEffect } from 'react';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Pedir API key al background (que la tiene guardada en localStorage)
    console.log('Pidiendo API key al background...');
    browser.runtime.sendMessage({ 
      type: 'GET_API_KEY' 
    }, (response) => {
      console.log('Respuesta del background:', response);
      if (response && response.apiKey) {
        setApiKey(response.apiKey);
        console.log('API key recibida desde background:', response.apiKey);
      } else {
        console.log('No hay API key guardada en el background');
      }
    });
  }, []);

  const handleSave = () => {
    console.log('Enviando API key al background:', apiKey);
    
    // Enviar API key directamente al background
    browser.runtime.sendMessage({ 
      type: 'SAVE_API_KEY', 
      apiKey: apiKey 
    }, (response) => {
      console.log('Respuesta del background:', response);
      if (response && response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        console.error('Error al guardar API key en el background');
      }
    });
  };

  return (
    <div style={{ padding: '16px', minWidth: '300px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#58cc02' }}>
        Duolingo Anki Extension
      </h1>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
        Configura tu API Key de Gemini AI
      </p>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          Gemini API Key:
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Ingresa tu API key..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button 
        onClick={handleSave}
        disabled={!apiKey.trim()}
        style={{
          backgroundColor: apiKey.trim() ? '#58cc02' : '#ccc',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          width: '100%'
        }}
      >
        {saved ? '✓ Guardado' : 'Guardar API Key'}
      </button>

      {saved && (
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#58cc02' }}>
          API key guardada correctamente
        </p>
      )}
    </div>
  );
}

export default App;
