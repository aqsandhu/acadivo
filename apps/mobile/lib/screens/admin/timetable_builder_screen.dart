import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_dropdown.dart';

class TimetableBuilderScreen extends ConsumerStatefulWidget {
  const TimetableBuilderScreen({super.key});

  @override
  ConsumerState<TimetableBuilderScreen> createState() => _TimetableBuilderScreenState();
}

class _TimetableBuilderScreenState extends ConsumerState<TimetableBuilderScreen> {
  bool _isUrdu = false;
  String? _selectedClass;
  String? _selectedSection;

  final List<String> _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  final List<String> _periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

  final List<List<Map<String, dynamic>?>> _timetable = List.generate(
    6,
    (_) => List.generate(6, (_) => null),
  );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'شیڈول بنائیں' : 'Timetable Builder',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
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
                      DropdownMenuItem(value: 'A', child: Text('A')),
                      DropdownMenuItem(value: 'B', child: Text('B')),
                      DropdownMenuItem(value: 'C', child: Text('C')),
                    ],
                    onChanged: (v) => setState(() => _selectedSection = v),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  border: TableBorder.all(
                    color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                  ),
                  columns: [
                    DataColumn(label: Text(_isUrdu ? 'پیریڈ' : 'Period')),
                    ..._days.map((d) => DataColumn(label: Text(d))),
                  ],
                  rows: List.generate(_periods.length, (pIndex) {
                    return DataRow(
                      cells: [
                        DataCell(Text(_periods[pIndex])),
                        ...List.generate(_days.length, (dIndex) {
                          final cell = _timetable[dIndex][pIndex];
                          return DataCell(
                            InkWell(
                              onTap: () => _showAssignDialog(dIndex, pIndex),
                              child: Container(
                                width: 80,
                                height: 50,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: cell != null
                                      ? theme.colorScheme.primaryContainer.withOpacity(0.3)
                                      : null,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: cell != null
                                    ? Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(cell['subject'], style: theme.textTheme.labelSmall),
                                          Text(cell['teacher'], style: theme.textTheme.labelSmall?.copyWith(
                                            color: theme.colorScheme.onSurfaceVariant,
                                          )),
                                        ],
                                      )
                                    : const Icon(Icons.add, color: Colors.grey),
                              ),
                            ),
                          );
                        }),
                      ],
                    );
                  }),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: FilledButton(
              onPressed: () {},
              style: FilledButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
              child: Text(_isUrdu ? 'شیڈول محفوظ کریں' : 'Save Timetable'),
            ),
          ),
        ],
      ),
    );
  }

  void _showAssignDialog(int day, int period) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Assign Period'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Mathematics - Mr. Ali'),
              onTap: () {
                setState(() => _timetable[day][period] = {'subject': 'Math', 'teacher': 'Mr. Ali'});
                Navigator.of(ctx).pop();
              },
            ),
            ListTile(
              title: const Text('Science - Mrs. Fatima'),
              onTap: () {
                setState(() => _timetable[day][period] = {'subject': 'Science', 'teacher': 'Mrs. Fatima'});
                Navigator.of(ctx).pop();
              },
            ),
            ListTile(
              title: const Text('English - Mr. Khan'),
              onTap: () {
                setState(() => _timetable[day][period] = {'subject': 'English', 'teacher': 'Mr. Khan'});
                Navigator.of(ctx).pop();
              },
            ),
          ],
        ),
      ),
    );
  }
}
