import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';

class StudentAttendanceScreen extends ConsumerStatefulWidget {
  const StudentAttendanceScreen({super.key});

  @override
  ConsumerState<StudentAttendanceScreen> createState() => _StudentAttendanceScreenState();
}

class _StudentAttendanceScreenState extends ConsumerState<StudentAttendanceScreen> {
  bool _isUrdu = false;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  final Map<DateTime, String> _attendance = {
    DateTime(2024, 3, 1): 'present',
    DateTime(2024, 3, 4): 'present',
    DateTime(2024, 3, 5): 'absent',
    DateTime(2024, 3, 6): 'late',
    DateTime(2024, 3, 7): 'leave',
    DateTime(2024, 3, 8): 'present',
    DateTime(2024, 3, 11): 'present',
    DateTime(2024, 3, 12): 'present',
    DateTime(2024, 3, 13): 'absent',
    DateTime(2024, 3, 14): 'present',
    DateTime(2024, 3, 15): 'present',
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'میری حاضری' : 'My Attendance',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: TableCalendar(
                firstDay: DateTime(2024, 1, 1),
                lastDay: DateTime(2024, 12, 31),
                focusedDay: _focusedDay,
                selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                onDaySelected: (selected, focused) {
                  setState(() {
                    _selectedDay = selected;
                    _focusedDay = focused;
                  });
                },
                onPageChanged: (focused) => setState(() => _focusedDay = focused),
                calendarStyle: CalendarStyle(
                  cellMargin: const EdgeInsets.all(4),
                  todayDecoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  todayTextStyle: TextStyle(color: theme.colorScheme.onSurface),
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
                headerStyle: HeaderStyle(
                  formatButtonVisible: false,
                  titleCentered: true,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _isUrdu ? 'مہانہ خلاصہ' : 'Monthly Summary',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
            childAspectRatio: 1.5,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: const [
              StatsCard(icon: Icons.event_available, value: '18', label: 'Present Days', color: Color(0xFF10B981)),
              StatsCard(icon: Icons.event_busy, value: '2', label: 'Absent Days', color: Color(0xFFEF4444)),
              StatsCard(icon: Icons.access_time, value: '1', label: 'Late Days', color: Color(0xFFF59E0B)),
              StatsCard(icon: Icons.beach_access, value: '1', label: 'Leave Days', color: Color(0xFF3B82F6)),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.percent, color: theme.colorScheme.primary),
                  const SizedBox(width: 12),
                  Text(
                    _isUrdu ? 'حاضری فیصد: 90%' : 'Attendance Percentage: 90%',
                    style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _buildLegend('Present', const Color(0xFF10B981)),
              _buildLegend('Absent', const Color(0xFFEF4444)),
              _buildLegend('Late', const Color(0xFFF59E0B)),
              _buildLegend('Leave', const Color(0xFF3B82F6)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(String label, Color color) {
    return Expanded(
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}
