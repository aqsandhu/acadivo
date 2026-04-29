// lib/providers/notification_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/notification_model.dart';
import '../services/api_service.dart';
import '../services/communication_service.dart';
import 'auth_provider.dart';

class NotificationsState {
  final List<NotificationModel> notifications;
  final bool isLoading;
  final bool hasMore;
  final String? error;
  final int page;

  const NotificationsState({
    this.notifications = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.error,
    this.page = 1,
  });

  NotificationsState copyWith({
    List<NotificationModel>? notifications,
    bool? isLoading,
    bool? hasMore,
    String? error,
    int? page,
  }) {
    return NotificationsState(
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      error: error,
      page: page ?? this.page,
    );
  }

  List<NotificationModel> get unreadNotifications =>
      notifications.where((n) => !n.isRead).toList();

  int get unreadCount => unreadNotifications.length;
}

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final CommunicationService _communicationService;

  NotificationsNotifier(this._communicationService)
      : super(const NotificationsState());

  Future<void> loadNotifications({bool refresh = false}) async {
    if (state.isLoading) return;

    final page = refresh ? 1 : state.page;
    state = state.copyWith(isLoading: true, error: null);

    try {
      final notifications = await _communicationService.getNotifications(
        page: page,
        limit: 50,
      );

      final allNotifications = refresh
          ? notifications
          : [...state.notifications, ...notifications];

      state = NotificationsState(
        notifications: allNotifications,
        isLoading: false,
        hasMore: notifications.length >= 50,
        page: page + 1,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> markRead(String notificationId) async {
    try {
      final success = await _communicationService.markNotificationRead(notificationId);
      if (success) {
        final updated = state.notifications.map((n) {
          if (n.id == notificationId) {
            return n.copyWith(isRead: true, readAt: DateTime.now());
          }
          return n;
        }).toList();
        state = state.copyWith(notifications: updated);
      }
    } catch (e) {
      // Silently fail - can retry later
    }
  }

  Future<void> markAllRead() async {
    try {
      final success = await _communicationService.markAllNotificationsRead();
      if (success) {
        final updated = state.notifications.map((n) {
          if (!n.isRead) {
            return n.copyWith(isRead: true, readAt: DateTime.now());
          }
          return n;
        }).toList();
        state = state.copyWith(notifications: updated);
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      final success = await _communicationService.deleteNotification(notificationId);
      if (success) {
        final updated = state.notifications.where((n) => n.id != notificationId).toList();
        state = state.copyWith(notifications: updated);
      }
    } catch (e) {
      // Silently fail
    }
  }

  void addNotification(NotificationModel notification) {
    final exists = state.notifications.any((n) => n.id == notification.id);
    if (!exists) {
      state = state.copyWith(
        notifications: [notification, ...state.notifications],
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final communicationServiceProvider = Provider<CommunicationService>((ref) {
  return CommunicationService(ref.read(apiServiceProvider));
});

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  return NotificationsNotifier(ref.read(communicationServiceProvider));
});

final unreadNotificationsCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).unreadCount;
});

final unreadNotificationsProvider = Provider<List<NotificationModel>>((ref) {
  return ref.watch(notificationsProvider).unreadNotifications;
});
