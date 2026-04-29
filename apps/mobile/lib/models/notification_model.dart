// lib/models/notification_model.dart
import 'package:equatable/equatable.dart';

enum NotificationType { general, homework, attendance, result, fee, message, announcement, system }

enum NotificationPriority { low, normal, high, urgent }

class NotificationModel extends Equatable {
  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final NotificationPriority priority;
  final String? dataId;
  final String? route;
  final String? imageUrl;
  final String? senderId;
  final String? senderName;
  final bool isRead;
  final DateTime? readAt;
  final DateTime? sentAt;
  final DateTime? createdAt;

  const NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    this.type = NotificationType.general,
    this.priority = NotificationPriority.normal,
    this.dataId,
    this.route,
    this.imageUrl,
    this.senderId,
    this.senderName,
    this.isRead = false,
    this.readAt,
    this.sentAt,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? json['message']?.toString() ?? '',
      type: _parseType(json['type']?.toString()),
      priority: _parsePriority(json['priority']?.toString()),
      dataId: json['dataId']?.toString() ?? json['data_id']?.toString(),
      route: json['route']?.toString(),
      imageUrl: json['imageUrl']?.toString() ?? json['image_url']?.toString(),
      senderId: json['senderId']?.toString() ?? json['sender_id']?.toString(),
      senderName: json['senderName']?.toString() ?? json['sender_name']?.toString(),
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      readAt: json['readAt'] != null || json['read_at'] != null
          ? DateTime.tryParse((json['readAt'] ?? json['read_at']).toString())
          : null,
      sentAt: json['sentAt'] != null || json['sent_at'] != null
          ? DateTime.tryParse((json['sentAt'] ?? json['sent_at']).toString())
          : null,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'type': type.name,
      'priority': priority.name,
      'dataId': dataId,
      'route': route,
      'imageUrl': imageUrl,
      'senderId': senderId,
      'senderName': senderName,
      'isRead': isRead,
      'readAt': readAt?.toIso8601String(),
      'sentAt': sentAt?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  NotificationModel copyWith({
    String? id,
    String? title,
    String? body,
    NotificationType? type,
    NotificationPriority? priority,
    String? dataId,
    String? route,
    String? imageUrl,
    String? senderId,
    String? senderName,
    bool? isRead,
    DateTime? readAt,
    DateTime? sentAt,
    DateTime? createdAt,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      priority: priority ?? this.priority,
      dataId: dataId ?? this.dataId,
      route: route ?? this.route,
      imageUrl: imageUrl ?? this.imageUrl,
      senderId: senderId ?? this.senderId,
      senderName: senderName ?? this.senderName,
      isRead: isRead ?? this.isRead,
      readAt: readAt ?? this.readAt,
      sentAt: sentAt ?? this.sentAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static NotificationType _parseType(String? value) {
    switch (value?.toLowerCase()) {
      case 'homework':
        return NotificationType.homework;
      case 'attendance':
        return NotificationType.attendance;
      case 'result':
        return NotificationType.result;
      case 'fee':
        return NotificationType.fee;
      case 'message':
        return NotificationType.message;
      case 'announcement':
        return NotificationType.announcement;
      case 'system':
        return NotificationType.system;
      default:
        return NotificationType.general;
    }
  }

  static NotificationPriority _parsePriority(String? value) {
    switch (value?.toLowerCase()) {
      case 'low':
        return NotificationPriority.low;
      case 'high':
        return NotificationPriority.high;
      case 'urgent':
        return NotificationPriority.urgent;
      default:
        return NotificationPriority.normal;
    }
  }

  @override
  List<Object?> get props => [id, title, type, isRead, sentAt];
}
