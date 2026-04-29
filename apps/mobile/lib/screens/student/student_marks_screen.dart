import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_dropdown.dart';

class StudentMarksScreen extends ConsumerStatefulWidget {
  const StudentMarksScreen({super.key});

  @override
  ConsumerState<StudentMarksScreen> createState() => _StudentMarksScreenState();
}

class _StudentMarksScreenState extends ConsumerState<StudentMarksScreen> {
  bool _isUrdu = false;
  String? _selectedExam;

  final List<Map<String, dynamic>> _marks = [
    {'subject': 'Mathematics', 'exam': 'Mid-Term 1', 'marks': 85, 'total': 100},
    {'subject': 'Science', 'exam': 'Mid-Term 1', 'marks': 78, 'total': 100},
    {'subject': 'English', 'exam': 'Mid-Term 1', 'marks': 92, 'total': 100},
    {'subject': 'Urdu', 'exam': 'Mid-Term 1', 'marks': 88, 'total': 100},
    {'subject': 'Mathematics', 'exam': 'Mid-Term 2', 'marks': 90, 'total': 100},
    {'subject': 'Science', 'exam': 'Mid-Term 2', 'marks': 82, 'total': 100},
    {'subject': 'English', 'exam': 'Mid-Term 2', 'marks': 88, 'total': 100},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filtered = _selectedExam == null
        ? _marks
        : _marks.where((m) => m['exam'] == _selectedExam).toList();

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'میرے نمبر' : 'My Marks',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: CustomDropdown<String>(
              label: _isUrdu ? 'امتحان' : 'Exam',
              value: _selectedExam,
              items: const [
                DropdownMenuItem(value: null, child: Text('All')),
                DropdownMenuItem(value: 'Mid-Term 1', child: Text('Mid-Term 1')),
                DropdownMenuItem(value: 'Mid-Term 2', child: Text('Mid-Term 2')),
                DropdownMenuItem(value: 'Final', child: Text('Final')),
              ],
              onChanged: (v) => setState(() => _selectedExam = v),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: MaterialStatePropertyAll(theme.colorScheme.primaryContainer.withOpacity(0.3)),
                columns: [
                  DataColumn(label: Text(_isUrdu ? 'مضمون' : 'Subject')),
                  DataColumn(label: Text(_isUrdu ? 'امتحان' : 'Exam')),
                  DataColumn(label: Text(_isUrdu ? 'نمبر' : 'Marks')),
                  DataColumn(label: Text(_isUrdu ? 'فیصد' : '%')),
                ],
                rows: filtered.map((m) {
                  final pct = (m['marks'] / m['total'] * 100).toStringAsFixed(1);
                  return DataRow(
                    cells: [
                      DataCell(Text(m['subject'])),
                      DataCell(Text(m['exam'])),
                      DataCell(Text('${m['marks']}/${m['total']}')),
                      DataCell(Text('$pct%')),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
          Container(
            height: 200,
            padding: const EdgeInsets.all(16),
            child: Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
              ),
              child: Center(
                child: Text(
                  _isUrdu ? 'کارکردگی کا چارٹ یہاں نظر آئے گا' : 'Performance chart will appear here',
                  style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
