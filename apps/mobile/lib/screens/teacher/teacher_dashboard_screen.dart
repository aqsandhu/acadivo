import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/info_card.dart';
import '../../widgets/status_badge.dart';

class TeacherDashboardScreen extends ConsumerStatefulWidget {
  const TeacherDashboardScreen({super.key});

  @override
  ConsumerState<TeacherDashboardScreen> createState() => _TeacherDashboardScreenState();
}

class _TeacherDashboardScreenState extends ConsumerState<TeacherDashboardScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _todayClasses = [
    {'subject': 'Mathematics', 'class': 'Class 8-A', 'time': '08:00 - 08:45', 'room': 'Room 101'},
    {'subject': 'Science', 'class': 'Class 7-B', 'time': '09:00 - 09:45', 'room': 'Lab 2'},
    {'subject': 'Mathematics', 'class': 'Class 9-C', 'time': '10:00 - 10:45', 'room': 'Room 103'},
  ];

  final List<Map<String, dynamic>> _announcements = [
    {'title': 'Staff Meeting', 'date': 'Today, 2:00 PM'},
    {'title': 'Exam Duty', 'date': 'Tomorrow'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'ٹیچر ڈیش بورڈ' : 'Teacher Dashboard',
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
              _isUrdu ? 'السلام علیکم، علی خان' : 'Assalamualaikum, Ali Khan',
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              _isUrdu ? 'آج کا شیڈول' : "Here's your schedule for today",
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 140,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _todayClasses.length,
                itemBuilder: (context, index) {
                  final c = _todayClasses[index];
                  return Container(
                    width: 220,
                    margin: const EdgeInsets.only(right: 12),
                    child: Card(
                      elevation: 0,
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
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.primaryContainer,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    c['subject'],
                                    style: theme.textTheme.labelSmall?.copyWith(
                                      color: theme.colorScheme.primary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              c['class'],
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                            ),
                            const Spacer(),
                            Row(
                              children: [
                                Icon(Icons.access_time, size: 14, color: theme.colorScheme.onSurfaceVariant),
                                const SizedBox(width: 4),
                                Text(c['time'], style: theme.textTheme.bodySmall),
                                const SizedBox(width: 12),
                                Icon(Icons.room, size: 14, color: theme.colorScheme.onSurfaceVariant),
                                const SizedBox(width: 4),
                                Text(c['room'], style: theme.textTheme.bodySmall),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
              childAspectRatio: 1.2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: const [
                StatsCard(icon: Icons.class_, value: '4', label: 'Classes Today', color: Color(0xFF1E40AF)),
                StatsCard(icon: Icons.assignment_late, value: '12', label: 'Homework Pending', color: Color(0xFFF59E0B)),
                StatsCard(icon: Icons.message, value: '5', label: 'Messages', color: Color(0xFF3B82F6)),
                StatsCard(icon: Icons.assessment, value: '3', label: 'Reports', color: Color(0xFF10B981)),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _isUrdu ? 'حالیہ اعلانات' : 'Recent Announcements',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
                TextButton(onPressed: () {}, child: Text(_isUrdu ? 'سب دیکھیں' : 'View All')),
              ],
            ),
            const SizedBox(height: 8),
            ..._announcements.map((a) => InfoCard(
              icon: Icons.campaign_outlined,
              title: a['title']!,
              subtitle: a['date']!,
              iconColor: theme.colorScheme.primary,
            )),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _isUrdu ? 'ہوم ورک درج کرنا' : 'Pending Homework to Grade',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
                TextButton(onPressed: () {}, child: Text(_isUrdu ? 'سب دیکھیں' : 'View All')),
              ],
            ),
            const SizedBox(height: 8),
            InfoCard(
              icon: Icons.assignment_outlined,
              title: 'Math Homework - Class 8-A',
              subtitle: '8 submissions pending grading',
              iconColor: const Color(0xFFF59E0B),
              trailing: const StatusBadge(label: 'Pending', type: StatusType.warning),
            ),
            InfoCard(
              icon: Icons.assignment_outlined,
              title: 'Science Quiz - Class 9-B',
              subtitle: '5 submissions pending grading',
              iconColor: const Color(0xFFF59E0B),
              trailing: const StatusBadge(label: 'Pending', type: StatusType.warning),
            ),
          ],
        ),
      ),
    );
  }
}
