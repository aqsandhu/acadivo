// lib/services/super_admin_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/school_model.dart';
import 'api_service.dart';

class SuperAdminService {
  final ApiService _apiService;

  SuperAdminService(this._apiService);

  // Analytics
  Future<Map<String, dynamic>> getAnalytics() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminAnalytics);
      if (response.statusCode == 200 && response.data != null) {
        return response.data is Map<String, dynamic>
            ? response.data as Map<String, dynamic>
            : {'data': response.data};
      }
      return {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Schools
  Future<List<Map<String, dynamic>>> getSchools() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminSchools);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> createSchool(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(ApiConstants.superAdminSchools, data: data);
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateSchool(String schoolId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put('${ApiConstants.superAdminSchools}/$schoolId', data: data);
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Users
  Future<List<Map<String, dynamic>>> getUsers({String? role}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.superAdminUsers,
        queryParameters: role != null ? {'role': role} : null,
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Subscriptions / Plans
  Future<List<Map<String, dynamic>>> getSubscriptions() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminSubscriptions);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Advertisements
  Future<List<Map<String, dynamic>>> getAdvertisements() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminAdvertisements);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => e is Map<String, dynamic> ? e : <String, dynamic>{}).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException e) {
    final message = e.response?.data?['message']?.toString() ??
        e.message ??
        'An error occurred';
    return Exception(message);
  }
}
