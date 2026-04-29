// lib/services/super_admin_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/advertisement_model.dart';
import '../models/school_model.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class SuperAdminService {
  final ApiService _apiService;

  SuperAdminService(this._apiService);

  // Schools
  Future<List<SchoolModel>> getSchools({String? search, bool? isActive}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.superAdminSchools,
        queryParameters: {
          if (search != null) 'search': search,
          if (isActive != null) 'isActive': isActive,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => SchoolModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<SchoolModel?> getSchool(String schoolId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.superAdminSchools}/$schoolId',
      );
      if (response.statusCode == 200 && response.data != null) {
        return SchoolModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> createSchool(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.superAdminSchools,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateSchool(String schoolId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.superAdminSchools}/$schoolId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> toggleSchoolStatus(String schoolId, bool isActive) async {
    try {
      final response = await _apiService.dio.patch(
        '${ApiConstants.superAdminSchools}/$schoolId/status',
        data: {'isActive': isActive},
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Users across all schools
  Future<List<UserModel>> getAllUsers({UserRole? role, String? search}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.superAdminUsers,
        queryParameters: {
          if (role != null) 'role': role.value,
          if (search != null) 'search': search,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => UserModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Subscriptions
  Future<List<Map<String, dynamic>>> getSubscriptions() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminSubscriptions);
      if (response.statusCode == 200 && response.data != null) {
        return List<Map<String, dynamic>>.from(response.data['data'] ?? response.data ?? []);
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateSubscription(String schoolId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.superAdminSubscriptions}/$schoolId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Advertisements
  Future<List<AdvertisementModel>> getAdvertisements() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminAdvertisements);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => AdvertisementModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> createAdvertisement(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.superAdminAdvertisements,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateAdvertisement(String adId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.superAdminAdvertisements}/$adId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> deleteAdvertisement(String adId) async {
    try {
      final response = await _apiService.dio.delete(
        '${ApiConstants.superAdminAdvertisements}/$adId',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Analytics
  Future<Map<String, dynamic>> getPlatformAnalytics() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.superAdminAnalytics);
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
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
