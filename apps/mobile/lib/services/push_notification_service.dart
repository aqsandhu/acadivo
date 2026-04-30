// lib/services/push_notification_service.dart
import 'dart:async';
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../constants/api_constants.dart';
import '../storage/preferences.dart';
import '../storage/secure_storage.dart';
import '../routing/app_navigator.dart';
import 'api_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  bool _initialized = false;
  String? _currentFcmToken;
  StreamSubscription<String>? _tokenRefreshSubscription;

  String? get currentToken => _currentFcmToken;

  Future<void> initialize() async {
    if (_initialized) return;
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    await _requestPermissions();
    await _initLocalNotifications();
    await _createAndroidChannels();
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
    _tokenRefreshSubscription = _messaging.onTokenRefresh.listen(_onTokenRefresh);
    await _registerInitialToken();
    _schedulePeriodicTokenCheck();
    _initialized = true;
  }

  Future<void> _requestPermissions() async {
    if (Platform.isIOS) {
      await _messaging.requestPermission(alert: true, badge: true, sound: true);
    } else if (Platform.isAndroid) {
      await _messaging.requestPermission(alert: true, badge: true, sound: true);
    }
    await _messaging.setAutoInitEnabled(true);
  }

  Future<void> _initLocalNotifications() async {
    const initSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(requestAlertPermission: true, requestBadgePermission: true, requestSoundPermission: true),
    );
    await _localNotifications.initialize(initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
      onDidReceiveBackgroundNotificationResponse: _onBackgroundNotificationTap,
    );
  }

  Future<void> _createAndroidChannels() async {
    if (!Platform.isAndroid) return;
    final androidPlugin = _localNotifications.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    const channels = [
      AndroidNotificationChannel('high_importance_channel', 'High Importance', importance: Importance.high),
      AndroidNotificationChannel('announcements_channel', 'Announcements', importance: Importance.high),
      AndroidNotificationChannel('homework_channel', 'Homework', importance: Importance.defaultImportance),
      AndroidNotificationChannel('messages_channel', 'Messages', importance: Importance.high),
    ];
    for (final ch in channels) { await androidPlugin?.createNotificationChannel(ch); }
  }

  Future<void> _registerInitialToken() async {
    try {
      _currentFcmToken = await _messaging.getToken();
      if (_currentFcmToken != null && _currentFcmToken!.isNotEmpty) {
        await Preferences.instance.setFcmToken(_currentFcmToken!);
        await SecureStorage().setFcmToken(_currentFcmToken!);
        await _sendTokenToBackend(_currentFcmToken!);
      }
    } catch (e) { debugPrint('[FCM] Initial token error: $e'); }
  }

  Future<void> _onTokenRefresh(String newToken) async {
    if (_currentFcmToken == newToken) return;
    _currentFcmToken = newToken;
    await Preferences.instance.setFcmToken(newToken);
    await SecureStorage().setFcmToken(newToken);
    await _sendTokenToBackend(newToken);
  }

  Future<bool> _sendTokenToBackend(String token) async {
    try {
      final connectivity = await Connectivity().checkConnectivity();
      if (connectivity == ConnectivityResult.none) return false;
      final apiService = ApiServiceProvider.instance;
      // Ensure ApiService is initialized before using
      if (apiService.dio.options.baseUrl.isEmpty) {
        apiService.init();
      }
      final response = await apiService.dio.post(ApiConstants.registerFcmToken,
        data: {'fcmToken': token, 'platform': Platform.isIOS ? 'ios' : 'android'});
      return response.statusCode == 200;
    } catch (e) { 
      debugPrint('[FCM] Token backend registration failed: $e');
      return false; 
    }
  }

  void _schedulePeriodicTokenCheck() {
    Timer.periodic(const Duration(hours: 24), (_) async {
      final currentToken = await _messaging.getToken();
      if (currentToken != null && currentToken != _currentFcmToken) {
        await _onTokenRefresh(currentToken);
      } else if (_currentFcmToken != null) {
        await _sendTokenToBackend(_currentFcmToken!);
      }
    });
  }

  void _handleForegroundMessage(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;
    final data = message.data;
    final String channelId;
    final String channelName;
    final type = data['type'] ?? data['category'];
    switch (type) { case 'announcement': channelId = 'announcements_channel'; channelName = 'Announcements'; break; case 'homework': channelId = 'homework_channel'; channelName = 'Homework'; break; case 'message': channelId = 'messages_channel'; channelName = 'Messages'; break; default: channelId = 'high_importance_channel'; channelName = 'High Importance'; }
    _localNotifications.show(notification.hashCode, notification.title, notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(channelId, channelName, importance: Importance.high, priority: Priority.high,
          icon: message.notification?.android?.smallIcon ?? '@mipmap/ic_launcher'),
        iOS: const DarwinNotificationDetails(presentAlert: true, presentBadge: true, presentSound: true),
      ), payload: data['route'] ?? data['screen'] ?? data['type'] ?? '',
    );
  }

  void _onNotificationTap(NotificationResponse response) {
    if (response.payload != null && response.payload!.isNotEmpty) {
      debugPrint('Notification tapped: ${response.payload}');
      _handleNotificationTapFromPayload(response.payload!);
    }
  }

  void _handleMessageOpenedApp(RemoteMessage message) {
    debugPrint('Message opened app: ${message.messageId}');
    _handleNotificationTap(message);
  }

  void _handleNotificationTap(RemoteMessage message) {
    final type = message.data['type'];
    final id = message.data['id'];
    switch (type) {
      case 'MESSAGE': AppNavigator.goToChat(conversationId: id); break;
      case 'HOMEWORK': AppNavigator.goToHomework(homeworkId: id); break;
      case 'REPORT_READY': AppNavigator.goToReports(); break;
      case 'FEE_DUE': AppNavigator.goToFee(); break;
      case 'ANNOUNCEMENT': AppNavigator.goToAnnouncements(); break;
      default: AppNavigator.goToLogin();
    }
  }

  void _handleNotificationTapFromPayload(String payload) {
    switch (payload) {
      case 'message': AppNavigator.goToChat(conversationId: ''); break;
      case 'homework': AppNavigator.goToHomework(homeworkId: ''); break;
      case 'report': AppNavigator.goToReports(); break;
      case 'fee': AppNavigator.goToFee(); break;
      case 'announcement': AppNavigator.goToAnnouncements(); break;
      default: AppNavigator.goToLogin();
    }
  }

  String? _pendingNotificationPayload;
  String? get pendingNotificationPayload => _pendingNotificationPayload;
  void clearPendingPayload() => _pendingNotificationPayload = null;

  @pragma('vm:entry-point')
  static void _onBackgroundNotificationTap(NotificationResponse response) {
    debugPrint('Background notification tapped: ${response.payload}');
  }

  Future<String?> getToken() async {
    if (_currentFcmToken != null) return _currentFcmToken;
    _currentFcmToken = await _messaging.getToken();
    return _currentFcmToken;
  }

  Future<String?> refreshToken() async {
    await _messaging.deleteToken();
    _currentFcmToken = await _messaging.getToken();
    if (_currentFcmToken != null) await _onTokenRefresh(_currentFcmToken!);
    return _currentFcmToken;
  }

  Future<void> subscribeToTopic(String topic) async => await _messaging.subscribeToTopic(topic);
  Future<void> unsubscribeFromTopic(String topic) async => await _messaging.unsubscribeFromTopic(topic);

  Future<void> showNotification({required int id, required String title, required String body, String? payload}) async {
    await _localNotifications.show(id, title, body,
      NotificationDetails(
        android: AndroidNotificationDetails('high_importance_channel', 'High Importance Notifications',
          importance: Importance.high, priority: Priority.high, icon: '@mipmap/ic_launcher'),
        iOS: const DarwinNotificationDetails(presentAlert: true, presentBadge: true, presentSound: true),
      ), payload: payload ?? '',
    );
  }

  void dispose() { _tokenRefreshSubscription?.cancel(); }
}
