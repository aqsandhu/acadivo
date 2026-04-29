import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/status_badge.dart';

class ParentHomeworkScreen extends ConsumerStatefulWidget {
  const ParentHomeworkScreen({super.key});

  @override
  ConsumerState<ParentHomeworkScreen> createState() => _ParentHomeworkScreenState();
}

class _ParentHomeworkScreenState extends ConsumerState<ParentHomeworkScreen> {
  bool _isUrdu = false;
  String? _selectedChild;

  final List<Map<String, dynamic>> _homework = [
    {'title': 'Algebra Exercises', 'subject': 'Math', 'dueDate': '18 Mar', 'status': 'pending', 'child': 'Ahmad Ali'},
    {'title': 'Science Lab Report', 'subject': 'Science', 'dueDate': '15 Mar', 'status': 'late', 'child': 'Ahmad Ali'},
    {'title': 'English Essay', 'subject': 'English', 'dueDate': '20 Mar', 'status': 'pending', 'child': 'Fatima Ali'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'بچے کا ہوم ورک' : 'Child Homework',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: CustomDropdown<String>(
              label: _isUrdu ? 'بچہ منتخب کریں' : 'Select Child',
              value: _selectedChild,
              items: const [
                DropdownMenuItem(value: 'all', child: Text('All Children')),
                DropdownMenuItem(value: '1', child: Text('Ahmad Ali')),
                DropdownMenuItem(value: '2', child: Text('Fatima Ali')),
              ],
              onChanged: (v) => setState(() => _selectedChild = v),
            ),
          ),
          Expanded(
            child: _homework.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.assignment_turned_in_outlined,
                    title: _isUrdu ? 'کوئی ہوم ورک نہیں' : 'No Homework',
                    subtitle: '',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _homework.length,
                    itemBuilder: (context, index) {
                      final h = _homework[index];
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: h['status'] == 'late'
                                ? const Color(0xFFEF4444).withOpacity(0.3)
                                : theme.colorScheme.outlineVariant.withOpacity(0.5),
                          ),
                        ),
                        child: ListTile(
                          title: Text(h['title']),
                          subtitle: Text('${h['subject']} • Due: ${h['dueDate']}'),
                          trailing: h['status'] == 'late'
                              ? const StatusBadge(label: 'Late', type: StatusType.danger)
                              : const StatusBadge(label: 'Pending', type: StatusType.warning),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
