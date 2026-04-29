import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({super.key});

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _conversations = [
    {
      'name': 'Mr. Ahmed',
      'lastMessage': 'Please submit your homework by tomorrow',
      'time': '10:30 AM',
      'unread': 2,
      'online': true,
    },
    {
      'name': 'Principal Mrs. Fatima',
      'lastMessage': 'Meeting at 2 PM in the conference room',
      'time': 'Yesterday',
      'unread': 0,
      'online': false,
    },
    {
      'name': 'Parent - Ali's Father',
      'lastMessage': 'Thank you for the update',
      'time': 'Mon',
      'unread': 1,
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
                hintText: _isUrdu ? 'تلاش کریں...' : 'Search conversations...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: theme.colorScheme.surface,
              ),
              onChanged: (v) => setState(() {}),
            ),
          ),
          Expanded(
            child: _conversations.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.message_outlined,
                    title: _isUrdu ? 'کوئی پیغامات نہیں' : 'No Messages',
                    subtitle: _isUrdu ? 'آپ کے پاس ابھی کوئی گفتگو نہیں' : 'You have no conversations yet',
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
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: c['unread'] > 0
                                ? theme.colorScheme.onSurface
                                : theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              c['time'],
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                            if (c['unread'] > 0) ...[
                              const SizedBox(height: 4),
                              Container(
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
                          ],
                        ),
                        onTap: () {},
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.edit),
        label: Text(_isUrdu ? 'نیا پیغام' : 'New Message'),
      ),
    );
  }
}
