import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProxyTestService } from '../../core/services/proxy-test.service';

@Component({
  selector: 'app-proxy-diagnostic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex--col gap-4 p-4">
      <!-- Header -->
      <div class="flex flex--col items-center gap-1 bg-primary rounded-md w-full p-4">
        <span class="text-2xl">🔧</span>
        <span class="text-base font-medium">Diagnóstico de Proxy</span>
        <span class="text-sm text-gray-600">Verificar configuración del proxy</span>
      </div>

      <!-- Info del servidor -->
      <div class="bg-blue-50 border border-blue-200 rounded p-3">
        <div class="text-sm font-medium text-blue-800">ℹ️ Información del Servidor:</div>
        <div class="text-xs text-blue-700 mt-1">
          <div>Host: {{ window.location.hostname }}</div>
          <div>Puerto: {{ window.location.port }}</div>
          <div>Protocolo: {{ window.location.protocol }}</div>
          <div>URL Base: {{ window.location.origin }}</div>
        </div>
      </div>

      <!-- Instrucciones -->
      <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
        <div class="text-sm font-medium text-yellow-800">⚠️ Instrucciones:</div>
        <div class="text-xs text-yellow-700 mt-1">
          <div>1. Asegúrate de ejecutar: <code class="bg-yellow-100 px-1 rounded">npm run start:proxy</code></div>
          <div>2. O ejecutar: <code class="bg-yellow-100 px-1 rounded">ng serve --proxy-config proxy.conf.json</code></div>
          <div>3. Verifica que el archivo proxy.conf.json existe en la raíz del proyecto</div>
        </div>
      </div>

      <!-- Test Buttons -->
      <div class="flex gap-2 flex-wrap">
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testProxySimple()">
          🔧 Test Proxy Simple
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testProxyEndpoint()">
          📡 Test Endpoint
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testProxyPost()">
          📤 Test POST
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testDirect()">
          🌐 Test Directo
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="clearResults()">
          🗑️ Limpiar
        </button>
      </div>

      <!-- Results -->
      @for (result of results(); track result.id) {
        <div class="border rounded p-3" [class]="result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
          <div class="flex items-center gap-2 mb-2">
            <span>{{ result.success ? '✅' : '❌' }}</span>
            <span class="font-medium">{{ result.test }}</span>
            <span class="text-sm text-gray-500">{{ result.timestamp }}</span>
          </div>
          
          @if (result.success) {
            <div class="text-sm text-green-700">
              <div>Status: {{ result.status }}</div>
              <div>URL: {{ result.url }}</div>
            </div>
          } @else {
            <div class="text-sm text-red-700">
              <div>Error: {{ result.error }}</div>
              <div>Status: {{ result.status || 'N/A' }}</div>
            </div>
          }
          
          @if (result.details) {
            <details class="mt-2">
              <summary class="text-xs cursor-pointer">Ver detalles</summary>
              <pre class="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">{{ result.details | json }}</pre>
            </details>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    code {
      font-family: 'Courier New', monospace;
      font-size: 11px;
    }
  `]
})
export default class ProxyDiagnosticComponent {
  private readonly proxyTestService = inject(ProxyTestService);
  
  results = signal<any[]>([]);
  window = window;

  testProxySimple(): void {
    console.log('🔧 Iniciando test proxy simple...');
    
    this.proxyTestService.testProxySimple()
      .subscribe({
        next: (response) => {
          this.addResult({
            test: 'Proxy Simple (GET /presigned-api/)',
            success: true,
            status: response.status,
            url: response.url,
            details: response.headers
          });
        },
        error: (error) => {
          this.addResult({
            test: 'Proxy Simple (GET /presigned-api/)',
            success: false,
            error: error.message,
            status: error.status,
            details: error
          });
        }
      });
  }

  testProxyEndpoint(): void {
    console.log('📡 Iniciando test endpoint completo...');
    
    this.proxyTestService.testProxyEndpoint()
      .subscribe({
        next: (response) => {
          this.addResult({
            test: 'Endpoint Completo (GET)',
            success: true,
            status: response.status,
            url: response.url,
            details: response.body
          });
        },
        error: (error) => {
          this.addResult({
            test: 'Endpoint Completo (GET)',
            success: false,
            error: error.message,
            status: error.status,
            details: error
          });
        }
      });
  }

  testProxyPost(): void {
    console.log('📤 Iniciando test POST...');
    
    this.proxyTestService.testProxyPost()
      .subscribe({
        next: (response) => {
          this.addResult({
            test: 'POST con Proxy',
            success: true,
            status: response.status,
            url: response.url,
            details: response.body
          });
        },
        error: (error) => {
          this.addResult({
            test: 'POST con Proxy',
            success: false,
            error: error.message,
            status: error.status,
            details: error
          });
        }
      });
  }

  testDirect(): void {
    console.log('🌐 Iniciando test directo...');
    
    this.proxyTestService.testDirect()
      .subscribe({
        next: (response) => {
          this.addResult({
            test: 'URL Directa (sin proxy)',
            success: true,
            status: response.status,
            url: response.url,
            details: response.body
          });
        },
        error: (error) => {
          this.addResult({
            test: 'URL Directa (sin proxy)',
            success: false,
            error: error.message,
            status: error.status,
            details: error
          });
        }
      });
  }

  private addResult(result: any): void {
    const newResult = {
      ...result,
      id: Math.random().toString(36).substring(2),
      timestamp: new Date().toLocaleTimeString()
    };
    
    this.results.update(current => [newResult, ...current]);
  }

  clearResults(): void {
    this.results.set([]);
  }
}