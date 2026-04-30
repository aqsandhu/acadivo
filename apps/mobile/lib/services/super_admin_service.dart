// lib/services/super_admin_service.dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import 'api_service.dart';

class SuperAdminService {
  final ApiService _apiService;
  SuperAdminService(this._apiService);

  Future<Map<String, dynamic>> getAnalytics() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminAnalytics);
      if (response.statusCode == 200 && response.data != null) {
        return response.data is Map<String, dynamic> ? response.data as Map<String, dynamic> : {'data': response.data};
      }
      throw Exception('Invalid response: ${response.statusCode}');
    } on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<List<Map<String, dynamic>>> getSchools() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminSchools);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      throw Exception('Invalid response: ${response.statusCode}');
    } on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<bool> createSchool(Map<String, dynamic> data) async {
    try { final response = await _apiService.dio.post(ApiConstants.superAdminSchools, data: data);
      return response.statusCode == 201 || response.statusCode == 200; }
    on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<bool> updateSchool(String schoolId, Map<String, dynamic> data) async {
    try { final response = await _apiService.dio.put('${ApiConstants.superAdminSchools}/$schoolId', data: data);
      return response.statusCode == 200; }
    on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<bool> deleteSchool(String schoolId) async {
    try { final response = await _apiService.dio.delete('${ApiConstants.superAdminSchools}/$schoolId');
      return response.statusCode == 200 || response.statusCode == 204; }
    on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<List<Map<String, dynamic>>> getUsers({String? role}) async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminUsers, queryParameters: role != null ? {'role': role} : null);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      throw Exception('Invalid response: ${response.statusCode}');
    } on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<List<Map<String, dynamic>>> getSubscriptions() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminSubscriptions);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      throw Exception('Invalid response: ${response.statusCode}');
    } on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<bool> updateSubscription(String id, Map<String, dynamic> data) async {
    try { final response = await _apiService.dio.put('${ApiConstants.superAdminSubscriptions}/$id', data: data);
      return response.statusCode == 200; }
    on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<List<Map<String, dynamic>>> getAdvertisements() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminAdvertisements);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      throw Exception('Invalid response: ${response.statusCode}');
    } on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<bool> createAdvertisement(Map<String, dynamic> data) async {
    try { final response = await _apiService.dio.post(ApiConstants.superAdminAdvertisements, data: data);
      return response.statusCode == 201 || response.statusCode == 200; }
    on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<bool> updateAdvertisement(String id, Map<String, dynamic> data) async {
    try { final response = await _apiService.dio.put('${ApiConstants.superAdminAdvertisements}/$id', data: data);
      return response.statusCode == 200; }
    on DioException catch (e) { throw _handleDioError(e); }
  }

  Future<bool> deleteAdvertisement(String id) async {
    try { final response = await _apiService.dio.delete('${ApiConstants.superAdminAdvertisements}/$id');
      return response.statusCode == 200 || response.statusCode == 204; }
    on DioException catch (e) { throw _handleDioError(e); }
  }

  Exception _handleDioError(DioException e) {
    final message = e.response?.data?['message']?.toString() ?? e.response?.data?['error']?.toString() ?? e.message ?? 'An error occurred';
    if (kDebugMode) debugPrint('[SuperAdminService] Error: $message (${e.response?.statusCode})');
    switch (e.response?.statusCode) {
      case 401: return Exception('Authentication required. Please log in again.');
      case 403: return Exception('Access denied. Super admin privileges required.');
      case 404: return Exception('Resource not found.');
      case 429: return Exception('Too many requests. Please try again later.');
      case 500: case 502: case 503: return Exception('Server error. Please try again later.');
      default: return Exception(message);
    }
  }
}
