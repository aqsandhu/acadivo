// lib/models/message_model.dart
import 'package:equatable/equatable.dart';

enum MessageType { text, image, file, audio, video, system }

enum MessageStatus { sending, sent, delivered, read, failed }

class MessageModel extends Equatable {
  final String id;
  final String senderId;
  final String? senderName;
  final String? senderAvatar;
  final String receiverId;
  final String? receiverName;
  final String? receiverAvatar;
  final String content;
  final MessageType type;
  final MessageStatus status;
  final String? attachmentUrl;
  final String? attachmentName;
  final String? attachmentSize;
  final String? conversationId;
  final DateTime? sentAt;
  final DateTime? readAt;
  final DateTime? createdAt;
  final bool isDeleted;

  const MessageModel({
    required this.id,
    required this.senderId,
    this.senderName,
    this.senderAvatar,
    required this.receiverId,
    this.receiverName,
    this.receiverAvatar,
    required this.content,
    this.type = MessageType.text,
    this.status = MessageStatus.sent,
    this.attachmentUrl,
    this.attachmentName,
    this.attachmentSize,
    this.conversationId,
    this.sentAt,
    this.readAt,
    this.createdAt,
    this.isDeleted = false,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? json['sender_id']?.toString() ?? '',
      senderName: json['senderName']?.toString() ?? json['sender_name']?.toString(),
      senderAvatar: json['senderAvatar']?.toString() ?? json['sender_avatar']?.toString(),
      receiverId: json['receiverId']?.toString() ?? json['receiver_id']?.toString() ?? '',
      receiverName: json['receiverName']?.toString() ?? json['receiver_name']?.toString(),
      receiverAvatar: json['receiverAvatar']?.toString() ?? json['receiver_avatar']?.toString(),
      content: json['content']?.toString() ?? '',
      type: _parseType(json['type']?.toString()),
      status: _parseStatus(json['status']?.toString()),
      attachmentUrl: json['attachmentUrl']?.toString() ?? json['attachment_url']?.toString(),
      attachmentName: json['attachmentName']?.toString() ?? json['attachment_name']?.toString(),
      attachmentSize: json['attachmentSize']?.toString() ?? json['attachment_size']?.toString(),
      conversationId: json['conversationId']?.toString() ?? json['conversation_id']?.toString(),
      sentAt: json['sentAt'] != null || json['sent_at'] != null
          ? DateTime.tryParse((json['sentAt'] ?? json['sent_at']).toString())
          : null,
      readAt: json['readAt'] != null || json['read_at'] != null
          ? DateTime.tryParse((json['readAt'] ?? json['read_at']).toString())
          : null,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      isDeleted: json['isDeleted'] ?? json['is_deleted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'senderName': senderName,
      'senderAvatar': senderAvatar,
      'receiverId': receiverId,
      'receiverName': receiverName,
      'receiverAvatar': receiverAvatar,
      'content': content,
      'type': type.name,
      'status': status.name,
      'attachmentUrl': attachmentUrl,
      'attachmentName': attachmentName,
      'attachmentSize': attachmentSize,
      'conversationId': conversationId,
      'sentAt': sentAt?.toIso8601String(),
      'readAt': readAt?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
      'isDeleted': isDeleted,
    };
  }

  MessageModel copyWith({
    String? id,
    String? senderId,
    String? senderName,
    String? senderAvatar,
    String? receiverId,
    String? receiverName,
    String? receiverAvatar,
    String? content,
    MessageType? type,
    MessageStatus? status,
    String? attachmentUrl,
    String? attachmentName,
    String? attachmentSize,
    String? conversationId,
    DateTime? sentAt,
    DateTime? readAt,
    DateTime? createdAt,
    bool? isDeleted,
  }) {
    return MessageModel(
      id: id ?? this.id,
      senderId: senderId ?? this.senderId,
      senderName: senderName ?? this.senderName,
      senderAvatar: senderAvatar ?? this.senderAvatar,
      receiverId: receiverId ?? this.receiverId,
      receiverName: receiverName ?? this.receiverName,
      receiverAvatar: receiverAvatar ?? this.receiverAvatar,
      content: content ?? this.content,
      type: type ?? this.type,
      status: status ?? this.status,
      attachmentUrl: attachmentUrl ?? this.attachmentUrl,
      attachmentName: attachmentName ?? this.attachmentName,
      attachmentSize: attachmentSize ?? this.attachmentSize,
      conversationId: conversationId ?? this.conversationId,
      sentAt: sentAt ?? this.sentAt,
      readAt: readAt ?? this.readAt,
      createdAt: createdAt ?? this.createdAt,
      isDeleted: isDeleted ?? this.isDeleted,
    );
  }

  static MessageType _parseType(String? value) {
    switch (value?.toLowerCase()) {
      case 'image':
        return MessageType.image;
      case 'file':
        return MessageType.file;
      case 'audio':
        return MessageType.audio;
      case 'video':
        return MessageType.video;
      case 'system':
        return MessageType.system;
      default:
        return MessageType.text;
    }
  }

  static MessageStatus _parseStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'sending':
        return MessageStatus.sending;
      case 'delivered':
        return MessageStatus.delivered;
      case 'read':
        return MessageStatus.read;
      case 'failed':
        return MessageStatus.failed;
      default:
        return MessageStatus.sent;
    }
  }

  @override
  List<Object?> get props => [id, senderId, receiverId, content, sentAt, status];
}

