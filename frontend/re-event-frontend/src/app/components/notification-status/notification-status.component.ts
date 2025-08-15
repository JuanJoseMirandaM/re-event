import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationManagerService } from '../../core/services/notification-manager.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { NotificationTester } from '../../utils/notification-test';

@Component({
  selector: 'app-notification-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-status" [class.expanded]="isExpanded()">
      <div class="status-header" (click)="toggleExpanded()">
        <div class="status-indicator" [class]="statusClass()">
          <i class="icon" [class]="statusIcon()"></i>
        </div>
        <span class="status-text">{{ statusText() }}</span>
        <i class="expand-icon" [class.rotated]="isExpanded()">▼</i>
      </div>
      
      @if (isExpanded()) {
        <div class="status-details">
          <div class="detail-item">
            <span class="label">Soporte del navegador:</span>
            <span class="value" [class.success]="notificationInfo().browserSupport">
              {{ notificationInfo().browserSupport ? '✅ Soportado' : '❌ No soportado' }}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="label">Push notifications:</span>
            <span class="value" [class.success]="notificationInfo().pushSupport">
              {{ notificationInfo().pushSupport ? '✅ Soportado' : '❌ No soportado' }}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="label">Permisos:</span>
            <span class="value" [class]="permissionClass()">
              {{ permissionText() }}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="label">Estado:</span>
            <span class="value" [class.success]="notificationInfo().isInitialized">
              {{ notificationInfo().isInitialized ? '✅ Inicializado' : '⚠️ No inicializado' }}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="label">Notificaciones no leídas:</span>
            <span class="value unread-count">{{ unreadCount() }}</span>
          </div>
          
          @if (canRequestPermission()) {
            <button class="permission-button" (click)="requestPermission()">
              Solicitar permisos de notificación
            </button>
          }
          
          @if (notificationInfo().isInitialized) {
            <button class="test-button" (click)="testNotification()">
              Probar notificación del navegador
            </button>
            
            <button class="test-button" (click)="testPushNotification()">
              Probar notificación push
            </button>
            
            <button class="test-button" (click)="runFullTest()">
              Ejecutar prueba completa
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-status {
      background: #f5f5f5;
      border-radius: 8px;
      margin: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .status-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      user-select: none;
    }
    
    .status-header:hover {
      background: #eeeeee;
    }
    
    .status-indicator {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 12px;
    }
    
    .status-indicator.success {
      background: #4caf50;
      color: white;
    }
    
    .status-indicator.warning {
      background: #ff9800;
      color: white;
    }
    
    .status-indicator.error {
      background: #f44336;
      color: white;
    }
    
    .status-text {
      flex: 1;
      font-weight: 500;
    }
    
    .expand-icon {
      transition: transform 0.3s ease;
      font-size: 12px;
    }
    
    .expand-icon.rotated {
      transform: rotate(180deg);
    }
    
    .status-details {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      background: white;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .label {
      font-weight: 500;
      color: #666;
    }
    
    .value {
      font-weight: 400;
    }
    
    .value.success {
      color: #4caf50;
    }
    
    .value.warning {
      color: #ff9800;
    }
    
    .value.error {
      color: #f44336;
    }
    
    .unread-count {
      background: #2196f3;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .permission-button,
    .test-button {
      width: 100%;
      padding: 8px 16px;
      margin-top: 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }
    
    .permission-button {
      background: #2196f3;
      color: white;
    }
    
    .permission-button:hover {
      background: #1976d2;
    }
    
    .test-button {
      background: #4caf50;
      color: white;
    }
    
    .test-button:hover {
      background: #388e3c;
    }
  `]
})
export class NotificationStatusComponent {
  #notificationManager = inject(NotificationManagerService);
  #notificationsService = inject(NotificationsService);

  isExpanded = signal(false);
  
  notificationInfo = computed(() => this.#notificationManager.getNotificationInfo());
  unreadCount = computed(() => this.#notificationsService.unreadCount());

  statusClass = computed(() => {
    const info = this.notificationInfo();
    if (!info.browserSupport) return 'error';
    if (info.permission === 'granted' && info.isInitialized) return 'success';
    if (info.permission === 'default') return 'warning';
    return 'error';
  });

  statusIcon = computed(() => {
    const status = this.statusClass();
    switch (status) {
      case 'success': return '✓';
      case 'warning': return '!';
      case 'error': return '✗';
      default: return '?';
    }
  });

  statusText = computed(() => {
    const info = this.notificationInfo();
    if (!info.browserSupport) return 'Notificaciones no soportadas';
    if (info.permission === 'granted' && info.isInitialized) return 'Notificaciones activas';
    if (info.permission === 'default') return 'Permisos pendientes';
    if (info.permission === 'denied') return 'Permisos denegados';
    return 'Estado desconocido';
  });

  permissionClass = computed(() => {
    const permission = this.notificationInfo().permission;
    switch (permission) {
      case 'granted': return 'success';
      case 'default': return 'warning';
      case 'denied': return 'error';
      default: return '';
    }
  });

  permissionText = computed(() => {
    const permission = this.notificationInfo().permission;
    switch (permission) {
      case 'granted': return '✅ Concedidos';
      case 'default': return '⚠️ No solicitados';
      case 'denied': return '❌ Denegados';
      default: return 'Desconocido';
    }
  });

  canRequestPermission = computed(() => {
    const info = this.notificationInfo();
    return info.browserSupport && info.permission === 'default';
  });

  toggleExpanded() {
    this.isExpanded.update(expanded => !expanded);
  }

  async requestPermission() {
    try {
      await this.#notificationManager.initializeAfterLogin();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  testNotification() {
    NotificationTester.testBrowserNotification();
  }

  async testPushNotification() {
    await NotificationTester.testPushNotification();
  }

  async runFullTest() {
    await NotificationTester.runFullTest();
  }
}