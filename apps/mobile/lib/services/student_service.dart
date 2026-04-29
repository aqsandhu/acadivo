// lib/services/student_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/attendance_model.dart';
import '../models/homework_model.dart';
import '../models/homework_submission_model.dart';
import '../models/result_model.dart';
import '../models/timetable_entry_model.dart';
import 'api_service.dart';

class StudentService {
  final ApiService _apiService;

  StudentService(this._apiService);

  // Attendance
  Future<List<AttendanceModel>> getMyAttendance({
    DateTime? from,
    DateTime? to,
    String? subjectId,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.studentAttendance,
        queryParameters: {
          if (from != null) 'from': from.toIso8601String(),
          if (to != null) 'to': to.toIso8601String(),
          if (subjectId != null) 'subjectId': subjectId,
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

  Future<Map<String, dynamic>> getAttendanceSummary({DateTime? month}) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.studentAttendance}/summary',
        queryParameters: month != null ? {'month': month.toIso8601String()} : null,
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Homework
  Future<List<HomeworkModel>> getMyHomework({
    String? subjectId,
    String? status,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.studentHomework,
        queryParameters: {
          if (subjectId != null) 'subjectId': subjectId,
          if (status != null) 'status': status,
        },
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

  Future<HomeworkSubmissionModel?> getSubmission(String homeworkId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.studentHomework}/$homeworkId/submission',
      );
      if (response.statusCode == 200 && response.data != null) {
        return HomeworkSubmissionModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> submitHomework(String homeworkId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        '${ApiConstants.studentHomework}/$homeworkId/submit',
        data: data,
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Results
  Future<List<ResultModel>> getMyResults({String? examType}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.studentResults,
        queryParameters: examType != null ? {'examType': examType} : null,
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

  // Timetable
  Future<List<TimetableEntryModel>> getMyTimetable() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.studentTimetable);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => TimetableEntryModel.fromJson(e as Map<String, dynamic>)).toList();
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
