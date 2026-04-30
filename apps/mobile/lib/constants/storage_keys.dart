// lib/constants/storage_keys.dart
class StorageKeys {
  StorageKeys._();

  // SharedPreferences keys
  static const String authToken = 'auth_token';
  static const String refreshToken = 'refresh_token';
  static const String userData = 'user_data';
  static const String themeMode = 'theme_mode';
  static const String locale = 'locale';
  static const String fcmToken = 'fcm_token';
  static const String lastSync = 'last_sync';
  static const String firstLaunch = 'first_launch';
  static const String onboardingComplete = 'onboarding_complete';
  static const String deviceId = 'device_id';

  static const String notificationSounds = 'notification_sounds';
  static const String pushNotifications = 'push_notifications';

  // Hive box names
  static const String userBox = 'user_box';
  static const String notificationsBox = 'notifications_box';
  static const String messagesBox = 'messages_box';
  static const String settingsBox = 'settings_box';
  static const String offlineQueueBox = 'offline_queue_box';
  static const String dashboardBox = 'dashboard_box';
  static const String cacheBox = 'cache_box';
}
