import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/status_badge.dart';

class ParentReportsScreen extends ConsumerStatefulWidget {
  const ParentReportsScreen({super.key});

  @override
  ConsumerState<ParentReportsScreen> createState() => _ParentReportsScreenState();
}

class _ParentReportsScreenState extends ConsumerState<ParentReportsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _requests = [
    {'child': 'Ahmad Ali', 'type': 'Progress Report', 'teacher': 'Mr. Ali', 'status': 'completed', 'date': '10 Mar'},
    {'child': 'Ahmad Ali', 'type': 'Attendance Report', 'teacher': 'Mrs. Fatima', 'status': 'pending', 'date': '15 Mar'},
  ];

  void _showRequestForm() {
    String? selectedChild;
    String? selectedTeacher;
    String? selectedType;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 16, right: 16, top: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isUrdu ? 'رپورٹ کی درخواست' : 'Request Report',
                style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              CustomDropdown<String>(
                label: _isUrdu ? 'بچہ' : 'Child',
                value: selectedChild,
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Ahmad Ali')),
                  DropdownMenuItem(value: '2', child: Text('Fatima Ali')),
                ],
                onChanged: (v) => setState(() => selectedChild = v),
              ),
              const SizedBox(height: 12),
              CustomDropdown<String>(
                label: _isUrdu ? 'استاد' : 'Teacher',
                value: selectedTeacher,
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Mr. Ali')),
                  DropdownMenuItem(value: '2', child: Text('Mrs. Fatima')),
                ],
                onChanged: (v) => setState(() => selectedTeacher = v),
              ),
              const SizedBox(height: 12),
              CustomDropdown<String>(
                label: _isUrdu ? 'رپورٹ کی قسم' : 'Report Type',
                value: selectedType,
                items: const [
                  DropdownMenuItem(value: 'progress', child: Text('Progress')),
                  DropdownMenuItem(value: 'attendance', child: Text('Attendance')),
                  DropdownMenuItem(value: 'behavior', child: Text('Behavior')),
                  DropdownMenuItem(value: 'comprehensive', child: Text('Comprehensive')),
                ],
                onChanged: (v) => setState(() => selectedType = v),
              ),
              const SizedBox(height: 24),
              CustomButton(
                label: _isUrdu ? 'درخواست بھیجیں' : 'Submit Request',
                onPressed: () => Navigator.of(ctx).pop(),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'رپورٹ کی درخواستیں' : 'Report Requests',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CustomButton(
            label: _isUrdu ? 'نئی درخواست' : 'Request Report',
            icon: Icons.add,
            onPressed: _showRequestForm,
          ),
          const SizedBox(height: 24),
          Text(
            _isUrdu ? 'میری درخواستیں' : 'My Requests',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          if (_requests.isEmpty)
            EmptyStateWidget(
              icon: Icons.description_outlined,
              title: _isUrdu ? 'کوئی درخواستیں نہیں' : 'No Requests',
              subtitle: '',
            )
          else
            ..._requests.map((r) => Card(
              elevation: 0,
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                title: Text('${r['type']} - ${r['child']}'),
                subtitle: Text('${r['teacher']} • ${r['date']}'),
                trailing: r['status'] == 'completed'
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const StatusBadge(label: 'Completed', type: StatusType.success),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.download),
                            onPressed: () {},
                          ),
                        ],
                      )
                    : const StatusBadge(label: 'Pending', type: StatusType.warning),
              ),
            )).toList(),
        ],
      ),
    );
  }
}
