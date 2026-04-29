import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/pull_to_refresh.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  bool _isUrdu = false;
  final List<Map<String, dynamic>> _notifications = [
    {'title': 'New Homework Assigned', 'subtitle': 'Mathematics - Due tomorrow', 'time': '2 min ago', 'read': false, 'type': 'homework'},
    {'title': 'Attendance Alert', 'subtitle': 'Your child was absent today', 'time': '1 hour ago', 'read': false, 'type': 'attendance'},
    {'title': 'Fee Reminder', 'subtitle': 'Fee due on 15th March', 'time': '3 hours ago', 'read': true, 'type': 'fee'},
    {'title': 'School Announcement', 'subtitle': 'Holiday on 23rd March', 'time': 'Yesterday', 'read': true, 'type': 'announcement'},
  ];

  IconData _getIcon(String type) {
    switch (type) {
      case 'homework': return Icons.assignment_outlined;
      case 'attendance': return Icons.event_busy_outlined;
      case 'fee': return Icons.payment_outlined;
      case 'announcement': return Icons.campaign_outlined;
      case 'message': return Icons.message_outlined;
      default: return Icons.notifications_outlined;
    }
  }

  Color _getIconColor(String type, ThemeData theme) {
    switch (type) {
      case 'homework': return const Color(0xFF1E40AF);
      case 'attendance': return const Color(0xFFF59E0B);
      case 'fee': return const Color(0xFFEF4444);
      case 'announcement': return const Color(0xFF10B981);
      default: return theme.colorScheme.primary;
    }
  }

  Future<void> _onRefresh() async {
    await Future.delayed(const Duration(seconds: 1));
  }

  void _markAllRead() {
    setState(() {
      for (var n in _notifications) {
        n['read'] = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final unreadCount = _notifications.where((n) => !n['read']).length;

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اطلاعات' : 'Notifications',
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: Text(_isUrdu ? 'سب پڑھیں' : 'Mark All Read'),
            ),
        ],
        isUrdu: _isUrdu,
      ),
      body: PullToRefresh(
        onRefresh: _onRefresh,
        child: _notifications.isEmpty
            ? EmptyStateWidget(
                icon: Icons.notifications_off_outlined,
                title: _isUrdu ? 'کوئی اطلاعات نہیں' : 'No Notifications',
                subtitle: _isUrdu ? 'آپ کے پاس کوئی نئی اطلاعات نہیں' : 'You have no new notifications',
              )
            : ListView.builder(
                itemCount: _notifications.length,
                itemBuilder: (context, index) {
                  final n = _notifications[index];
                  return Dismissible(
                    key: ValueKey(index),
                    background: Container(
                      color: theme.colorScheme.primary,
                      alignment: Alignment.centerLeft,
                      padding: const EdgeInsets.only(left: 20),
                      child: const Icon(Icons.check, color: Colors.white),
                    ),
                    secondaryBackground: Container(
                      color: theme.colorScheme.error,
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 20),
                      child: const Icon(Icons.delete, color: Colors.white),
                    ),
                    onDismissed: (_) {
                      setState(() => _notifications.removeAt(index));
                    },
                    child: ListTile(
                      leading: Stack(
                        children: [
                          CircleAvatar(
                            backgroundColor: _getIconColor(n['type'], theme).withOpacity(0.1),
                            child: Icon(
                              _getIcon(n['type']),
                              color: _getIconColor(n['type'], theme),
                            ),
                          ),
                          if (!n['read'])
                            Positioned(
                              right: 0,
                              top: 0,
                              child: Container(
                                width: 10,
                                height: 10,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF3B82F6),
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                        ],
                      ),
                      title: Text(
                        n['title'],
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: n['read'] ? FontWeight.normal : FontWeight.w600,
                        ),
                      ),
                      subtitle: Text('${n['subtitle']} • ${n['time']}'),
                      onTap: () => setState(() => n['read'] = true),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
