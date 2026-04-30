// lib/storage/preferences.dart
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../constants/storage_keys.dart';
import 'secure_storage.dart';

class Preferences {
  static Preferences? _instance;
  late final SharedPreferences _prefs;
  final SecureStorage _secureStorage = SecureStorage();

  Preferences._(this._prefs);

  static Preferences get instance {
    if (_instance == null) {
      throw Exception('Preferences not initialized. Call init() first.');
    }
    return _instance!;
  }

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _instance = Preferences._(prefs);
  }

  // Token — NOW STORED IN SECURE STORAGE
  Future<void> setToken(String token) async {
    await _secureStorage.setToken(token);
  }

  Future<String?> getToken() async {
    // Migrate from old SharedPreferences if exists
    final legacyToken = _prefs.getString(StorageKeys.authToken);
    if (legacyToken != null) {
      await _secureStorage.setToken(legacyToken);
      await _prefs.remove(StorageKeys.authToken);
      return legacyToken;
    }
    return await _secureStorage.getToken();
  }

  // Refresh Token — NOW STORED IN SECURE STORAGE
  Future<void> setRefreshToken(String token) async {
    await _secureStorage.setRefreshToken(token);
  }

  Future<String?> getRefreshToken() async {
    // Migrate from old SharedPreferences if exists
    final legacyToken = _prefs.getString(StorageKeys.refreshToken);
    if (legacyToken != null) {
      await _secureStorage.setRefreshToken(legacyToken);
      await _prefs.remove(StorageKeys.refreshToken);
      return legacyToken;
    }
    return await _secureStorage.getRefreshToken();
  }

  // User Data — NOW STORED IN SECURE STORAGE
  Future<void> setUserData(Map<String, dynamic> data) async {
    await _secureStorage.write(StorageKeys.userData, jsonEncode(data));
  }

  Future<Map<String, dynamic>?> getUserData() async {
    // Migrate from old SharedPreferences if exists
    final legacyData = _prefs.getString(StorageKeys.userData);
    if (legacyData != null) {
      await _secureStorage.write(StorageKeys.userData, legacyData);
      await _prefs.remove(StorageKeys.userData);
      try { return jsonDecode(legacyData) as Map<String, dynamic>; } catch (_) { return null; }
    }
    final data = await _secureStorage.read(StorageKeys.userData);
    if (data == null) return null;
    try { return jsonDecode(data) as Map<String, dynamic>; } catch (_) { return null; }
  }

  // School ID — NOW STORED IN SECURE STORAGE
  Future<void> setSchoolId(String schoolId) async {
    await _secureStorage.write('school_id', schoolId);
  }

  Future<String?> getSchoolId() async {
    final legacyId = _prefs.getString('school_id');
    if (legacyId != null) {
      await _secureStorage.write('school_id', legacyId);
      await _prefs.remove('school_id');
      return legacyId;
    }
    return await _secureStorage.read('school_id');
  }

  // FCM Token — NOW STORED IN SECURE STORAGE
  Future<void> setFcmToken(String token) async {
    await _secureStorage.setFcmToken(token);
  }

  Future<String?> getFcmToken() async {
    final legacyToken = _prefs.getString(StorageKeys.fcmToken);
    if (legacyToken != null) {
      await _secureStorage.setFcmToken(legacyToken);
      await _prefs.remove(StorageKeys.fcmToken);
      return legacyToken;
    }
    return await _secureStorage.getFcmToken();
  }

  // Last Sync — non-sensitive, keep in SharedPreferences
  Future<void> setLastSync(DateTime time) async {
    await _prefs.setInt(StorageKeys.lastSync, time.millisecondsSinceEpoch);
  }

  DateTime? getLastSync() {
    final ms = _prefs.getInt(StorageKeys.lastSync);
    if (ms == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(ms);
  }

  // First Launch — non-sensitive, keep in SharedPreferences
  Future<void> setFirstLaunch(bool value) async {
    await _prefs.setBool(StorageKeys.firstLaunch, value);
  }

  bool getFirstLaunch() {
    return _prefs.getBool(StorageKeys.firstLaunch) ?? true;
  }

  // Onboarding — non-sensitive, keep in SharedPreferences
  Future<void> setOnboardingComplete(bool value) async {
    await _prefs.setBool(StorageKeys.onboardingComplete, value);
  }

  bool getOnboardingComplete() {
    return _prefs.getBool(StorageKeys.onboardingComplete) ?? false;
  }

  // Device ID — non-sensitive, keep in SharedPreferences
  Future<void> setDeviceId(String id) async {
    await _prefs.setString(StorageKeys.deviceId, id);
  }

  String? getDeviceId() {
    return _prefs.getString(StorageKeys.deviceId);
  }

  // Notification Sounds — non-sensitive, keep in SharedPreferences
  Future<void> setNotificationSounds(bool value) async {
    await _prefs.setBool(StorageKeys.notificationSounds, value);
  }

  bool getNotificationSounds() {
    return _prefs.getBool(StorageKeys.notificationSounds) ?? true;
  }

  // Push Notifications — non-sensitive, keep in SharedPreferences
  Future<void> setPushNotifications(bool value) async {
    await _prefs.setBool(StorageKeys.pushNotifications, value);
  }

  bool getPushNotifications() {
    return _prefs.getBool(StorageKeys.pushNotifications) ?? true;
  }

  // Clear Auth Data — clear from BOTH storage layers
  Future<void> clearAuth() async {
    await _secureStorage.clearAuth();
    // Also clear legacy SharedPreferences keys
    await _prefs.remove(StorageKeys.authToken);
    await _prefs.remove(StorageKeys.refreshToken);
    await _prefs.remove(StorageKeys.userData);
    await _prefs.remove('school_id');
    await _prefs.remove(StorageKeys.fcmToken);
  }

  // Clear All
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs.clear();
  }
}
