import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/empty_state_widget.dart';

class TeacherReportsScreen extends ConsumerStatefulWidget {
  const TeacherReportsScreen({super.key});

  @override
  ConsumerState<TeacherReportsScreen> createState() => _TeacherReportsScreenState();
}

class _TeacherReportsScreenState extends ConsumerState<TeacherReportsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _requests = [
    {'parent': 'Mr. Ahmed', 'student': 'Ahmad Ali', 'type': 'Progress', 'status': 'pending'},
    {'parent': 'Mrs. Khan', 'student': 'Bilal Khan', 'type': 'Attendance', 'status': 'completed'},
    {'parent': 'Mr. Raza', 'student': 'Hassan Raza', 'type': 'Behavior', 'status': 'pending'},
  ];

  final List<Map<String, dynamic>> _generated = [
    {'student': 'Fatima Zahra', 'type': 'Progress Report', 'date': '10 Mar 2024'},
    {'student': 'Imran Shah', 'type': 'Attendance Report', 'date': '08 Mar 2024'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'رپورٹس' : 'Reports',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            _isUrdu ? 'زیر التواء درخواستیں' : 'Pending Requests',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          if (_requests.where((r) => r['status'] == 'pending').isEmpty)
            EmptyStateWidget(
              icon: Icons.check_circle_outline,
              title: _isUrdu ? 'کوئی زیر التواء درخواست نہیں' : 'No Pending Requests',
              subtitle: '',
            )
          else
            ..._requests.where((r) => r['status'] == 'pending').map((r) => Card(
              elevation: 0,
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
              ),
              child: ListTile(
                title: Text('${r['type']} Report - ${r['student']}'),
                subtitle: Text('Requested by: ${r['parent']}'),
                trailing: FilledButton(
                  onPressed: () {},
                  child: Text(_isUrdu ? 'ت生成' : 'Generate'),
                ),
              ),
            )),
          const SizedBox(height: 24),
          Text(
            _isUrdu ? 'تیا ر رپورٹس' : 'Generated Reports',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._generated.map((r) => Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
            ),
            child: ListTile(
              title: Text(r['type']),
              subtitle: Text('${r['student']} • ${r['date']}'),
              trailing: IconButton(
                icon: const Icon(Icons.download),
                onPressed: () {},
              ),
            ),
          )),
        ],
      ),
    );
  }
}
