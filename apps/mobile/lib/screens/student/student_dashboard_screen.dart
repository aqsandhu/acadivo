import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';

class StudentDashboardScreen extends ConsumerStatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  ConsumerState<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends ConsumerState<StudentDashboardScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _todayClasses = [
    {'subject': 'Mathematics', 'time': '08:00 - 08:45', 'room': 'Room 101', 'teacher': 'Mr. Ali'},
    {'subject': 'Science', 'time': '09:00 - 09:45', 'room': 'Lab 2', 'teacher': 'Mrs. Fatima'},
    {'subject': 'English', 'time': '10:00 - 10:45', 'room': 'Room 103', 'teacher': 'Mr. Khan'},
  ];

  final List<Map<String, dynamic>> _announcements = [
    {'title': 'Sports Day', 'content': 'Annual sports day on March 25th'},
    {'title': 'Exam Schedule', 'content': 'Mid-term exams start April 1st'},
    {'title': 'Fee Due', 'content': 'Please pay fees by March 20th'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'طالب علم ڈیش بورڈ' : 'Student Dashboard',
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
        isUrdu: _isUrdu,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _isUrdu ? 'السلام علیکم، احمد علی' : 'Assalamualaikum, Ahmad Ali',
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'Class 8-A | Roll: 101',
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 20),
            Text(
              _isUrdu ? 'آج کا شیڈول' : "Today's Schedule",
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            ..._todayClasses.map((c) => Card(
              elevation: 0,
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
              ),
              child: ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.class_, color: theme.colorScheme.primary, size: 20),
                ),
                title: Text(c['subject'], style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                subtitle: Text('${c['teacher']} • ${c['room']}'),
                trailing: Text(c['time'], style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
              ),
            )),
            const SizedBox(height: 20),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
              childAspectRatio: 1.3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: const [
                StatsCard(icon: Icons.event_available, value: '92%', label: 'Attendance', color: Color(0xFF10B981)),
                StatsCard(icon: Icons.assignment_late, value: '3', label: 'Pending HW', color: Color(0xFFF59E0B)),
                StatsCard(icon: Icons.notifications, value: '5', label: 'Unread', color: Color(0xFF3B82F6)),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _isUrdu ? 'اعلانات' : 'Announcements',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
                TextButton(onPressed: () {}, child: Text(_isUrdu ? 'سب دیکھیں' : 'View All')),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 140,
              child: PageView.builder(
                itemCount: _announcements.length,
                itemBuilder: (context, index) {
                  final a = _announcements[index];
                  return Card(
                    elevation: 0,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const StatusBadge(label: 'New', type: StatusType.info),
                              const Spacer(),
                              Icon(Icons.chevron_right, color: theme.colorScheme.onSurfaceVariant, size: 18),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            a['title'],
                            style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            a['content'],
                            style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
