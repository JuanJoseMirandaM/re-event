export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  type: NotificationType;
}

export type NotificationType = 'launch' | 'goal' | 'speak';
