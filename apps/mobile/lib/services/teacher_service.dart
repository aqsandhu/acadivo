// lib/services/teacher_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/attendance_model.dart';
import '../models/homework_model.dart';
import '../models/mark_model.dart';
import '../models/student_model.dart';
import '../models/timetable_entry_model.dart';
import 'api_service.dart';

class TeacherService {
  final ApiService _apiService;

  TeacherService(this._apiService);

  // Classes
  Future<List<Map<String, dynamic>>> getMyClasses() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.teacherClasses);
      if (response.statusCode == 200 && response.data != null) {
        return List<Map<String, dynamic>>.from(response.data['data'] ?? response.data ?? []);
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Subjects
  Future<List<Map<String, dynamic>>> getMySubjects() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.teacherSubjects);
      if (response.statusCode == 200 && response.data != null) {
        return List<Map<String, dynamic>>.from(response.data['data'] ?? response.data ?? []);
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Students in class
  Future<List<StudentModel>> getClassStudents(String classId, {String? sectionId}) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.students}/class/$classId',
        queryParameters: sectionId != null ? {'sectionId': sectionId} : null,
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

  // Attendance
  Future<List<AttendanceModel>> getAttendance({
    required String classId,
    String? sectionId,
    required DateTime date,
    String? subjectId,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.teacherAttendance,
        queryParameters: {
          'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
          'date': date.toIso8601String(),
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

  Future<bool> markAttendance(List<Map<String, dynamic>> attendanceRecords) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.teacherAttendance,
        data: {'attendance': attendanceRecords},
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Homework
  Future<List<HomeworkModel>> getHomework({
    String? classId,
    String? sectionId,
    String? subjectId,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.teacherHomework,
        queryParameters: {
          if (classId != null) 'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
          if (subjectId != null) 'subjectId': subjectId,
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

  Future<bool> createHomework(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.teacherHomework,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateHomework(String homeworkId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.teacherHomework}/$homeworkId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> deleteHomework(String homeworkId) async {
    try {
      final response = await _apiService.dio.delete(
        '${ApiConstants.teacherHomework}/$homeworkId',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Marks
  Future<List<MarkModel>> getMarks({
    required String classId,
    String? sectionId,
    required String examType,
    String? subjectId,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.teacherMarks,
        queryParameters: {
          'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
          'examType': examType,
          if (subjectId != null) 'subjectId': subjectId,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => MarkModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> uploadMarks(List<Map<String, dynamic>> marksData) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.teacherMarks,
        data: {'marks': marksData},
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Timetable
  Future<List<TimetableEntryModel>> getTimetable() async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.students}/timetable/teacher',
      );
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
