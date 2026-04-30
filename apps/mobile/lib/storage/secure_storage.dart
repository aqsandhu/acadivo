// lib/storage/secure_storage.dart
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static final SecureStorage _instance = SecureStorage._internal();
  factory SecureStorage() => _instance;
  SecureStorage._internal();

  static const _androidOptions = AndroidOptions(
    encryptedSharedPreferences: true,
    keyCipherAlgorithm: KeyCipherAlgorithm.RSA_ECB_PKCS1Padding,
    storageCipherAlgorithm: StorageCipherAlgorithm.AES_GCM_NoPadding,
  );

  static const _iosOptions = IOSOptions(
    accessibility: KeychainAccessibility.first_unlock_this_device,
    accountName: 'flutter_acadivo_secure',
  );

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: _androidOptions,
    iOptions: _iosOptions,
  );

  static const String keyAuthToken = 'auth_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyFcmToken = 'fcm_token';
  static const String keyUserData = 'user_data';
  static const String keySchoolId = 'school_id';

  Future<void> write(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
    } catch (e) {
      debugPrint('[SecureStorage] Write error for key $key: $e');
      throw Exception('Failed to write secure data: $e');
    }
  }

  Future<String?> read(String key) async {
    try {
      return await _storage.read(key: key);
    } catch (e) {
      debugPrint('[SecureStorage] Read error for key $key: $e');
      return null;
    }
  }

  Future<void> delete(String key) async {
    try { await _storage.delete(key: key); } catch (e) {}
  }

  Future<void> deleteAll() async {
    try { await _storage.deleteAll(); } catch (e) {}
  }

  Future<void> setToken(String token) async => await write(keyAuthToken, token);
  Future<String?> getToken() async => await read(keyAuthToken);
  Future<void> setRefreshToken(String token) async => await write(keyRefreshToken, token);
  Future<String?> getRefreshToken() async => await read(keyRefreshToken);
  Future<void> setFcmToken(String token) async => await write(keyFcmToken, token);
  Future<String?> getFcmToken() async => await read(keyFcmToken);

  Future<void> clearAuth() async {
    await delete(keyAuthToken);
    await delete(keyRefreshToken);
    await delete(keyUserData);
    await delete(keySchoolId);
  }
}
