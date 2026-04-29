import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_dropdown.dart';

class TeacherMarksScreen extends ConsumerStatefulWidget {
  const TeacherMarksScreen({super.key});

  @override
  ConsumerState<TeacherMarksScreen> createState() => _TeacherMarksScreenState();
}

class _TeacherMarksScreenState extends ConsumerState<TeacherMarksScreen> {
  String? _selectedClass;
  String? _selectedSection;
  String? _selectedSubject;
  String? _selectedExam;
  bool _isLoading = false;
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _students = [
    {'name': 'Ahmad Ali', 'roll': 101, 'marks': 18, 'max': 20},
    {'name': 'Bilal Khan', 'roll': 102, 'marks': 15, 'max': 20},
    {'name': 'Fatima Zahra', 'roll': 103, 'marks': 20, 'max': 20},
    {'name': 'Hassan Raza', 'roll': 104, 'marks': 8, 'max': 20},
    {'name': 'Imran Shah', 'roll': 105, 'marks': 12, 'max': 20},
  ];

  String _calculateGrade(double percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  Color _gradeColor(String grade) {
    switch (grade) {
      case 'A+': return const Color(0xFF10B981);
      case 'A': return const Color(0xFF10B981);
      case 'B': return const Color(0xFF3B82F6);
      case 'C': return const Color(0xFFF59E0B);
      case 'D': return const Color(0xFFF59E0B);
      case 'F': return const Color(0xFFEF4444);
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'نمبر درج کریں' : 'Marks Entry',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                SizedBox(
                  width: 140,
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
                SizedBox(
                  width: 140,
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
                SizedBox(
                  width: 160,
                  child: CustomDropdown<String>(
                    label: _isUrdu ? 'مضمون' : 'Subject',
                    value: _selectedSubject,
                    items: const [
                      DropdownMenuItem(value: 'math', child: Text('Mathematics')),
                      DropdownMenuItem(value: 'science', child: Text('Science')),
                      DropdownMenuItem(value: 'physics', child: Text('Physics')),
                    ],
                    onChanged: (v) => setState(() => _selectedSubject = v),
                  ),
                ),
                SizedBox(
                  width: 160,
                  child: CustomDropdown<String>(
                    label: _isUrdu ? 'امتحان' : 'Exam',
                    value: _selectedExam,
                    items: const [
                      DropdownMenuItem(value: 'mid1', child: Text('Mid-Term 1')),
                      DropdownMenuItem(value: 'mid2', child: Text('Mid-Term 2')),
                      DropdownMenuItem(value: 'final', child: Text('Final')),
                    ],
                    onChanged: (v) => setState(() => _selectedExam = v),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: MaterialStatePropertyAll(theme.colorScheme.primaryContainer.withOpacity(0.3)),
                columns: [
                  DataColumn(label: Text(_isUrdu ? 'رول نمبر' : 'Roll No')),
                  DataColumn(label: Text(_isUrdu ? 'نام' : 'Name')),
                  DataColumn(label: Text(_isUrdu ? 'نمبر' : 'Marks')),
                  DataColumn(label: Text(_isUrdu ? 'فیصد' : '%')),
                  DataColumn(label: Text(_isUrdu ? 'گریڈ' : 'Grade')),
                ],
                rows: _students.map((s) {
                  final percentage = (s['marks'] / s['max'] * 100);
                  final grade = _calculateGrade(percentage);
                  return DataRow(
                    cells: [
                      DataCell(Text(s['roll'].toString())),
                      DataCell(Text(s['name'])),
                      DataCell(
                        SizedBox(
                          width: 60,
                          child: TextFormField(
                            initialValue: s['marks'].toString(),
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            onChanged: (v) {
                              setState(() => s['marks'] = int.tryParse(v) ?? 0);
                            },
                          ),
                        ),
                      ),
                      DataCell(Text('${percentage.toStringAsFixed(1)}%')),
                      DataCell(
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _gradeColor(grade).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            grade,
                            style: TextStyle(
                              color: _gradeColor(grade),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: CustomButton(
              label: _isUrdu ? 'نمبر محفوظ کریں' : 'Save Marks',
              isLoading: _isLoading,
              onPressed: () {
                setState(() => _isLoading = true);
                Future.delayed(const Duration(seconds: 1), () {
                  setState(() => _isLoading = false);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(_isUrdu ? 'نمبر محفوظ ہو گئے' : 'Marks saved successfully')),
                  );
                });
              },
            ),
          ),
        ],
      ),
    );
  }
}
