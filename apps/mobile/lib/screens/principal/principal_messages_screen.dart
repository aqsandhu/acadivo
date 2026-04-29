import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class PrincipalMessagesScreen extends ConsumerStatefulWidget {
  const PrincipalMessagesScreen({super.key});

  @override
  ConsumerState<PrincipalMessagesScreen> createState() => _PrincipalMessagesScreenState();
}

class _PrincipalMessagesScreenState extends ConsumerState<PrincipalMessagesScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _conversations = [
    {'name': 'Mr. Ali (Teacher)', 'lastMessage': 'About the sports day event', 'time': '10:30 AM', 'unread': 1},
    {'name': 'Admin Office', 'lastMessage': 'Fee collection report', 'time': 'Yesterday', 'unread': 0},
    {'name': 'Mrs. Fatima (Teacher)', 'lastMessage': 'Lab equipment request', 'time': 'Mon', 'unread': 0},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'پیغامات' : 'Messages',
        isUrdu: _isUrdu,
      ),
      body: _conversations.isEmpty
          ? EmptyStateWidget(icon: Icons.message_outlined, title: _isUrdu ? 'کوئی پیغامات نہیں' : 'No Messages', subtitle: '')
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _conversations.length,
              itemBuilder: (context, index) {
                final c = _conversations[index];
                return ListTile(
                  leading: UserAvatar(name: c['name'], size: 48),
                  title: Text(
                    c['name'],
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: c['unread'] > 0 ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                  subtitle: Text(c['lastMessage'], maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(c['time'], style: theme.textTheme.bodySmall),
                      if (c['unread'] > 0)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            c['unread'].toString(),
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),
                  onTap: () {},
                );
              },
            ),
    );
  }
}
