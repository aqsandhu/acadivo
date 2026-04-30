// lib/services/parent_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/attendance_model.dart';
import '../models/fee_record_model.dart';
import '../models/homework_model.dart';
import '../models/report_request_model.dart';
import '../models/result_model.dart';
import '../models/student_model.dart';
import 'api_service.dart';

class ParentService {
  final ApiService _apiService;

  ParentService(this._apiService);

  // Children
  Future<List<StudentModel>> getMyChildren() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.parentChildren);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => StudentModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Child details
  Future<StudentModel?> getChildById(String studentId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.parents}/children/$studentId',
      );
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] ?? response.data;
        if (data is Map<String, dynamic>) {
          return StudentModel.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Child attendance
  Future<List<AttendanceModel>> getChildAttendance(
    String studentId, {
    DateTime? from,
    DateTime? to,
  }) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.parents}/children/$studentId/attendance',
        queryParameters: {
          if (from != null) 'from': from.toIso8601String(),
          if (to != null) 'to': to.toIso8601String(),
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

  // Child homework
  Future<List<HomeworkModel>> getChildHomework(String studentId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.parents}/children/$studentId/homework',
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => HomeworkModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Child results
  Future<List<ResultModel>> getChildResults(String studentId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.parents}/children/$studentId/results',
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

  // Fee
  Future<List<FeeRecordModel>> getChildFeeRecords(String studentId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.parentFee}/$studentId',
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

  Future<Map<String, dynamic>> getFeeSummary(String studentId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.parentFee}/$studentId/summary',
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Reports
  Future<List<ReportRequestModel>> getMyReports() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.parentReports);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => ReportRequestModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> requestReport(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.parentReports,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
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
