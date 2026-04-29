import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/user_avatar.dart';

class MarkAttendanceScreen extends ConsumerStatefulWidget {
  const MarkAttendanceScreen({super.key});

  @override
  ConsumerState<MarkAttendanceScreen> createState() => _MarkAttendanceScreenState();
}

class _MarkAttendanceScreenState extends ConsumerState<MarkAttendanceScreen> {
  DateTime _selectedDate = DateTime.now();
  String? _selectedClass;
  String? _selectedSection;
  bool _isUrdu = false;
  bool _isLoading = false;

  final List<Map<String, dynamic>> _students = [
    {'name': 'Ahmad Ali', 'roll': 101, 'status': 'present'},
    {'name': 'Bilal Khan', 'roll': 102, 'status': 'present'},
    {'name': 'Fatima Zahra', 'roll': 103, 'status': 'absent'},
    {'name': 'Hassan Raza', 'roll': 104, 'status': 'late'},
    {'name': 'Imran Shah', 'roll': 105, 'status': 'leave'},
  ];

  void _updateStatus(int index, String status) {
    setState(() => _students[index]['status'] = status);
  }

  void _markAllPresent() {
    setState(() {
      for (var s in _students) {
        s['status'] = 'present';
      }
    });
  }

  int get _presentCount => _students.where((s) => s['status'] == 'present').length;
  int get _absentCount => _students.where((s) => s['status'] == 'absent').length;
  int get _lateCount => _students.where((s) => s['status'] == 'late').length;
  int get _leaveCount => _students.where((s) => s['status'] == 'leave').length;

  Color _statusColor(String status) {
    switch (status) {
      case 'present': return const Color(0xFF10B981);
      case 'absent': return const Color(0xFFEF4444);
      case 'late': return const Color(0xFFF59E0B);
      case 'leave': return const Color(0xFF3B82F6);
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'حاضری درج کریں' : 'Mark Attendance',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: _selectedDate,
                            firstDate: DateTime(2024),
                            lastDate: DateTime(2025),
                          );
                          if (picked != null) setState(() => _selectedDate = picked);
                        },
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: _isUrdu ? 'تاریخ' : 'Date',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text(
                            '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: CustomDropdown<String>(
                        label: _isUrdu ? 'کلاس' : 'Class',
                        value: _selectedClass,
                        items: const [
                          DropdownMenuItem(value: '8', child: Text('Class 8')),
                          DropdownMenuItem(value: '9', child: Text('Class 9')),
                          DropdownMenuItem(value: '10', child: Text('Class 10')),
                        ],
                        onChanged: (v) => setState(() => _selectedClass = v),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: CustomDropdown<String>(
                        label: _isUrdu ? 'سیکشن' : 'Section',
                        value: _selectedSection,
                        items: const [
                          DropdownMenuItem(value: 'A', child: Text('Section A')),
                          DropdownMenuItem(value: 'B', child: Text('Section B')),
                          DropdownMenuItem(value: 'C', child: Text('Section C')),
                        ],
                        onChanged: (v) => setState(() => _selectedSection = v),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildSummaryChip('P', _presentCount, const Color(0xFF10B981)),
                _buildSummaryChip('A', _absentCount, const Color(0xFFEF4444)),
                _buildSummaryChip('L', _lateCount, const Color(0xFFF59E0B)),
                _buildSummaryChip('Lv', _leaveCount, const Color(0xFF3B82F6)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                TextButton.icon(
                  onPressed: _markAllPresent,
                  icon: const Icon(Icons.check_circle_outline),
                  label: Text(_isUrdu ? 'سب حاضر' : 'Mark All Present'),
                ),
                const Spacer(),
                Text(
                  '${_students.length} students',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _students.length,
              itemBuilder: (context, index) {
                final s = _students[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: _statusColor(s['status']).withOpacity(0.3),
                    ),
                  ),
                  child: ListTile(
                    leading: UserAvatar(name: s['name'], size: 40),
                    title: Text(s['name']),
                    subtitle: Text('Roll: ${s['roll']}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: ['present', 'absent', 'late', 'leave'].map((status) {
                        final isSelected = s['status'] == status;
                        return Padding(
                          padding: const EdgeInsets.only(left: 4),
                          child: InkWell(
                            onTap: () => _updateStatus(index, status),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                              decoration: BoxDecoration(
                                color: isSelected ? _statusColor(status) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isSelected ? _statusColor(status) : theme.colorScheme.outlineVariant,
                                ),
                              ),
                              child: Text(
                                status[0].toUpperCase(),
                                style: TextStyle(
                                  color: isSelected ? Colors.white : theme.colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: CustomButton(
              label: _isUrdu ? 'محفوظ کریں' : 'Save Attendance',
              isLoading: _isLoading,
              onPressed: () {
                setState(() => _isLoading = true);
                Future.delayed(const Duration(seconds: 1), () {
                  setState(() => _isLoading = false);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(_isUrdu ? 'حاضری محفوظ ہو گئی' : 'Attendance saved successfully')),
                  );
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryChip(String label, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            count.toString(),
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
