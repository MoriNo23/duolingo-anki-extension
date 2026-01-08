import { 
  guardarApiKey, 
  obtenerApiKey, 
  tieneApiKeyConfigurada, 
  eliminarApiKey,
  obtenerInfoConfiguracion 
} from '@/util/storageService';

/**
 * Popup script para configuración de API Key de Gemini
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Popup de configuración cargado');

  // Elementos del DOM
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
  const changeBtn = document.getElementById('changeBtn') as HTMLButtonElement;
  const removeBtn = document.getElementById('removeBtn') as HTMLButtonElement;
  const statusDiv = document.getElementById('status');
  const configForm = document.getElementById('configForm');
  const configuredSection = document.getElementById('configuredSection');
  const configuredDate = document.getElementById('configuredDate');

  // Verificar estado inicial
  await verificarEstadoInicial();

  // Event Listeners
  saveBtn?.addEventListener('click', handleGuardarApiKey);
  testBtn?.addEventListener('click', handleProbarApiKey);
  changeBtn?.addEventListener('click', handleCambiarApiKey);
  removeBtn?.addEventListener('click', handleEliminarApiKey);
  
  // Validación en tiempo real del input
  apiKeyInput?.addEventListener('input', handleInputValidation);

  /**
   * Verifica si ya hay una API key configurada y actualiza la UI
   */
  async function verificarEstadoInicial() {
    try {
      const info = await obtenerInfoConfiguracion();
      
      if (info.tieneKey) {
        // Mostrar sección de configurado
        mostrarConfigurado(info.fechaConfiguracion);
      } else {
        // Mostrar formulario de configuración
        mostrarFormularioConfiguracion();
      }
    } catch (error) {
      console.error('❌ Error verificando estado inicial:', error);
      mostrarError('Error verificando configuración');
    }
  }

  /**
   * Muestra el formulario para configurar API key
   */
  function mostrarFormularioConfiguracion() {
    if (configForm) configForm.style.display = 'block';
    if (configuredSection) configuredSection.style.display = 'none';
    if (apiKeyInput) {
      apiKeyInput.value = '';
      apiKeyInput.focus();
    }
  }

  /**
   * Muestra la sección de API key configurada
   */
  function mostrarConfigurado(fecha?: string) {
    if (configForm) configForm.style.display = 'none';
    if (configuredSection) configuredSection.style.display = 'block';
    
    if (configuredDate && fecha) {
      const date = new Date(fecha);
      configuredDate.textContent = date.toLocaleString('es-ES');
    }
  }

  /**
   * Maneja el guardado de la API key
   */
  async function handleGuardarApiKey() {
    if (!apiKeyInput) return;

    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      mostrarError('Por favor, ingresa una API key');
      return;
    }

    // Deshabilitar botones durante el proceso
    setButtonsState(false);
    mostrarInfo('Guardando API key...');

    try {
      const exito = await guardarApiKey(apiKey);
      
      if (exito) {
        mostrarExito('✅ API Key guardada correctamente');
        // Cerrar popup después de 1.5 segundos
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        mostrarError('❌ Error al guardar la API key');
      }
    } catch (error) {
      console.error('❌ Error guardando API key:', error);
      mostrarError('Error al guardar la API key');
    } finally {
      setButtonsState(true);
    }
  }

  /**
   * Maneja la prueba de la API key
   */
  async function handleProbarApiKey() {
    if (!apiKeyInput) return;

    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      mostrarError('Por favor, ingresa una API key para probar');
      return;
    }

    // Validar formato básico
    if (!apiKey.startsWith('AIzaSy') || apiKey.length !== 39) {
      mostrarError('❌ Formato de API key inválido. Debe comenzar con "AIzaSy" y tener 39 caracteres');
      return;
    }

    setButtonsState(false);
    mostrarInfo('🔄 Probando API key...');

    try {
      // Hacer una solicitud simple a la API de Gemini para probar
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey
        }
      });

      if (response.ok) {
        mostrarExito('✅ API Key válida y funcionando');
      } else {
        const errorData = await response.json().catch(() => ({}));
        mostrarError(`❌ API Key inválida: ${errorData.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error probando API key:', error);
      mostrarError('❌ Error de conexión al probar la API key');
    } finally {
      setButtonsState(true);
    }
  }

  /**
   * Maneja el cambio de API key
   */
  function handleCambiarApiKey() {
    mostrarFormularioConfiguracion();
    limpiarStatus();
  }

  /**
   * Maneja la eliminación de la API key
   */
  async function handleEliminarApiKey() {
    setButtonsState(false);
    mostrarInfo('🗑️ Eliminando API key...');

    try {
      const exito = await eliminarApiKey();
      
      if (exito) {
        mostrarExito('✅ API Key eliminada correctamente');
        setTimeout(() => {
          mostrarFormularioConfiguracion();
        }, 1000);
      } else {
        mostrarError('❌ Error al eliminar la API key');
      }
    } catch (error) {
      console.error('❌ Error eliminando API key:', error);
      mostrarError('Error al eliminar la API key');
    } finally {
      setButtonsState(true);
    }
  }

  /**
   * Maneja la validación del input en tiempo real
   */
  function handleInputValidation() {
    if (!apiKeyInput) return;

    const value = apiKeyInput.value.trim();
    const isValid = value.startsWith('AIzaSy') && value.length === 39;

    if (saveBtn) {
      saveBtn.disabled = !value || !isValid;
    }

    if (testBtn) {
      testBtn.disabled = !value || !isValid;
    }

    // Visual feedback
    if (value && !isValid) {
      apiKeyInput.style.borderColor = 'rgba(244, 67, 54, 0.6)';
    } else if (value && isValid) {
      apiKeyInput.style.borderColor = 'rgba(76, 175, 80, 0.6)';
    } else {
      apiKeyInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    }
  }

  /**
   * Habilita/deshabilita los botones
   */
  function setButtonsState(enabled: boolean) {
    const buttons = [saveBtn, testBtn, changeBtn, removeBtn];
    buttons.forEach(btn => {
      if (btn) {
        btn.disabled = !enabled;
        if (!enabled) {
          btn.innerHTML = '<span class="loading"></span>Procesando...';
        } else {
          // Restaurar texto original
          if (btn === saveBtn) btn.innerHTML = 'Guardar API Key';
          else if (btn === testBtn) btn.innerHTML = 'Probar';
          else if (btn === changeBtn) btn.innerHTML = 'Cambiar API Key';
          else if (btn === removeBtn) btn.innerHTML = 'Eliminar';
        }
      }
    });
  }

  /**
   * Muestra un mensaje de éxito
   */
  function mostrarExito(message: string) {
    mostrarStatus(message, 'success');
  }

  /**
   * Muestra un mensaje de error
   */
  function mostrarError(message: string) {
    mostrarStatus(message, 'error');
  }

  /**
   * Muestra un mensaje informativo
   */
  function mostrarInfo(message: string) {
    mostrarStatus(message, 'info');
  }

  /**
   * Muestra un mensaje en el div de status
   */
  function mostrarStatus(message: string, type: 'success' | 'error' | 'info') {
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    // Auto-ocultar mensajes de éxito después de 3 segundos
    if (type === 'success') {
      setTimeout(() => {
        limpiarStatus();
      }, 3000);
    }
  }

  /**
   * Limpia el div de status
   */
  function limpiarStatus() {
    if (statusDiv) {
      statusDiv.style.display = 'none';
      statusDiv.textContent = '';
    }
  }

  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.close();
    }
    if (e.key === 'Enter' && apiKeyInput && document.activeElement === apiKeyInput) {
      handleGuardarApiKey();
    }
  });
});
