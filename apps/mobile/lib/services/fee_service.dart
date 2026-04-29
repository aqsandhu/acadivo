// lib/services/fee_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/fee_record_model.dart';
import '../models/fee_structure_model.dart';
import 'api_service.dart';

class FeeService {
  final ApiService _apiService;

  FeeService(this._apiService);

  // Fee Structures
  Future<List<FeeStructureModel>> getFeeStructures({String? classId}) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.feeStructures,
        queryParameters: classId != null ? {'classId': classId} : null,
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => FeeStructureModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<FeeStructureModel?> getFeeStructure(String feeStructureId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.feeStructures}/$feeStructureId',
      );
      if (response.statusCode == 200 && response.data != null) {
        return FeeStructureModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> createFeeStructure(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.feeStructures,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateFeeStructure(String feeStructureId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.feeStructures}/$feeStructureId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Fee Records
  Future<List<FeeRecordModel>> getFeeRecords({
    String? studentId,
    String? classId,
    String? status,
    DateTime? month,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.feeRecords,
        queryParameters: {
          if (studentId != null) 'studentId': studentId,
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

  Future<FeeRecordModel?> getFeeRecord(String feeRecordId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.feeRecords}/$feeRecordId',
      );
      if (response.statusCode == 200 && response.data != null) {
        return FeeRecordModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> collectFee(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.feeCollect,
        data: data,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> updateFeeRecord(String feeRecordId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.put(
        '${ApiConstants.feeRecords}/$feeRecordId',
        data: data,
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Fee summary
  Future<Map<String, dynamic>> getFeeSummary({String? classId, DateTime? month}) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.feeRecords}/summary',
        queryParameters: {
          if (classId != null) 'classId': classId,
          if (month != null) 'month': month.toIso8601String(),
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

  // Generate fee records for a period
  Future<bool> generateFeeRecords(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.dio.post(
        '${ApiConstants.feeRecords}/generate',
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