class ConversationModel extends Equatable {
  final String id;
  final String userId;
  final String? userName;
  final String? userAvatar;
  final String? lastMessage;
  final MessageType? lastMessageType;
  final DateTime? lastMessageTime;
  final int unreadCount;
  final bool isOnline;
  final DateTime? lastSeen;

  const ConversationModel({
    required this.id,
    required this.userId,
    this.userName,
    this.userAvatar,
    this.lastMessage,
    this.lastMessageType,
    this.lastMessageTime,
    this.unreadCount = 0,
    this.isOnline = false,
    this.lastSeen,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      userName: json['userName']?.toString() ?? json['user_name']?.toString(),
      userAvatar: json['userAvatar']?.toString() ?? json['user_avatar']?.toString(),
      lastMessage: json['lastMessage']?.toString() ?? json['last_message']?.toString(),
      lastMessageType: _parseLastMessageType(json['lastMessageType']?.toString() ?? json['last_message_type']?.toString()),
      lastMessageTime: json['lastMessageTime'] != null || json['last_message_time'] != null
          ? DateTime.tryParse((json['lastMessageTime'] ?? json['last_message_time']).toString())
          : null,
      unreadCount: json['unreadCount'] ?? json['unread_count'] ?? 0,
      isOnline: json['isOnline'] ?? json['is_online'] ?? false,
      lastSeen: json['lastSeen'] != null || json['last_seen'] != null
          ? DateTime.tryParse((json['lastSeen'] ?? json['last_seen']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userAvatar': userAvatar,
      'lastMessage': lastMessage,
      'lastMessageType': lastMessageType?.name,
      'lastMessageTime': lastMessageTime?.toIso8601String(),
      'unreadCount': unreadCount,
      'isOnline': isOnline,
      'lastSeen': lastSeen?.toIso8601String(),
    };
  }

  ConversationModel copyWith({
    String? id,
    String? userId,
    String? userName,
    String? userAvatar,
    String? lastMessage,
    MessageType? lastMessageType,
    DateTime? lastMessageTime,
    int? unreadCount,
    bool? isOnline,
    DateTime? lastSeen,
  }) {
    return ConversationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userAvatar: userAvatar ?? this.userAvatar,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageType: lastMessageType ?? this.lastMessageType,
      lastMessageTime: lastMessageTime ?? this.lastMessageTime,
      unreadCount: unreadCount ?? this.unreadCount,
      isOnline: isOnline ?? this.isOnline,
      lastSeen: lastSeen ?? this.lastSeen,
    );
  }

  static MessageType? _parseLastMessageType(String? value) {
    if (value == null) return null;
    switch (value.toLowerCase()) {
      case 'image':
        return MessageType.image;
      case 'file':
        return MessageType.file;
      case 'audio':
        return MessageType.audio;
      case 'video':
        return MessageType.video;
      case 'system':
        return MessageType.system;
      default:
        return MessageType.text;
    }
  }

  @override
  List<Object?> get props => [id, userId, lastMessageTime, unreadCount];
}
