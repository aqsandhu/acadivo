// lib/services/offline_queue.dart
import 'dart:async';
import 'dart:math';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

import '../storage/local_storage.dart';
import 'api_service.dart';

enum OfflineActionType {
  markAttendance,
  submitHomework,
  sendMessage,
  updateProfile,
  collectFee,
  uploadMarks,
  createAnnouncement,
  other,
}

class OfflineQueueService {
  final ApiService _apiService;
  final Logger _logger = Logger();
  Timer? _syncTimer;
  bool _isSyncing = false;
  int _retryAttempts = 0;
  static const int _maxRetryAttempts = 5;
  static const Duration _syncInterval = Duration(seconds: 30);
  static const Duration _baseRetryDelay = Duration(seconds: 2);

  OfflineQueueService(this._apiService);

  void startMonitoring() {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(_syncInterval, (_) => _checkAndSync());
    _checkAndSync(); // Initial check
  }

  void stopMonitoring() {
    _syncTimer?.cancel();
    _syncTimer = null;
  }

  Future<void> _checkAndSync() async {
    if (_isSyncing) return;

    final results = await Connectivity().checkConnectivity();
    final isOnline = results != ConnectivityResult.none;

    if (!isOnline) return;

    final queue = LocalStorage.getQueue();
    if (queue.isEmpty) return;

    await syncQueue();
  }

  /// Add an action to the offline queue
  Future<void> queueAction({
    required OfflineActionType type,
    required String endpoint,
    required String method,
    Map<String, dynamic>? data,
    Map<String, dynamic>? queryParams,
  }) async {
    final action = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'type': type.name,
      'endpoint': endpoint,
      'method': method.toUpperCase(),
      'data': data ?? {},
      'queryParams': queryParams ?? {},
      'timestamp': DateTime.now().toIso8601String(),
      'attempts': 0,
      'status': 'pending',
    };

    await LocalStorage.addToQueue(action);
    _logger.i('Action queued: ${type.name} -> $endpoint');
  }

  /// Sync all queued actions
  Future<void> syncQueue() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      final queue = LocalStorage.getQueue();
      if (queue.isEmpty) {
        _isSyncing = false;
        return;
      }

      _logger.i('Syncing ${queue.length} offline actions');
      final failed = <Map<String, dynamic>>[];

      for (final action in queue) {
        final success = await _executeAction(action);
        if (!success) {
          final attempts = (action['attempts'] as int? ?? 0) + 1;
          if (attempts < _maxRetryAttempts) {
            failed.add({
              ...action,
              'attempts': attempts,
              'lastAttempt': DateTime.now().toIso8601String(),
            });
          } else {
            _logger.w('Action failed after $_maxRetryAttempts attempts: ${action['type']}');
          }
        }
      }

      // Clear old queue and save failed items
      await LocalStorage.clearQueue();
      for (final action in failed) {
        await LocalStorage.addToQueue(action);
      }

      if (failed.isNotEmpty) {
        // Exponential backoff
        final delay = _calculateBackoffDelay();
        _logger.i('Retrying failed actions in ${delay.inSeconds}s');
        _syncTimer?.cancel();
        _syncTimer = Timer(delay, () {
          startMonitoring();
        });
      }
    } catch (e) {
      _logger.e('Sync error: $e');
    } finally {
      _isSyncing = false;
    }
  }

  Future<bool> _executeAction(Map<String, dynamic> action) async {
    try {
      final endpoint = action['endpoint'] as String;
      final method = action['method'] as String;
      final data = action['data'] as Map<String, dynamic>?;
      final queryParams = action['queryParams'] as Map<String, dynamic>?;

      late final response;

      switch (method) {
        case 'GET':
          response = await _apiService.dio.get(
            endpoint,
            queryParameters: queryParams,
          );
          break;
        case 'POST':
          response = await _apiService.dio.post(
            endpoint,
            data: data,
            queryParameters: queryParams,
          );
          break;
        case 'PUT':
          response = await _apiService.dio.put(
            endpoint,
            data: data,
            queryParameters: queryParams,
          );
          break;
        case 'PATCH':
          response = await _apiService.dio.patch(
            endpoint,
            data: data,
            queryParameters: queryParams,
          );
          break;
        case 'DELETE':
          response = await _apiService.dio.delete(
            endpoint,
            data: data,
            queryParameters: queryParams,
          );
          break;
        default:
          return false;
      }

      return response.statusCode != null &&
          response.statusCode! >= 200 &&
          response.statusCode! < 300;
    } catch (e) {
      _logger.w('Action execution failed: $e');
      return false;
    }
  }

  Duration _calculateBackoffDelay() {
    final delay = _baseRetryDelay.inSeconds * pow(2, _retryAttempts).toInt();
    _retryAttempts = min(_retryAttempts + 1, _maxRetryAttempts);
    return Duration(seconds: min(delay, 300)); // Max 5 minutes
  }

  /// Get queue count
  int getQueueCount() {
    return LocalStorage.getQueue().length;
  }

  /// Clear all queued actions
  Future<void> clearQueue() async {
    await LocalStorage.clearQueue();
    _logger.i('Offline queue cleared');
  }

  void dispose() {
    stopMonitoring();
  }
}
