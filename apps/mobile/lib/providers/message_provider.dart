// lib/providers/message_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/message_model.dart';
import '../services/communication_service.dart';
import 'auth_provider.dart';

class MessagesState {
  final List<ConversationModel> conversations;
  final Map<String, List<MessageModel>> messages;
  final String? activeConversationId;
  final bool isLoadingConversations;
  final bool isLoadingMessages;
  final String? error;

  const MessagesState({
    this.conversations = const [],
    this.messages = const {},
    this.activeConversationId,
    this.isLoadingConversations = false,
    this.isLoadingMessages = false,
    this.error,
  });

  MessagesState copyWith({
    List<ConversationModel>? conversations,
    Map<String, List<MessageModel>>? messages,
    String? activeConversationId,
    bool? isLoadingConversations,
    bool? isLoadingMessages,
    String? error,
  }) {
    return MessagesState(
      conversations: conversations ?? this.conversations,
      messages: messages ?? this.messages,
      activeConversationId: activeConversationId ?? this.activeConversationId,
      isLoadingConversations: isLoadingConversations ?? this.isLoadingConversations,
      isLoadingMessages: isLoadingMessages ?? this.isLoadingMessages,
      error: error,
    );
  }

  List<MessageModel>? getActiveMessages() {
    if (activeConversationId == null) return null;
    return messages[activeConversationId];
  }

  int getTotalUnreadCount() {
    return conversations.fold(0, (sum, c) => sum + c.unreadCount);
  }
}

class MessagesNotifier extends StateNotifier<MessagesState> {
  final CommunicationService _communicationService;

  MessagesNotifier(this._communicationService) : super(const MessagesState());

  Future<void> loadConversations() async {
    if (state.isLoadingConversations) return;

    state = state.copyWith(isLoadingConversations: true, error: null);

    try {
      final conversations = await _communicationService.getConversations();
      state = state.copyWith(
        conversations: conversations,
        isLoadingConversations: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingConversations: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadMessages(String conversationId, {bool refresh = false}) async {
    if (state.isLoadingMessages) return;

    state = state.copyWith(
      isLoadingMessages: true,
      activeConversationId: conversationId,
      error: null,
    );

    try {
      final messages = await _communicationService.getMessages(
        conversationId: conversationId,
      );

      final updatedMessages = Map<String, List<MessageModel>>.from(state.messages);
      updatedMessages[conversationId] = messages;

      state = state.copyWith(
        messages: updatedMessages,
        isLoadingMessages: false,
      );

      // Mark messages as read
      await _communicationService.markMessagesRead(conversationId);
      _updateConversationUnreadCount(conversationId, 0);
    } catch (e) {
      state = state.copyWith(
        isLoadingMessages: false,
        error: e.toString(),
      );
    }
  }

  Future<MessageModel?> sendMessage({
    required String receiverId,
    required String content,
    MessageType type = MessageType.text,
    String? attachmentUrl,
  }) async {
    try {
      final message = await _communicationService.sendMessage(
        receiverId: receiverId,
        content: content,
        type: type,
        attachmentUrl: attachmentUrl,
      );

      if (message != null) {
        final conversationId = _getConversationId(receiverId);
        final updatedMessages = Map<String, List<MessageModel>>.from(state.messages);
        final existing = updatedMessages[conversationId] ?? [];
        updatedMessages[conversationId] = [...existing, message];
        state = state.copyWith(messages: updatedMessages);
      }

      return message;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  void receiveMessage(MessageModel message) {
    final conversationId = _getConversationId(message.senderId);
    final updatedMessages = Map<String, List<MessageModel>>.from(state.messages);
    final existing = updatedMessages[conversationId] ?? [];
    
    // Avoid duplicates
    if (!existing.any((m) => m.id == message.id)) {
      updatedMessages[conversationId] = [...existing, message];
      state = state.copyWith(messages: updatedMessages);

      // Update conversation last message
      _updateConversationLastMessage(conversationId, message);

      // Increment unread if not active
      if (state.activeConversationId != conversationId) {
        _incrementConversationUnreadCount(conversationId);
      }
    }
  }

  void setActiveConversation(String? conversationId) {
    state = state.copyWith(activeConversationId: conversationId);
    if (conversationId != null) {
      _updateConversationUnreadCount(conversationId, 0);
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  String _getConversationId(String userId) {
    // Generate consistent conversation ID
    return userId;
  }

  void _updateConversationUnreadCount(String conversationId, int count) {
    final updated = state.conversations.map((c) {
      if (c.id == conversationId || c.userId == conversationId) {
        return c.copyWith(unreadCount: count);
      }
      return c;
    }).toList();
    state = state.copyWith(conversations: updated);
  }

  void _incrementConversationUnreadCount(String conversationId) {
    final updated = state.conversations.map((c) {
      if (c.id == conversationId || c.userId == conversationId) {
        return c.copyWith(unreadCount: c.unreadCount + 1);
      }
      return c;
    }).toList();
    state = state.copyWith(conversations: updated);
  }

  void _updateConversationLastMessage(String conversationId, MessageModel message) {
    final updated = state.conversations.map((c) {
      if (c.id == conversationId || c.userId == conversationId) {
        return c.copyWith(
          lastMessage: message.content,
          lastMessageType: message.type,
          lastMessageTime: message.sentAt ?? DateTime.now(),
        );
      }
      return c;
    }).toList();
    state = state.copyWith(conversations: updated);
  }
}

final messagesProvider =
    StateNotifierProvider<MessagesNotifier, MessagesState>((ref) {
  return MessagesNotifier(ref.read(communicationServiceProvider));
});

final totalUnreadMessagesProvider = Provider<int>((ref) {
  return ref.watch(messagesProvider).getTotalUnreadCount();
});
