import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_dropdown.dart';

class ParentAttendanceScreen extends ConsumerStatefulWidget {
  const ParentAttendanceScreen({super.key});

  @override
  ConsumerState<ParentAttendanceScreen> createState() => _ParentAttendanceScreenState();
}

class _ParentAttendanceScreenState extends ConsumerState<ParentAttendanceScreen> {
  bool _isUrdu = false;
  String? _selectedChild;
  DateTime _focusedDay = DateTime.now();

  final Map<DateTime, String> _attendance = {
    DateTime(2024, 3, 1): 'present',
    DateTime(2024, 3, 5): 'absent',
    DateTime(2024, 3, 6): 'absent',
    DateTime(2024, 3, 7): 'absent',
    DateTime(2024, 3, 8): 'present',
  };

  Color _getDayColor(String? status) {
    switch (status) {
      case 'present': return const Color(0xFF10B981);
      case 'absent': return const Color(0xFFEF4444);
      case 'late': return const Color(0xFFF59E0B);
      case 'leave': return const Color(0xFF3B82F6);
      default: return Colors.transparent;
    }
  }

  int get _consecutiveAbsences {
    int maxStreak = 0;
    int currentStreak = 0;
    final sorted = _attendance.entries.toList()..sort((a, b) => a.key.compareTo(b.key));
    for (var entry in sorted) {
      if (entry.value == 'absent') {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'بچے کی حاضری' : 'Child Attendance',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CustomDropdown<String>(
            label: _isUrdu ? 'بچہ منتخب کریں' : 'Select Child',
            value: _selectedChild,
            items: const [
              DropdownMenuItem(value: '1', child: Text('Ahmad Ali - Class 8-A')),
              DropdownMenuItem(value: '2', child: Text('Fatima Ali - Class 5-B')),
            ],
            onChanged: (v) => setState(() => _selectedChild = v),
          ),
          const SizedBox(height: 20),
          if (_consecutiveAbsences >= 3)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning, color: Color(0xFFEF4444)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _isUrdu
                          ? 'Alert: $_consecutiveAbsences لگاتار غیر حاضری!'
                          : 'Alert: $_consecutiveAbsences consecutive absences!',
                      style: const TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: TableCalendar(
                firstDay: DateTime(2024, 1, 1),
                lastDay: DateTime(2024, 12, 31),
                focusedDay: _focusedDay,
                onPageChanged: (focused) => setState(() => _focusedDay = focused),
                calendarStyle: CalendarStyle(
                  cellMargin: const EdgeInsets.all(4),
                ),
                calendarBuilders: CalendarBuilders(
                  defaultBuilder: (context, day, focusedDay) {
                    final status = _attendance[DateTime(day.year, day.month, day.day)];
                    if (status == null) return null;
                    return Container(
                      margin: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: _getDayColor(status).withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${day.day}',
                          style: TextStyle(
                            color: _getDayColor(status),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildRow(theme, 'Total Days', '22'),
                  _buildRow(theme, 'Present', '18', color: const Color(0xFF10B981)),
                  _buildRow(theme, 'Absent', '2', color: const Color(0xFFEF4444)),
                  _buildRow(theme, 'Late', '1', color: const Color(0xFFF59E0B)),
                  const Divider(),
                  _buildRow(theme, 'Percentage', '90%', color: theme.colorScheme.primary),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(ThemeData theme, String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodyMedium),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
