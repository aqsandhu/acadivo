// lib/storage/local_storage.dart
import 'package:hive_flutter/hive_flutter.dart';

import '../constants/storage_keys.dart';

class LocalStorage {
  static final LocalStorage _instance = LocalStorage._internal();
  factory LocalStorage() => _instance;
  LocalStorage._internal();

  static late Box<Map<dynamic, dynamic>> _userBox;
  static late Box<Map<dynamic, dynamic>> _notificationsBox;
  static late Box<Map<dynamic, dynamic>> _messagesBox;
  static late Box<dynamic> _settingsBox;
  static late Box<Map<dynamic, dynamic>> _offlineQueueBox;
  static late Box<Map<dynamic, dynamic>> _dashboardBox;
  static late Box<dynamic> _cacheBox;

  static Future<void> init() async {
    _userBox = await Hive.openBox<Map<dynamic, dynamic>>(StorageKeys.userBox);
    _notificationsBox = await Hive.openBox<Map<dynamic, dynamic>>(StorageKeys.notificationsBox);
    _messagesBox = await Hive.openBox<Map<dynamic, dynamic>>(StorageKeys.messagesBox);
    _settingsBox = await Hive.openBox<dynamic>(StorageKeys.settingsBox);
    _offlineQueueBox = await Hive.openBox<Map<dynamic, dynamic>>(StorageKeys.offlineQueueBox);
    _dashboardBox = await Hive.openBox<Map<dynamic, dynamic>>(StorageKeys.dashboardBox);
    _cacheBox = await Hive.openBox<dynamic>(StorageKeys.cacheBox);
  }

  // User Box
  static Future<void> saveUser(Map<String, dynamic> user) async {
    await _userBox.put('current_user', user);
  }

  static Map<String, dynamic>? getUser() {
    final data = _userBox.get('current_user');
    if (data == null) return null;
    return _convertToStringDynamicMap(data);
  }

  static Future<void> deleteUser() async {
    await _userBox.delete('current_user');
  }

  // Notifications Box
  static Future<void> saveNotifications(List<Map<String, dynamic>> notifications) async {
    await _notificationsBox.put('notifications', {'data': notifications});
  }

  static List<Map<String, dynamic>> getNotifications() {
    final data = _notificationsBox.get('notifications');
    if (data == null) return [];
    final list = data['data'] as List<dynamic>? ?? [];
    return list.map((e) => _convertToStringDynamicMap(e as Map)).toList();
  }

  static Future<void> saveNotification(Map<String, dynamic> notification) async {
    final existing = getNotifications();
    existing.insert(0, notification);
    await saveNotifications(existing);
  }

  // Messages Box
  static Future<void> saveMessages(String conversationId, List<Map<String, dynamic>> messages) async {
    await _messagesBox.put(conversationId, {'messages': messages});
  }

  static List<Map<String, dynamic>> getMessages(String conversationId) {
    final data = _messagesBox.get(conversationId);
    if (data == null) return [];
    final list = data['messages'] as List<dynamic>? ?? [];
    return list.map((e) => _convertToStringDynamicMap(e as Map)).toList();
  }

  // Settings Box
  static Future<void> setSetting(String key, dynamic value) async {
    await _settingsBox.put(key, value);
  }

  static T? getSetting<T>(String key) {
    return _settingsBox.get(key) as T?;
  }

  // Offline Queue Box
  static Future<void> addToQueue(Map<String, dynamic> action) async {
    final key = DateTime.now().millisecondsSinceEpoch.toString();
    await _offlineQueueBox.put(key, action);
  }

  static List<Map<String, dynamic>> getQueue() {
    return _offlineQueueBox.values
        .map((e) => _convertToStringDynamicMap(e))
        .toList();
  }

  static Future<void> removeFromQueue(String key) async {
    await _offlineQueueBox.delete(key);
  }

  static Future<void> clearQueue() async {
    await _offlineQueueBox.clear();
  }

  // Dashboard Box
  static Future<void> saveDashboard(Map<String, dynamic> data) async {
    await _dashboardBox.put('dashboard', data);
  }

  static Map<String, dynamic>? getDashboard() {
    final data = _dashboardBox.get('dashboard');
    if (data == null) return null;
    return _convertToStringDynamicMap(data);
  }

  // Cache Box
  static Future<void> setCache(String key, dynamic value, {Duration? expiry}) async {
    final cacheData = {
      'value': value,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      if (expiry != null) 'expiry': expiry.inMilliseconds,
    };
    await _cacheBox.put(key, cacheData);
  }

  static dynamic getCache(String key) {
    final data = _cacheBox.get(key);
    if (data == null) return null;

    final cacheData = data as Map<dynamic, dynamic>;
    final timestamp = cacheData['timestamp'] as int?;
    final expiry = cacheData['expiry'] as int?;

    if (timestamp != null && expiry != null) {
      final age = DateTime.now().millisecondsSinceEpoch - timestamp;
      if (age > expiry) {
        _cacheBox.delete(key);
        return null;
      }
    }

    return cacheData['value'];
  }

  static Future<void> clearCache() async {
    await _cacheBox.clear();
  }

  // Clear all
  static Future<void> clearAll() async {
    await _userBox.clear();
    await _notificationsBox.clear();
    await _messagesBox.clear();
    await _settingsBox.clear();
    await _offlineQueueBox.clear();
    await _dashboardBox.clear();
    await _cacheBox.clear();
  }

  static Map<String, dynamic> _convertToStringDynamicMap(Map<dynamic, dynamic> map) {
    return Map<String, dynamic>.fromEntries(
      map.entries.map((e) => MapEntry(e.key.toString(), e.value)),
    );
  }
}
