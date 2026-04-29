import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';

class StudentTimetableScreen extends ConsumerStatefulWidget {
  const StudentTimetableScreen({super.key});

  @override
  ConsumerState<StudentTimetableScreen> createState() => _StudentTimetableScreenState();
}

class _StudentTimetableScreenState extends ConsumerState<StudentTimetableScreen> {
  bool _isUrdu = false;
  final List<String> _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  final List<String> _periods = [
    '08:00
08:45',
    '09:00
09:45',
    '10:00
10:45',
    '11:00
11:45',
    '12:00
12:45',
    '13:00
13:45',
  ];

  final List<List<Map<String, dynamic>?>> _schedule = [
    [
      {'subject': 'Math', 'teacher': 'Mr. Ali', 'room': '101'},
      {'subject': 'Science', 'teacher': 'Mrs. Fatima', 'room': 'Lab2'},
      {'subject': 'English', 'teacher': 'Mr. Khan', 'room': '103'},
      {'subject': 'Urdu', 'teacher': 'Mrs. Hassan', 'room': '104'},
      {'subject': 'Pak Studies', 'teacher': 'Mr. Raza', 'room': '105'},
      null,
    ],
    [
      {'subject': 'Science', 'teacher': 'Mrs. Fatima', 'room': 'Lab2'},
      {'subject': 'Math', 'teacher': 'Mr. Ali', 'room': '101'},
      {'subject': 'English', 'teacher': 'Mr. Khan', 'room': '103'},
      null,
      {'subject': 'Math', 'teacher': 'Mr. Ali', 'room': '101'},
      {'subject': 'Urdu', 'teacher': 'Mrs. Hassan', 'room': '104'},
    ],
    [
      {'subject': 'English', 'teacher': 'Mr. Khan', 'room': '103'},
      {'subject': 'Urdu', 'teacher': 'Mrs. Hassan', 'room': '104'},
      {'subject': 'Math', 'teacher': 'Mr. Ali', 'room': '101'},
      {'subject': 'Science', 'teacher': 'Mrs. Fatima', 'room': 'Lab2'},
      null,
      {'subject': 'Pak Studies', 'teacher': 'Mr. Raza', 'room': '105'},
    ],
    [
      {'subject': 'Math', 'teacher': 'Mr. Ali', 'room': '101'},
      {'subject': 'Pak Studies', 'teacher': 'Mr. Raza', 'room': '105'},
      {'subject': 'Science', 'teacher': 'Mrs. Fatima', 'room': 'Lab2'},
      {'subject': 'English', 'teacher': 'Mr. Khan', 'room': '103'},
      {'subject': 'Urdu', 'teacher': 'Mrs. Hassan', 'room': '104'},
      null,
    ],
    [
      {'subject': 'Urdu', 'teacher': 'Mrs. Hassan', 'room': '104'},
      {'subject': 'English', 'teacher': 'Mr. Khan', 'room': '103'},
      {'subject': 'Math', 'teacher': 'Mr. Ali', 'room': '101'},
      {'subject': 'Science', 'teacher': 'Mrs. Fatima', 'room': 'Lab2'},
      null,
      null,
    ],
    [
      {'subject': 'Pak Studies', 'teacher': 'Mr. Raza', 'room': '105'},
      null,
      null,
      null,
      null,
      null,
    ],
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();
    final todayIndex = now.weekday - 1;
    final currentPeriod = now.hour >= 8 && now.hour < 14 ? now.hour - 8 : -1;

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'میرا شیڈول' : 'My Timetable',
        isUrdu: _isUrdu,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(8),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: MaterialStatePropertyAll(theme.colorScheme.primaryContainer.withOpacity(0.3)),
            border: TableBorder.all(
              color: theme.colorScheme.outlineVariant.withOpacity(0.5),
              width: 1,
            ),
            columns: [
              DataColumn(label: Text(_isUrdu ? 'پیریڈ' : 'Period')),
              ..._days.map((d) => DataColumn(
                label: Text(
                  d,
                  style: TextStyle(
                    fontWeight: todayIndex >= 0 && _days[todayIndex] == d
                        ? FontWeight.bold
                        : FontWeight.normal,
                    color: todayIndex >= 0 && _days[todayIndex] == d
                        ? theme.colorScheme.primary
                        : null,
                  ),
                ),
              )),
            ],
            rows: List.generate(_periods.length, (periodIndex) {
              final isCurrentPeriod = todayIndex >= 0 &&
                  todayIndex < _days.length &&
                  periodIndex == currentPeriod;
              return DataRow(
                color: isCurrentPeriod
                    ? MaterialStatePropertyAll(theme.colorScheme.primaryContainer.withOpacity(0.3))
                    : null,
                cells: [
                  DataCell(
                    Container(
                      padding: const EdgeInsets.all(8),
                      child: Text(
                        _periods[periodIndex],
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: isCurrentPeriod ? FontWeight.bold : null,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                  ...List.generate(_days.length, (dayIndex) {
                    final cell = _schedule[dayIndex][periodIndex];
                    final isCurrent = todayIndex == dayIndex && periodIndex == currentPeriod;
                    return DataCell(
                      cell != null
                          ? Container(
                              width: 100,
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isCurrent
                                    ? theme.colorScheme.primary.withOpacity(0.15)
                                    : theme.colorScheme.primaryContainer.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                                border: isCurrent
                                    ? Border.all(color: theme.colorScheme.primary, width: 2)
                                    : null,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    cell['subject'],
                                    style: theme.textTheme.labelMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: isCurrent ? theme.colorScheme.primary : null,
                                    ),
                                  ),
                                  Text(cell['teacher'], style: theme.textTheme.bodySmall),
                                  Text(cell['room'], style: theme.textTheme.labelSmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  )),
                                ],
                              ),
                            )
                          : const SizedBox(width: 100, height: 60),
                    );
                  }),
                ],
              );
            }),
          ),
        ),
      ),
    );
  }
}
