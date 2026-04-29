import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/status_badge.dart';

class TeacherHomeworkScreen extends ConsumerStatefulWidget {
  const TeacherHomeworkScreen({super.key});

  @override
  ConsumerState<TeacherHomeworkScreen> createState() => _TeacherHomeworkScreenState();
}

class _TeacherHomeworkScreenState extends ConsumerState<TeacherHomeworkScreen> {
  int _selectedTab = 0;
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _assigned = [
    {'title': 'Algebra Exercises', 'class': 'Class 8-A', 'dueDate': '18 Mar 2024', 'submissions': 12, 'total': 32},
    {'title': 'Physics Lab Report', 'class': 'Class 9-B', 'dueDate': '20 Mar 2024', 'submissions': 5, 'total': 30},
  ];

  final List<Map<String, dynamic>> _submissions = [
    {'student': 'Ahmad Ali', 'status': 'submitted', 'date': '17 Mar', 'grade': null},
    {'student': 'Bilal Khan', 'status': 'late', 'date': '18 Mar', 'grade': 'B'},
    {'student': 'Fatima Zahra', 'status': 'pending', 'date': '-', 'grade': null},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'ہوم ورک' : 'Homework',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<int>(
              segments: [
                ButtonSegment(
                  value: 0,
                  label: Text(_isUrdu ? 'تفویض شدہ' : 'Assigned'),
                ),
                ButtonSegment(
                  value: 1,
                  label: Text(_isUrdu ? 'جمع کروائیاں' : 'Submissions'),
                ),
              ],
              selected: {_selectedTab},
              onSelectionChanged: (v) => setState(() => _selectedTab = v.first),
            ),
          ),
          Expanded(
            child: _selectedTab == 0 ? _buildAssignedTab(theme) : _buildSubmissionsTab(theme),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.add),
        label: Text(_isUrdu ? 'ہوم ورک بنائیں' : 'Create Homework'),
      ),
    );
  }

  Widget _buildAssignedTab(ThemeData theme) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _assigned.length,
      itemBuilder: (context, index) {
        final h = _assigned[index];
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
          ),
          child: InkWell(
            onTap: () {},
            borderRadius: BorderRadius.circular(16),
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
                          h['class'],
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        'Due: ${h['dueDate']}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    h['title'],
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: h['submissions'] / h['total'],
                    backgroundColor: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${h['submissions']}/${h['total']} submissions',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSubmissionsTab(ThemeData theme) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _submissions.length,
      itemBuilder: (context, index) {
        final s = _submissions[index];
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
          ),
          child: ListTile(
            title: Text(s['student']),
            subtitle: Text('Submitted: ${s['date']}'),
            trailing: s['status'] == 'submitted'
                ? FilledButton(
                    onPressed: () {},
                    child: Text(_isUrdu ? 'درجہ بندی' : 'Grade'),
                  )
                : s['status'] == 'late'
                    ? const StatusBadge(label: 'Late', type: StatusType.warning)
                    : const StatusBadge(label: 'Pending', type: StatusType.info),
          ),
        );
      },
    );
  }
}
