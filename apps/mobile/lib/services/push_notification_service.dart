// lib/services/push_notification_service.dart
import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';

import '../models/notification_model.dart';
import '../storage/preferences.dart';
import 'auth_service.dart';

/// Top-level background message handler
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  _showLocalNotification(message);
}

void _showLocalNotification(RemoteMessage message) {
  final notification = message.notification;
  if (notification == null) return;

  final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  const androidDetails = AndroidNotificationDetails(
    'acadivo_channel',
    'Acadivo Notifications',
    channelDescription: 'Notifications from Acadivo',
    importance: Importance.max,
    priority: Priority.high,
    showWhen: true,
  );
  const iOSDetails = DarwinNotificationDetails();
  const details = NotificationDetails(android: androidDetails, iOS: iOSDetails);

  flutterLocalNotificationsPlugin.show(
    message.hashCode,
    notification.title,
    notification.body,
    details,
    payload: jsonEncode(message.data),
  );
}

class PushNotificationService {
  final Logger _logger = Logger();
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  final Preferences _preferences;
  AuthService? _authService;
  void Function(NotificationModel)? _onNotificationTap;

  PushNotificationService({Preferences? preferences})
      : _preferences = preferences ?? Preferences.instance;

  void setAuthService(AuthService authService) {
    _authService = authService;
  }

  void setOnNotificationTap(void Function(NotificationModel) callback) {
    _onNotificationTap = callback;
  }

  Future<void> initialize() async {
    // Request permissions
    await _requestPermissions();

    // Initialize local notifications
    await _initLocalNotifications();

    // Get and save FCM token
    await _saveFcmToken();

    // Listen for token refresh
    _messaging.onTokenRefresh.listen((token) async {
      await _preferences.setFcmToken(token);
      await _registerTokenWithBackend(token);
    });

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background/terminated messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle notification tap when app is in background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // Handle initial message (app opened from terminated state)
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }

  Future<void> _requestPermissions() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
      announcement: false,
      carPlay: false,
      criticalAlert: false,
    );

    _logger.i('Notification permission status: ${settings.authorizationStatus}');
  }

  Future<void> _initLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/launcher_icon');
    const iOSSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iOSSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (response) {
        if (response.payload != null) {
          try {
            final data = jsonDecode(response.payload!) as Map<String, dynamic>;
            final notification = NotificationModel.fromJson(data);
            _onNotificationTap?.call(notification);
          } catch (e) {
            _logger.e('Failed to parse notification payload: $e');
          }
        }
      },
    );

    // Create notification channel for Android
    const channel = AndroidNotificationChannel(
      'acadivo_channel',
      'Acadivo Notifications',
      description: 'Notifications from Acadivo',
      importance: Importance.max,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  Future<void> _saveFcmToken() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        await _preferences.setFcmToken(token);
        await _registerTokenWithBackend(token);
      }
    } catch (e) {
      _logger.e('Failed to get FCM token: $e');
    }
  }

  Future<void> _registerTokenWithBackend(String token) async {
    if (_authService != null) {
      try {
        await _authService!.registerFcmToken(token);
        _logger.i('FCM token registered with backend');
      } catch (e) {
        _logger.w('Failed to register FCM token: $e');
      }
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    _logger.i('Foreground message received: ${message.notification?.title}');
    _showLocalNotification(message);
  }

  void _handleNotificationTap(RemoteMessage message) {
    _logger.i('Notification tapped: ${message.data}');
    try {
      final notification = NotificationModel.fromJson(message.data);
      _onNotificationTap?.call(notification);
    } catch (e) {
      _logger.e('Failed to handle notification tap: $e');
    }
  }

  Future<void> showLocalNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'acadivo_channel',
      'Acadivo Notifications',
      channelDescription: 'Notifications from Acadivo',
      importance: Importance.max,
      priority: Priority.high,
    );
    const iOSDetails = DarwinNotificationDetails();
    const details = NotificationDetails(android: androidDetails, iOS: iOSDetails);

    await _localNotifications.show(
      id,
      title,
      body,
      details,
      payload: payload,
    );
  }

  Future<void> cancelNotification(int id) async {
    await _localNotifications.cancel(id);
  }

  Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
  }

  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }
}

// Provider
final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService();
});
