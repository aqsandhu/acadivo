// lib/services/qa_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/qa_model.dart';
import 'api_service.dart';

class QaService {
  final ApiService _apiService;

  QaService(this._apiService);

  /// Get all Q&A entries
  Future<List<QaModel>> getQuestions({String? status, String? category}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.qa,
        queryParameters: {
          if (status != null) 'status': status,
          if (category != null) 'category': category,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => QaModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get Q&A by ID
  Future<QaModel?> getQuestionById(String id) async {
    try {
      final response = await _apiService.dio.get('${ApiConstants.qa}/$id');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] ?? response.data;
        if (data is Map<String, dynamic>) {
          return QaModel.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Ask a new question
  Future<QaModel?> askQuestion({required String question, String? category}) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.qa,
        data: {
          'question': question,
          if (category != null) 'category': category,
        },
      );
      if (response.statusCode == 201 && response.data != null) {
        final data = response.data['data'] ?? response.data;
        if (data is Map<String, dynamic>) {
          return QaModel.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Answer a question (teacher/admin only)
  Future<QaModel?> answerQuestion({required String id, required String answer}) async {
    try {
      final response = await _apiService.dio.patch(
        '${ApiConstants.qa}/$id',
        data: {'answer': answer},
      );
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] ?? response.data;
        if (data is Map<String, dynamic>) {
          return QaModel.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Delete a question
  Future<bool> deleteQuestion(String id) async {
    try {
      final response = await _apiService.dio.delete('${ApiConstants.qa}/$id');
      return response.statusCode == 200 || response.statusCode == 204;
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
