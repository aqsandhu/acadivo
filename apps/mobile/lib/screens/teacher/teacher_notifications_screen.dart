import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

import '../../services/communication_service.dart';
import '../../services/api_service.dart';
import '../../models/notification_model.dart';

class TeacherNotificationsScreen extends ConsumerStatefulWidget {
  const TeacherNotificationsScreen({super.key});
  @override
  ConsumerState<TeacherNotificationsScreen> createState() => _TeacherNotificationsScreenState();
}

class _TeacherNotificationsScreenState extends ConsumerState<TeacherNotificationsScreen> {
  bool _isLoading = true;
  String? _error;
  List<NotificationModel> _notifications = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = CommunicationService(api);
      final data = await service.getNotifications();
      setState(() { _notifications = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _markRead(String id) async {
    try {
      final api = ref.read(apiServiceProvider);
      final service = CommunicationService(api);
      await service.markNotificationRead(id);
      setState(() {
        _notifications = _notifications.map((n) => n.id == id ? n.copyWith(isRead: true) : n).toList();
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'نوٹیفیکیشنز' : 'Notifications',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _notifications.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _notifications.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _notifications.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.notifications_none_outlined,
                        title: isUrdu ? 'کوئی نوٹیفیکیشن نہیں' : 'No Notifications',
                        subtitle: isUrdu ? 'ابھی تک کوئی نوٹیفیکیشن نہیں' : 'No notifications yet.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _notifications.length,
                          padding: const EdgeInsets.all(16),
                          itemBuilder: (context, index) {
                            final n = _notifications[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              color: n.isRead ? null : theme.colorScheme.primaryContainer.withOpacity(0.1),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: Icon(
                                  n.isRead ? Icons.notifications_outlined : Icons.notifications_active,
                                  color: n.isRead ? theme.colorScheme.onSurfaceVariant : theme.colorScheme.primary,
                                ),
                                title: Text(n.title, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: n.isRead ? FontWeight.normal : FontWeight.w600)),
                                subtitle: Text(n.body, maxLines: 2, overflow: TextOverflow.ellipsis),
                                trailing: Text(n.createdAt != null ? '${n.createdAt!.day}/${n.createdAt!.month}' : '', style: theme.textTheme.bodySmall),
                                onTap: () => _markRead(n.id),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
