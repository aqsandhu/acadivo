// lib/services/api_service.dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../constants/api_constants.dart';
import '../constants/app_constants.dart';
import '../storage/preferences.dart';
import 'offline_queue.dart';

class ApiService {
  late final Dio _dio;
  final Logger _logger = Logger();
  final Preferences _preferences;

  ApiService({Preferences? preferences})
      : _preferences = preferences ?? Preferences.instance;

  Dio get dio => _dio;

  void init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: AppConstants.connectTimeout,
        receiveTimeout: AppConstants.receiveTimeout,
        sendTimeout: AppConstants.sendTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Request interceptor - add auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _preferences.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          
          // Add tenant/school ID if available
          final schoolId = await _preferences.getSchoolId();
          if (schoolId != null && schoolId.isNotEmpty) {
            options.headers['X-School-Id'] = schoolId;
          }

          if (kDebugMode) {
            _logger.i(
              'REQUEST: ${options.method} ${options.path}\n'
              'Headers: ${options.headers}\n'
              'Data: ${options.data}',
            );
          }
          
          return handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            _logger.i(
              'RESPONSE: ${response.statusCode} ${response.requestOptions.path}\n'
              'Data: ${response.data}',
            );
          }
          return handler.next(response);
        },
        onError: (error, handler) async {
          if (kDebugMode) {
            _logger.e(
              'ERROR: ${error.response?.statusCode} ${error.requestOptions.path}\n'
              'Message: ${error.message}\n'
              'Data: ${error.response?.data}',
            );
          }

          // Handle 401 - Unauthorized (token expired)
          if (error.response?.statusCode == 401) {
            final refreshed = await _handleTokenRefresh();
            if (refreshed) {
              // Retry the original request with new token
              final token = await _preferences.getToken();
              final opts = error.requestOptions;
              opts.headers['Authorization'] = 'Bearer $token';
              final response = await _dio.fetch(opts);
              return handler.resolve(response);
            } else {
              // Token refresh failed - logout user
              await _handleAuthFailure();
            }
          }

          // Handle 403 - Forbidden
          if (error.response?.statusCode == 403) {
            _logger.w('Access forbidden');
          }

          // Handle 500+ - Server errors
          if (error.response != null && error.response!.statusCode! >= 500) {
            _logger.e('Server error: ${error.response?.statusCode}');
          }

          // Handle network errors - queue for offline if it's a mutating request
          if (error.type == DioExceptionType.connectionError ||
              error.type == DioExceptionType.connectionTimeout ||
              error.type == DioExceptionType.sendTimeout ||
              error.type == DioExceptionType.receiveTimeout) {
            final method = error.requestOptions.method;
            if (method != 'GET') {
              try {
                final connectivity = await Connectivity().checkConnectivity();
                if (connectivity == ConnectivityResult.none) {
                  _logger.w('Device offline. Queueing ${method} ${error.requestOptions.path}');
                  final offlineQueue = OfflineQueueService(this);
                  await offlineQueue.queueAction(
                    type: OfflineActionType.other,
                    endpoint: error.requestOptions.path,
                    method: method,
                    data: error.requestOptions.data is Map<String, dynamic> 
                        ? error.requestOptions.data as Map<String, dynamic> 
                        : null,
                    queryParams: error.requestOptions.queryParameters,
                  );
                  return handler.reject(
                    DioException(
                      requestOptions: error.requestOptions,
                      error: 'Request queued for offline sync',
                      type: DioExceptionType.connectionError,
                    ),
                  );
                }
              } catch (_) {
                // If connectivity check fails, just proceed with normal error handling
              }
            }
          }

          return handler.next(error);
        },
      ),
    );

    // Logging interceptor for debug
    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => _logger.d(obj),
        ),
      );
    }
  }

  Future<bool> _handleTokenRefresh() async {
    try {
      final refreshToken = await _preferences.getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) return false;

      final response = await _dio.post(
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

        if (newToken != null) {
          await _preferences.setToken(newToken);
          if (newRefreshToken != null) {
            await _preferences.setRefreshToken(newRefreshToken);
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      _logger.e('Token refresh failed: $e');
      return false;
    }
  }

  Future<void> _handleAuthFailure() async {
    await _preferences.clearAuth();
    // Auth state will be handled by auth provider
  }

  // Generic GET
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Generic POST
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Generic PUT
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Generic PATCH
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Generic DELETE
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}

// Provider for ApiService
class ApiServiceProvider {
  static ApiService? _instance;

  static ApiService get instance {
    _instance ??= ApiService()..init();
    return _instance!;
  }

  static void reset() {
    _instance = null;
  }
}
