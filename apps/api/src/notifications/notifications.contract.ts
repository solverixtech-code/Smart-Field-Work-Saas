export enum DevicePlatform {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationCategory {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  LEAD_UPDATE = 'LEAD_UPDATE',
  TARGET_ALERT = 'TARGET_ALERT',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
}

export enum NotificationPriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum AudienceType {
  ALL_EXECUTIVES = 'ALL_EXECUTIVES',
  BY_ROLE = 'BY_ROLE',
  BY_TERRITORY = 'BY_TERRITORY',
  SPECIFIC_EXECUTIVES = 'SPECIFIC_EXECUTIVES',
}
