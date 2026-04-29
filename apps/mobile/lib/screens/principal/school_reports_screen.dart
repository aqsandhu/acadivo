import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/status_badge.dart';

class SchoolReportsScreen extends ConsumerStatefulWidget {
  const SchoolReportsScreen({super.key});

  @override
  ConsumerState<SchoolReportsScreen> createState() => _SchoolReportsScreenState();
}

class _SchoolReportsScreenState extends ConsumerState<SchoolReportsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _reports = [
    {'title': 'Academic Performance Report', 'type': 'Academic', 'date': 'Q1 2024', 'status': 'ready'},
    {'title': 'Attendance Analysis', 'type': 'Attendance', 'date': 'Feb 2024', 'status': 'ready'},
    {'title': 'Financial Summary', 'type': 'Financial', 'date': 'Q1 2024', 'status': 'generating'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکول کی رپورٹس' : 'School Reports',
        isUrdu: _isUrdu,
      ),
      body: _reports.isEmpty
          ? EmptyStateWidget(icon: Icons.assessment_outlined, title: _isUrdu ? 'کوئی رپورٹس نہیں' : 'No Reports', subtitle: '')
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _reports.length,
              itemBuilder: (context, index) {
                final r = _reports[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    title: Text(r['title']),
                    subtitle: Text('${r['type']} • ${r['date']}'),
                    trailing: r['status'] == 'ready'
                        ? Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const StatusBadge(label: 'Ready', type: StatusType.success),
                              const SizedBox(width: 8),
                              IconButton(icon: const Icon(Icons.download), onPressed: () {}),
                            ],
                          )
                        : const StatusBadge(label: 'Generating', type: StatusType.warning),
                  ),
                );
              },
            ),
    );
  }
}
