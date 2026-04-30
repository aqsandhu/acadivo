// lib/services/admin_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/announcement_model.dart';
import '../models/class_model.dart';
import '../models/section_model.dart';
import '../models/student_model.dart';
import '../models/subject_model.dart';
import '../models/teacher_model.dart';
import '../models/timetable_entry_model.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AdminService {
  final ApiService _apiService;

  AdminService(this._apiService);

  // Users
  Future<List<UserModel>> getUsers({UserRole? role, String? search}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.adminUsers,
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

  Future<bool> createUser(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.adminUsers,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateUser(String userId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.adminUsers}/$userId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> deactivateUser(String userId) async {
    try {
      final response = await _apiService.dio.patch(
        '${ApiConstants.adminUsers}/$userId/deactivate',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Classes
  Future<List<ClassModel>> getClasses() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.adminClasses);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => ClassModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> createClass(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.adminClasses,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Sections
  Future<List<SectionModel>> getSections({String? classId}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.adminSections,
        queryParameters: classId != null ? {'classId': classId} : null,
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => SectionModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Subjects
  Future<List<SubjectModel>> getSubjects({String? classId}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.adminSubjects,
        queryParameters: classId != null ? {'classId': classId} : null,
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => SubjectModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Students
  Future<List<StudentModel>> getStudents({String? classId, String? sectionId}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.students,
        queryParameters: {
          if (classId != null) 'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
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

  // Teachers
  Future<List<TeacherModel>> getTeachers() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.teachers);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => TeacherModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Attendance reports
  Future<Map<String, dynamic>> getAttendanceReport({
    required String classId,
    String? sectionId,
    required DateTime date,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.adminAttendance,
        queryParameters: {
          'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
          'date': date.toIso8601String(),
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Announcements
  Future<List<AnnouncementModel>> getAnnouncements() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.adminAnnouncements);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => AnnouncementModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> createAnnouncement(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.adminAnnouncements,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> deleteAnnouncement(String announcementId) async {
    try {
      final response = await _apiService.dio.delete(
        '${ApiConstants.adminAnnouncements}/$announcementId',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<TimetableEntryModel>> getTimetable(String classId, String sectionId) async {
    try {
      final response = await _apiService.dio.get(
        '/admin/timetable',
        queryParameters: {
          'classId': classId,
          'sectionId': sectionId,
        },
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

  Future<bool> createTimetableEntry(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        '/admin/timetable',
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
