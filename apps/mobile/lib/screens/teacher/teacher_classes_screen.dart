import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';

class TeacherClassesScreen extends ConsumerStatefulWidget {
  const TeacherClassesScreen({super.key});

  @override
  ConsumerState<TeacherClassesScreen> createState() => _TeacherClassesScreenState();
}

class _TeacherClassesScreenState extends ConsumerState<TeacherClassesScreen> {
  bool _isUrdu = false;
  final List<Map<String, dynamic>> _classes = [
    {'name': 'Class 8-A', 'subject': 'Mathematics', 'students': 32, 'room': 'Room 101'},
    {'name': 'Class 7-B', 'subject': 'Science', 'students': 28, 'room': 'Lab 2'},
    {'name': 'Class 9-C', 'subject': 'Mathematics', 'students': 35, 'room': 'Room 103'},
    {'name': 'Class 10-A', 'subject': 'Physics', 'students': 30, 'room': 'Lab 1'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'میری کلاسز' : 'My Classes',
        isUrdu: _isUrdu,
      ),
      body: _classes.isEmpty
          ? EmptyStateWidget(
              icon: Icons.class_outlined,
              title: _isUrdu ? 'کوئی کلاسز نہیں' : 'No Classes',
              subtitle: _isUrdu ? 'آپ کو کوئی کلاس تفویض نہیں کی گئی' : 'You have no assigned classes',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _classes.length,
              itemBuilder: (context, index) {
                final c = _classes[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                  ),
                  child: InkWell(
                    onTap: () => _showClassDetail(c),
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primaryContainer,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  c['subject'],
                                  style: theme.textTheme.labelMedium?.copyWith(
                                    color: theme.colorScheme.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              Icon(Icons.chevron_right, color: theme.colorScheme.onSurfaceVariant),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            c['name'],
                            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Icon(Icons.people_outline, size: 18, color: theme.colorScheme.onSurfaceVariant),
                              const SizedBox(width: 6),
                              Text(
                                '${c['students']} Students',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                              const SizedBox(width: 20),
                              Icon(Icons.room_outlined, size: 18, color: theme.colorScheme.onSurfaceVariant),
                              const SizedBox(width: 6),
                              Text(
                                c['room'],
                                style: theme.textTheme.bodyMedium?.copyWith(
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
              },
            ),
    );
  }

  void _showClassDetail(Map<String, dynamic> c) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DefaultTabController(
        length: 3,
        child: SizedBox(
          height: MediaQuery.of(ctx).size.height * 0.7,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  '${c['name']} - ${c['subject']}',
                  style: Theme.of(ctx).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
              const TabBar(
                tabs: [
                  Tab(text: 'Students'),
                  Tab(text: 'Attendance'),
                  Tab(text: 'Homework'),
                ],
              ),
              Expanded(
                child: TabBarView(
                  children: [
                    ListView.builder(
                      itemCount: 5,
                      itemBuilder: (_, i) => ListTile(
                        leading: CircleAvatar(child: Text('S${i + 1}')),
                        title: Text('Student ${i + 1}'),
                        subtitle: Text('Roll: ${100 + i}'),
                      ),
                    ),
                    const Center(child: Text('Attendance Tab')),
                    const Center(child: Text('Homework Tab')),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
