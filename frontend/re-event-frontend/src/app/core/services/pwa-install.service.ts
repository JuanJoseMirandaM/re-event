import { Injectable, signal, computed } from '@angular/core';
import { BeforeInstallPromptEvent } from '../../interfaces/before-install-prompt-event.interface';

export interface InstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
}

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService {
  private state = signal<InstallState>({
    canInstall: false,
    isInstalled: false,
    isIOS: false,
    isStandalone: false,
    promptEvent: null
  });

  // Computed properties
  isIOS = computed(() => this.state().isIOS);
  showInstallButton = computed(() => 
    this.state().canInstall && 
    !this.state().isInstalled && 
    !this.state().isStandalone
  );

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Detectar plataforma
    this.detectPlatform();
    
    // Detectar si ya está instalado
    this.detectInstallation();
    
    // Escuchar eventos de instalación
    this.setupEventListeners();
  }

  private detectPlatform(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.state.update(state => ({ ...state, isIOS }));
    
    console.log('PWA Install Service: Plataforma detectada:', isIOS ? 'iOS' : 'Android/Desktop');
  }

  private detectInstallation(): void {
    // Detectar modo standalone (instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    this.state.update(state => ({ ...state, isStandalone }));
    
    console.log('PWA Install Service: Modo standalone:', isStandalone);
  }

  private setupEventListeners(): void {
    // Evento beforeinstallprompt (Android/Desktop)
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.state.update(state => ({ 
        ...state, 
        promptEvent: event as BeforeInstallPromptEvent,
        canInstall: true 
      }));
      console.log('PWA Install Service: Prompt de instalación disponible');
    });

    // Evento appinstalled
    window.addEventListener('appinstalled', () => {
      this.state.update(state => ({ 
        ...state, 
        isInstalled: true,
        canInstall: false,
        promptEvent: null 
      }));
      console.log('PWA Install Service: App instalada exitosamente');
    });

    // Detectar cambios en el modo de visualización
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', (e) => {
      this.state.update(state => ({ 
        ...state, 
        isStandalone: e.matches 
      }));
      console.log('PWA Install Service: Cambio en modo de visualización:', e.matches);
    });
  }

  async installPwa(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.state().isIOS) {
        return this.showIOSInstructions();
      } else {
        return this.installOnAndroid();
      }
    } catch (error) {
      console.error('PWA Install Service: Error durante la instalación:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  private async installOnAndroid(): Promise<{ success: boolean; error?: string }> {
    const promptEvent = this.state().promptEvent;
    
    if (!promptEvent) {
      return { 
        success: false, 
        error: 'No hay prompt de instalación disponible' 
      };
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      
      if (choice.outcome === 'accepted') {
        console.log('PWA Install Service: Usuario aceptó la instalación');
        return { success: true };
      } else {
        console.log('PWA Install Service: Usuario rechazó la instalación');
        return { 
          success: false, 
          error: 'Usuario rechazó la instalación' 
        };
      }
    } catch (error) {
      throw new Error('Error durante el prompt de instalación');
    }
  }

  private showIOSInstructions(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Crear modal con instrucciones para iOS
      const modal = document.createElement('div');
      modal.className = 'ios-install-modal';
      modal.innerHTML = `
        <div class="ios-install-content">
          <p class="text-xl my-2">Instalar re:Event en iOS</p>
          <p class="text-base">Sigue estos pasos para instalar la app:</p>
          <ol class="ios-install-steps">
            <li>
              <span>Toca el botón <strong>Compartir</strong> en Safari</span>
            </li>
            <li>
              <span>Selecciona <strong>"Agregar a Pantalla de Inicio"</strong></span>
            </li>
            <li>
              <span>Toca <strong>"Agregar"</strong> para confirmar</span>
            </li>
          </ol>
          <div class="ios-install-tip">
            <strong>💡 Tip:</strong> La app aparecerá en tu pantalla de inicio como una app nativa
          </div>
          <button class="btn btn--primary ios-install-close">¡Entendido!</button>
        </div>
      `;

      // Agregar estilos
      const style = document.createElement('style');
      style.textContent = `
        .ios-install-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        }
        .ios-install-content {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          max-width: 90%;
          max-height: 90%;
          overflow-y: auto;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .ios-install-steps {
          text-align: left;
          margin: 1.5rem 0;
          line-height: 1.8;
          list-style: none;
          padding: 0;
        }
        .ios-install-steps li {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .ios-install-tip {
          background: #f4f4ff;
          padding: 1rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          border-left: 4px solid var(--primary-lilac-light);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(modal);

      // Cerrar modal y resolver
      const closeModal = () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve({ success: true });
      };

      // Cerrar con botón
      modal.querySelector('.ios-install-close')?.addEventListener('click', closeModal);

      // Cerrar al hacer clic fuera del modal
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });

      // Cerrar con Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    });
  }
}
