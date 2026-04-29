import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';

class TeacherTimetableScreen extends ConsumerStatefulWidget {
  const TeacherTimetableScreen({super.key});

  @override
  ConsumerState<TeacherTimetableScreen> createState() => _TeacherTimetableScreenState();
}

class _TeacherTimetableScreenState extends ConsumerState<TeacherTimetableScreen> {
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
      {'subject': 'Math', 'class': '8-A', 'room': '101'},
      {'subject': 'Math', 'class': '9-B', 'room': '102'},
      null,
      {'subject': 'Physics', 'class': '10-A', 'room': 'Lab1'},
      {'subject': 'Math', 'class': '8-B', 'room': '103'},
      null,
    ],
    [
      null,
      {'subject': 'Science', 'class': '7-A', 'room': 'Lab2'},
      {'subject': 'Math', 'class': '8-A', 'room': '101'},
      null,
      {'subject': 'Physics', 'class': '10-B', 'room': 'Lab1'},
      {'subject': 'Math', 'class': '9-C', 'room': '104'},
    ],
    [
      {'subject': 'Math', 'class': '8-C', 'room': '105'},
      null,
      {'subject': 'Science', 'class': '7-B', 'room': 'Lab2'},
      {'subject': 'Math', 'class': '9-A', 'room': '102'},
      null,
      {'subject': 'Physics', 'class': '10-C', 'room': 'Lab1'},
    ],
    [
      {'subject': 'Physics', 'class': '10-A', 'room': 'Lab1'},
      {'subject': 'Math', 'class': '8-A', 'room': '101'},
      null,
      {'subject': 'Science', 'class': '7-C', 'room': 'Lab2'},
      {'subject': 'Math', 'class': '9-B', 'room': '103'},
      null,
    ],
    [
      null,
      {'subject': 'Math', 'class': '8-B', 'room': '104'},
      {'subject': 'Physics', 'class': '10-B', 'room': 'Lab1'},
      null,
      {'subject': 'Science', 'class': '7-A', 'room': 'Lab2'},
      {'subject': 'Math', 'class': '9-C', 'room': '105'},
    ],
    [
      {'subject': 'Math', 'class': '8-C', 'room': '101'},
      {'subject': 'Science', 'class': '7-B', 'room': 'Lab2'},
      null,
      null,
      null,
      null,
    ],
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final todayIndex = DateTime.now().weekday - 1;
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'شیڈول' : 'Timetable',
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
              return DataRow(
                cells: [
                  DataCell(
                    Container(
                      padding: const EdgeInsets.all(8),
                      child: Text(
                        _periods[periodIndex],
                        style: theme.textTheme.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                  ...List.generate(_days.length, (dayIndex) {
                    final cell = _schedule[dayIndex][periodIndex];
                    return DataCell(
                      cell != null
                          ? InkWell(
                              onTap: () => _showCellDetail(cell),
                              child: Container(
                                width: 100,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primaryContainer.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      cell['subject'],
                                      style: theme.textTheme.labelMedium?.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: theme.colorScheme.primary,
                                      ),
                                    ),
                                    Text(cell['class'], style: theme.textTheme.bodySmall),
                                    Text(cell['room'], style: theme.textTheme.labelSmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    )),
                                  ],
                                ),
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

  void _showCellDetail(Map<String, dynamic> cell) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(cell['subject']),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Class: ${cell['class']}'),
            Text('Room: ${cell['room']}'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Close')),
        ],
      ),
    );
  }
}
