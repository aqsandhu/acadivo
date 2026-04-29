// lib/storage/preferences.dart
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../constants/storage_keys.dart';

class Preferences {
  static Preferences? _instance;
  late final SharedPreferences _prefs;

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

  // Token
  Future<void> setToken(String token) async {
    await _prefs.setString(StorageKeys.authToken, token);
  }

  String? getToken() {
    return _prefs.getString(StorageKeys.authToken);
  }

  // Refresh Token
  Future<void> setRefreshToken(String token) async {
    await _prefs.setString(StorageKeys.refreshToken, token);
  }

  String? getRefreshToken() {
    return _prefs.getString(StorageKeys.refreshToken);
  }

  // User Data
  Future<void> setUserData(Map<String, dynamic> data) async {
    await _prefs.setString(StorageKeys.userData, jsonEncode(data));
  }

  Map<String, dynamic>? getUserData() {
    final data = _prefs.getString(StorageKeys.userData);
    if (data == null) return null;
    try {
      return jsonDecode(data) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  // School ID
  Future<void> setSchoolId(String schoolId) async {
    await _prefs.setString('school_id', schoolId);
  }

  String? getSchoolId() {
    return _prefs.getString('school_id');
  }

  // FCM Token
  Future<void> setFcmToken(String token) async {
    await _prefs.setString(StorageKeys.fcmToken, token);
  }

  String? getFcmToken() {
    return _prefs.getString(StorageKeys.fcmToken);
  }

  // Last Sync
  Future<void> setLastSync(DateTime time) async {
    await _prefs.setInt(StorageKeys.lastSync, time.millisecondsSinceEpoch);
  }

  DateTime? getLastSync() {
    final ms = _prefs.getInt(StorageKeys.lastSync);
    if (ms == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(ms);
  }

  // First Launch
  Future<void> setFirstLaunch(bool value) async {
    await _prefs.setBool(StorageKeys.firstLaunch, value);
  }

  bool getFirstLaunch() {
    return _prefs.getBool(StorageKeys.firstLaunch) ?? true;
  }

  // Onboarding
  Future<void> setOnboardingComplete(bool value) async {
    await _prefs.setBool(StorageKeys.onboardingComplete, value);
  }

  bool getOnboardingComplete() {
    return _prefs.getBool(StorageKeys.onboardingComplete) ?? false;
  }

  // Device ID
  Future<void> setDeviceId(String id) async {
    await _prefs.setString(StorageKeys.deviceId, id);
  }

  String? getDeviceId() {
    return _prefs.getString(StorageKeys.deviceId);
  }

  // Clear Auth Data
  Future<void> clearAuth() async {
    await _prefs.remove(StorageKeys.authToken);
    await _prefs.remove(StorageKeys.refreshToken);
    await _prefs.remove(StorageKeys.userData);
    await _prefs.remove('school_id');
  }

  // Clear All
  Future<void> clearAll() async {
    await _prefs.clear();
  }
}
