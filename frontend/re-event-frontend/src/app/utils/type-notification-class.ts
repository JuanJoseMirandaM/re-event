import {NotificationType} from '../core/notification.interface';

export const typeNotificationClassMap: Map<NotificationType, string> = new Map<NotificationType, string>([
  ['launch', 're-icon-launch'],
  ['goal', 're-icon-goal'],
  ['speak', 're-icon-speaker']
])
