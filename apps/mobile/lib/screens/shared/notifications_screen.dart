import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/notification_provider.dart';
import '../../providers/theme_provider.dart';
import '../../providers/locale_provider.dart';
import '../../providers/connection_provider.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsState = ref.watch(notificationsProvider);
    final notifications = notificationsState.notifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () => ref.read(notificationsProvider.notifier).markAllRead(),
            child: const Text('Mark All Read'),
          ),
        ],
      ),
      body: notificationsState.isLoading && notifications.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : notifications.isEmpty
              ? const Center(child: Text('No notifications'))
              : ListView.builder(
                  itemCount: notifications.length,
                  itemBuilder: (context, index) {
                    final notification = notifications[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: notification.isRead
                            ? Colors.grey
                            : Theme.of(context).colorScheme.primary,
                        child: Icon(
                          notification.isRead
                              ? Icons.notifications_none
                              : Icons.notifications,
                          color: Colors.white,
                        ),
                      ),
                      title: Text(
                        notification.title,
                        style: TextStyle(
                          fontWeight: notification.isRead
                              ? FontWeight.normal
                              : FontWeight.bold,
                        ),
                      ),
                      subtitle: Text(notification.body),
                      trailing: Text(
                        notification.sentAt != null
                            ? '${notification.sentAt!.hour}:${notification.sentAt!.minute}'
                            : '',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      onTap: () {
                        ref.read(notificationsProvider.notifier).markRead(notification.id);
                      },
                    );
                  },
                ),
    );
  }
}
