// lib/services/communication_service.dart
import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../models/announcement_model.dart';
import '../models/message_model.dart';
import '../models/notification_model.dart';
import 'api_service.dart';

class CommunicationService {
  final ApiService _apiService;

  CommunicationService(this._apiService);

  // Messages
  Future<List<ConversationModel>> getConversations() async {
    try {
      final response = await _apiService.dio.get(ApiConstants.conversations);
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => ConversationModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<MessageModel>> getMessages({
    required String conversationId,
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.messages}/$conversationId',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => MessageModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<MessageModel?> sendMessage({
    required String receiverId,
    required String content,
    MessageType type = MessageType.text,
    String? attachmentUrl,
    String? attachmentName,
    String? attachmentSize,
  }) async {
    try {
      final response = await _apiService.dio.post(
        ApiConstants.messages,
        data: {
          'receiverId': receiverId,
          'content': content,
          'type': type.name,
          if (attachmentUrl != null) 'attachmentUrl': attachmentUrl,
          if (attachmentName != null) 'attachmentName': attachmentName,
          if (attachmentSize != null) 'attachmentSize': attachmentSize,
        },
      );
      if (response.statusCode == 201 && response.data != null) {
        return MessageModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> markMessagesRead(String conversationId) async {
    try {
      final response = await _apiService.dio.post(
        '${ApiConstants.messages}/$conversationId/read',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Notifications
  Future<List<NotificationModel>> getNotifications({
    int page = 1,
    int limit = 50,
    bool? unreadOnly,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.notifications,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (unreadOnly != null) 'unreadOnly': unreadOnly,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> markNotificationRead(String notificationId) async {
    try {
      final response = await _apiService.dio.patch(
        '${ApiConstants.notifications}/$notificationId/read',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> markAllNotificationsRead() async {
    try {
      final response = await _apiService.dio.post(
        '${ApiConstants.notifications}/read-all',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> deleteNotification(String notificationId) async {
    try {
      final response = await _apiService.dio.delete(
        '${ApiConstants.notifications}/$notificationId',
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<int> getUnreadCount() async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.notifications}/unread-count',
      );
      if (response.statusCode == 200 && response.data != null) {
        return (response.data['count'] ?? response.data ?? 0) as int;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  // Announcements
  Future<List<AnnouncementModel>> getAnnouncements({
    int page = 1,
    int limit = 20,
    bool? pinnedOnly,
  }) async {
    try {
      final response = await _apiService.dio.get(
        ApiConstants.announcements,
        queryParameters: {
          'page': page,
          'limit': limit,
          if (pinnedOnly != null) 'pinnedOnly': pinnedOnly,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data['data'] ?? response.data ?? [];
        return (list as List).map((e) => AnnouncementModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<AnnouncementModel?> getAnnouncement(String announcementId) async {
    try {
      final response = await _apiService.dio.get(
        '${ApiConstants.announcements}/$announcementId',
      );
      if (response.statusCode == 200 && response.data != null) {
        return AnnouncementModel.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
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
