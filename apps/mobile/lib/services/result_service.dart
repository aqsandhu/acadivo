// lib/services/result_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/mark_model.dart';
import '../models/result_model.dart';
import 'api_service.dart';

class ResultService {
  final ApiService _apiService;

  ResultService(this._apiService);

  // Exam Types
  Future<List<Map<String, dynamic>>> getExamTypes() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.examTypes);
      if (response.statusCode == 200 && response.data != null) {
        return List<Map<String, dynamic>>.from(response.data['data'] ?? response.data ?? []);
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Results
  Future<List<ResultModel>> getResults({
    String? studentId,
    String? classId,
    String? examType,
    bool? published,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.results,
        queryParameters: {
          if (studentId != null) 'studentId': studentId,
          if (classId != null) 'classId': classId,
          if (examType != null) 'examType': examType,
          if (published != null) 'published': published,
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

  Future<ResultModel?> getResult(String resultId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.results}/$resultId',
      );
      if (response.statusCode == 200 && response.data != null) {
        return ResultModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> createResult(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.results,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateResult(String resultId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.results}/$resultId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> publishResult(String resultId) async {
    try {
      final response = await _apiService.dio.patch(
        '${ApiConstants.results}/$resultId/publish',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> unpublishResult(String resultId) async {
    try {
      final response = await _apiService.dio.patch(
        '${ApiConstants.results}/$resultId/unpublish',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Marks
  Future<List<MarkModel>> getMarks({
    String? studentId,
    String? classId,
    String? subjectId,
    String? examType,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.marks,
        queryParameters: {
          if (studentId != null) 'studentId': studentId,
          if (classId != null) 'classId': classId,
          if (subjectId != null) 'subjectId': subjectId,
          if (examType != null) 'examType': examType,
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

  Future<bool> bulkUploadMarks(List<Map<String, dynamic>> marksData) async {
    try {
      final response = await _apiService.dio.post(
        '${ApiConstants.marks}/bulk',
        data: {'marks': marksData},
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateMark(String markId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.marks}/$markId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> deleteMark(String markId) async {
    try {
      final response = await _apiService.dio.delete(
        '${ApiConstants.marks}/$markId',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Class result summary
  Future<Map<String, dynamic>> getClassResultSummary({
    required String classId,
    String? sectionId,
    required String examType,
  }) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.results}/class-summary',
        queryParameters: {
          'classId': classId,
          if (sectionId != null) 'sectionId': sectionId,
          'examType': examType,
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

  Exception _handleDioError(DioException e) {
    final message = e.response?.data?['message']?.toString() ??
        e.message ??
        'An error occurred';
    return Exception(message);
  }
}
