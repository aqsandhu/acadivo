import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/status_badge.dart';

class AnnouncementsScreen extends ConsumerStatefulWidget {
  const AnnouncementsScreen({super.key});

  @override
  ConsumerState<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends ConsumerState<AnnouncementsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _announcements = [
    {
      'title': 'Annual Sports Day',
      'content': 'The annual sports day will be held on March 25th, 2024. All students are required to participate. Parents are invited to attend.',
      'author': 'Principal Mrs. Fatima',
      'date': '15 Mar 2024',
      'pinned': true,
      'priority': 'urgent',
    },
    {
      'title': 'Exam Schedule Updated',
      'content': 'The mid-term exam schedule has been updated. Please check the timetable section for details.',
      'author': 'Examination Office',
      'date': '14 Mar 2024',
      'pinned': true,
      'priority': 'high',
    },
    {
      'title': 'New Library Hours',
      'content': 'The school library will now be open from 8 AM to 5 PM on weekdays.',
      'author': 'Librarian Mr. Ali',
      'date': '12 Mar 2024',
      'pinned': false,
      'priority': 'normal',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اعلانات' : 'Announcements',
        isUrdu: _isUrdu,
      ),
      body: _announcements.isEmpty
          ? EmptyStateWidget(
              icon: Icons.campaign_outlined,
              title: _isUrdu ? 'کوئی اعلانات نہیں' : 'No Announcements',
              subtitle: _isUrdu ? 'اس وقت کوئی اعلانات نہیں' : 'There are no announcements at this time',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _announcements.length,
              itemBuilder: (context, index) {
                final a = _announcements[index];
                return _buildAnnouncementCard(theme, a);
              },
            ),
    );
  }

  Widget _buildAnnouncementCard(ThemeData theme, Map<String, dynamic> a) {
    final priority = a['priority'] as String;
    final isPinned = a['pinned'] as bool;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isPinned
              ? theme.colorScheme.primary.withOpacity(0.3)
              : theme.colorScheme.outlineVariant.withOpacity(0.5),
          width: isPinned ? 1.5 : 1,
        ),
      ),
      child: InkWell(
        onTap: () => _showAnnouncementDetail(a),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (isPinned)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: Icon(Icons.push_pin, size: 16, color: theme.colorScheme.primary),
                    ),
                  if (priority == 'urgent')
                    const StatusBadge(label: 'Urgent', type: StatusType.danger),
                  if (priority == 'high')
                    const StatusBadge(label: 'High', type: StatusType.warning),
                  if (priority == 'normal')
                    const StatusBadge(label: 'Normal', type: StatusType.info),
                  const Spacer(),
                  Text(
                    a['date'],
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                a['title'],
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                a['content'],
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.person_outline, size: 14, color: theme.colorScheme.onSurfaceVariant),
                  const SizedBox(width: 4),
                  Text(
                    a['author'],
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAnnouncementDetail(Map<String, dynamic> a) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          minChildSize: 0.3,
          builder: (_, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    a['title'],
                    style: Theme.of(ctx).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.person_outline, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(a['author'], style: TextStyle(color: Colors.grey)),
                      const SizedBox(width: 16),
                      Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(a['date'], style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 16),
                  Text(
                    a['content'],
                    style: Theme.of(ctx).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
