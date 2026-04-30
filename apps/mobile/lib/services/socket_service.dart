// lib/services/socket_service.dart
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

import '../models/message_model.dart';
import '../models/notification_model.dart';
import '../providers/message_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/socket_provider.dart';
import 'push_notification_service.dart';

class SocketService {
  final SocketNotifier _socketNotifier;
  final MessagesNotifier _messagesNotifier;
  final NotificationsNotifier _notificationsNotifier;
  final PushNotificationService _pushNotificationService;
  final Logger _logger = Logger();

  SocketService({
    required SocketNotifier socketNotifier,
    required MessagesNotifier messagesNotifier,
    required NotificationsNotifier notificationsNotifier,
    required PushNotificationService pushNotificationService,
  })  : _socketNotifier = socketNotifier,
        _messagesNotifier = messagesNotifier,
        _notificationsNotifier = notificationsNotifier,
        _pushNotificationService = pushNotificationService;

  Future<void> connect() async {
    await _socketNotifier.connect();

    _socketNotifier.on('message:receive', (data) {
      _handleMessageReceive(data);
    });

    _socketNotifier.on('notification:receive', (data) {
      _handleNotificationReceive(data);
    });

    _socketNotifier.on('presence:update', (data) {
      _handlePresenceUpdate(data);
    });

    _socketNotifier.on('connect', (_) {
      _logger.i('Socket connected');
    });

    _socketNotifier.on('disconnect', (_) {
      _logger.i('Socket disconnected');
    });
  }

  void disconnect() {
    _socketNotifier.disconnect();
  }

  void joinUserRoom(String userId) {
    _socketNotifier.joinRoom('user:$userId');
  }

  void leaveUserRoom(String userId) {
    _socketNotifier.leaveRoom('user:$userId');
  }

  // Send private message
  void sendMessage({
    required String receiverId,
    required String content,
    String? conversationId,
    MessageType type = MessageType.text,
    String? attachmentUrl,
  }) {
    _socketNotifier.emit('message:private', {
      'receiverId': receiverId,
      'content': content,
      'conversationId': conversationId,
      'type': type.name,
      if (attachmentUrl != null) 'attachmentUrl': attachmentUrl,
    });
  }

  // Send typing indicator
  void sendTyping(String receiverId) {
    _socketNotifier.emit('message:typing', {
      'receiverId': receiverId,
    });
  }

  // Mark message as read
  void markMessageRead(String messageId, String senderId) {
    _socketNotifier.emit('message:read', {
      'messageId': messageId,
      'senderId': senderId,
    });
  }

  // Handle incoming message
  void _handleMessageReceive(dynamic data) {
    try {
      final Map<String, dynamic> parsedData =
          data is Map<String, dynamic> ? data : jsonDecode(data.toString());
      final message = MessageModel.fromJson(parsedData);
      _messagesNotifier.receiveMessage(message);
    } catch (e) {
      _logger.e('Failed to handle received message: $e');
    }
  }

  // Handle incoming notification
  void _handleNotificationReceive(dynamic data) {
    try {
      final Map<String, dynamic> parsedData =
          data is Map<String, dynamic> ? data : jsonDecode(data.toString());
      final notification = NotificationModel.fromJson(parsedData);
      _notificationsNotifier.addNotification(notification);
      
      // Show local notification
      _pushNotificationService.showNotification(
        id: notification.id.hashCode,
        title: notification.title,
        body: notification.body,
        payload: jsonEncode(parsedData),
      );
    } catch (e) {
      _logger.e('Failed to handle received notification: $e');
    }
  }

  // Handle presence update
  void _handlePresenceUpdate(dynamic data) {
    try {
      final Map<String, dynamic> parsedData =
          data is Map<String, dynamic> ? data : jsonDecode(data.toString());
      final userId = parsedData['userId']?.toString();
      final isOnline = parsedData['isOnline'] ?? false;
      final lastSeen = parsedData['lastSeen'] != null
          ? DateTime.tryParse(parsedData['lastSeen'].toString())
          : null;

      if (userId != null) {
        // Update conversation online status via messages notifier
        _messagesNotifier.state.conversations.map((c) {
          if (c.userId == userId) {
            return c.copyWith(isOnline: isOnline, lastSeen: lastSeen);
          }
          return c;
        });
      }
    } catch (e) {
      _logger.e('Failed to handle presence update: $e');
    }
  }

  void dispose() {
    disconnect();
  }
}
