import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class StudentMessagesScreen extends ConsumerStatefulWidget {
  const StudentMessagesScreen({super.key});

  @override
  ConsumerState<StudentMessagesScreen> createState() => _StudentMessagesScreenState();
}

class _StudentMessagesScreenState extends ConsumerState<StudentMessagesScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _conversations = [
    {
      'name': 'Mr. Ali',
      'lastMessage': 'Please complete the assignment',
      'time': '10:30 AM',
      'unread': 1,
      'online': true,
    },
    {
      'name': 'Mrs. Fatima',
      'lastMessage': 'Good work on the lab report',
      'time': 'Yesterday',
      'unread': 0,
      'online': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'پیغامات' : 'Messages',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: _isUrdu ? 'تلاش کریں...' : 'Search teachers...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: theme.colorScheme.surface,
              ),
            ),
          ),
          Expanded(
            child: _conversations.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.message_outlined,
                    title: _isUrdu ? 'کوئی پیغامات نہیں' : 'No Messages',
                    subtitle: _isUrdu ? 'آپ کے استادوں سے رابطہ کریں' : 'Reach out to your teachers',
                  )
                : ListView.builder(
                    itemCount: _conversations.length,
                    itemBuilder: (context, index) {
                      final c = _conversations[index];
                      return ListTile(
                        leading: UserAvatar(
                          name: c['name'],
                          size: 48,
                          showStatus: true,
                          isOnline: c['online'],
                        ),
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
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        onTap: () {},
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
