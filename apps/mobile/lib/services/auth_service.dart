// lib/services/auth_service.dart
import 'dart:async';

import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/user_model.dart';
import '../storage/preferences.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService;
  final Preferences _preferences;

  AuthService(this._apiService, {Preferences? preferences})
      : _preferences = preferences ?? Preferences.instance;

  /// Login with uniqueId and password
  Future<AuthResult?> login({
    required String uniqueId,
    required String password,
  }) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.login,
        data: {
          'uniqueId': uniqueId,
          'password': password,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final token = data['token']?.toString();
        final refreshToken = data['refreshToken']?.toString();
        final userData = data['user'] as Map<String, dynamic>?;

        if (token != null && userData != null) {
          final user = UserModel.fromJson(userData);
          await _preferences.setToken(token);
          if (refreshToken != null) {
            await _preferences.setRefreshToken(refreshToken);
          }
          await _preferences.setUserData(userData);
          if (user.schoolId != null) {
            await _preferences.setSchoolId(user.schoolId!);
          }

          return AuthResult(
            token: token,
            refreshToken: refreshToken,
            user: user,
          );
        }
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Login failed: ${e.toString()}');
    }
  }

  /// Refresh access token
  Future<AuthResult?> refreshToken(String refreshToken) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.refreshToken,
        data: {'refreshToken': refreshToken},
        options: Options(
          headers: {'Authorization': 'Bearer $refreshToken'},
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final newToken = data['token']?.toString();
        final newRefreshToken = data['refreshToken']?.toString();
        final userData = data['user'] as Map<String, dynamic>?;

        if (newToken != null) {
          await _preferences.setToken(newToken);
          if (newRefreshToken != null) {
            await _preferences.setRefreshToken(newRefreshToken);
          }
          if (userData != null) {
            await _preferences.setUserData(userData);
          }

          return AuthResult(
            token: newToken,
            refreshToken: newRefreshToken,
            user: userData != null ? UserModel.fromJson(userData) : null,
          );
        }
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Token refresh failed: ${e.toString()}');
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      final token = await _preferences.getToken();
      if (token != null) {
        await _apiService.dio.post(ApiConstants.logout);
      }
    } catch (_) {
      // Ignore API errors on logout
    } finally {
      await _preferences.clearAuth();
    }
  }

  /// Get current user profile
  Future<UserModel?> getMe() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.me);

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final user = UserModel.fromJson(data);
        await _preferences.setUserData(user.toJson());
        if (user.schoolId != null) {
          await _preferences.setSchoolId(user.schoolId!);
        }
        return user;
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to get user: ${e.toString()}');
    }
  }

  /// Request password reset
  Future<bool> forgotPassword(String identifier) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.forgotPassword,
        data: {'identifier': identifier},
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to request reset: ${e.toString()}');
    }
  }

  /// Reset password with token
  Future<bool> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.resetPassword,
        data: {
          'token': token,
          'newPassword': newPassword,
        },
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to reset password: ${e.toString()}');
    }
  }

  /// Verify OTP
  Future<bool> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.verifyOtp,
        data: {
          'phone': phone,
          'otp': otp,
        },
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('OTP verification failed: ${e.toString()}');
    }
  }

  /// Setup parent password
  Future<bool> setupParentPassword({
    required String studentId,
    required String otp,
    required String password,
  }) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.setupParentPassword,
        data: {
          'studentId': studentId,
          'otp': otp,
          'password': password,
        },
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to set password: ${e.toString()}');
    }
  }

  /// Update profile
  Future<UserModel?> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        ApiConstants.updateProfile,
        data: data,
      );

      if (response.statusCode == 200 && response.data != null) {
        final user = UserModel.fromJson(response.data as Map<String, dynamic>);
        await _preferences.setUserData(user.toJson());
        return user;
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Profile update failed: ${e.toString()}');
    }
  }

  /// Change password
  Future<bool> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.changePassword,
        data: {
          'oldPassword': oldPassword,
          'newPassword': newPassword,
        },
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Password change failed: ${e.toString()}');
    }
  }

  /// Register FCM token
  Future<bool> registerFcmToken(String fcmToken) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.registerFcmToken,
        data: {'fcmToken': fcmToken},
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Exception _handleDioError(DioException e) {
    final message = e.response?.data?['message']?.toString() ??
        e.response?.data?['error']?.toString() ??
        e.message ??
        'An error occurred';
    return Exception(message);
  }
}

class AuthResult {
  final String token;
  final String? refreshToken;
  final UserModel? user;

  const AuthResult({
    required this.token,
    this.refreshToken,
    this.user,
  });
}
