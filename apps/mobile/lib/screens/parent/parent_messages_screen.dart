import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class ParentMessagesScreen extends ConsumerStatefulWidget {
  const ParentMessagesScreen({super.key});

  @override
  ConsumerState<ParentMessagesScreen> createState() => _ParentMessagesScreenState();
}

class _ParentMessagesScreenState extends ConsumerState<ParentMessagesScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _conversations = [
    {'name': 'Mr. Ali (Teacher)', 'lastMessage': 'Ahmad is doing well', 'time': '10:30 AM', 'unread': 1, 'role': 'teacher'},
    {'name': 'Principal Mrs. Fatima', 'lastMessage': 'Meeting next Monday', 'time': 'Yesterday', 'unread': 0, 'role': 'principal'},
    {'name': 'Admin Office', 'lastMessage': 'Fee reminder', 'time': 'Mon', 'unread': 0, 'role': 'admin'},
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
          ? EmptyStateWidget(
              icon: Icons.message_outlined,
              title: _isUrdu ? 'کوئی پیغامات نہیں' : 'No Messages',
              subtitle: '',
            )
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
                  subtitle: Text(
                    c['lastMessage'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
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
