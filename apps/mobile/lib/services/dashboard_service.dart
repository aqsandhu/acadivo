// lib/services/dashboard_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/dashboard_stats_model.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class DashboardService {
  final ApiService _apiService;

  DashboardService(this._apiService);

  Future<DashboardStatsModel?> getDashboardStats(UserRole role) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.dashboard,
        queryParameters: {'role': role.value},
      );

      if (response.statusCode == 200 && response.data != null) {
        return DashboardStatsModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to load dashboard: ${e.toString()}');
    }
  }

  Future<DashboardStatsModel?> getTeacherDashboard() async {
    return getDashboardStats(UserRole.teacher);
  }

  Future<DashboardStatsModel?> getStudentDashboard() async {
    return getDashboardStats(UserRole.student);
  }

  Future<DashboardStatsModel?> getParentDashboard() async {
    return getDashboardStats(UserRole.parent);
  }

  Future<DashboardStatsModel?> getAdminDashboard() async {
    return getDashboardStats(UserRole.schoolAdmin);
  }

  Future<DashboardStatsModel?> getPrincipalDashboard() async {
    return getDashboardStats(UserRole.principal);
  }

  Future<DashboardStatsModel?> getSuperAdminDashboard() async {
    return getDashboardStats(UserRole.superAdmin);
  }

  Exception _handleDioError(DioException e) {
    final message = e.response?.data?['message']?.toString() ??
        e.message ??
        'Failed to load dashboard';
    return Exception(message);
  }
}
