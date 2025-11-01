interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
  lowStockAlerts: boolean;
  selectedSound?: string;
  transactionNotifications?: boolean; // New setting for transaction notifications
}
