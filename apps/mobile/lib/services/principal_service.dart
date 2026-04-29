// lib/services/principal_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/dashboard_stats_model.dart';
import '../models/attendance_model.dart';
import '../models/fee_record_model.dart';
import '../models/result_model.dart';
import '../models/teacher_model.dart';
import '../models/student_model.dart';
import 'api_service.dart';

class PrincipalService {
  final ApiService _apiService;

  PrincipalService(this._apiService);

  // Dashboard
  Future<DashboardStatsModel?> getDashboard() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.principalDashboard);
      if (response.statusCode == 200 && response.data != null) {
        return DashboardStatsModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Teachers
  Future<List<TeacherModel>> getTeachers({String? search, bool? isActive}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.principalTeachers,
        queryParameters: {
          if (search != null) 'search': search,
          if (isActive != null) 'isActive': isActive,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => TeacherModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Students
  Future<List<StudentModel>> getStudents({String? classId, String? search}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.principalStudents,
        queryParameters: {
          if (classId != null) 'classId': classId,
          if (search != null) 'search': search,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => StudentModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Attendance overview
  Future<Map<String, dynamic>> getAttendanceOverview({DateTime? date}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.principalAttendance,
        queryParameters: date != null ? {'date': date.toIso8601String()} : null,
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<AttendanceModel>> getClassAttendance({
    required String classId,
    String? sectionId,
    required DateTime date,
  }) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.principalAttendance}/class',
        queryParameters: {
          'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
          'date': date.toIso8601String(),
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => AttendanceModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Fee overview
  Future<Map<String, dynamic>> getFeeOverview() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.principalFee);
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<FeeRecordModel>> getFeeRecords({
    String? classId,
    String? status,
    DateTime? month,
  }) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.principalFee}/records',
        queryParameters: {
          if (classId != null) 'classId': classId,
          if (status != null) 'status': status,
          if (month != null) 'month': month.toIso8601String(),
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => FeeRecordModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Results overview
  Future<Map<String, dynamic>> getResultsOverview({String? examType}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.principalResults,
        queryParameters: examType != null ? {'examType': examType} : null,
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<ResultModel>> getClassResults({
    required String classId,
    String? sectionId,
    required String examType,
  }) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.principalResults}/class',
        queryParameters: {
          'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
          'examType': examType,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => ResultModel.fromJson(e as Map<String, dynamic>)).toList();
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
