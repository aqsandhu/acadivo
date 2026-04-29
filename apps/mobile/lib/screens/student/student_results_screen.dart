import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';

class StudentResultsScreen extends ConsumerStatefulWidget {
  const StudentResultsScreen({super.key});

  @override
  ConsumerState<StudentResultsScreen> createState() => _StudentResultsScreenState();
}

class _StudentResultsScreenState extends ConsumerState<StudentResultsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _results = [
    {
      'term': 'First Term 2024',
      'subjects': [
        {'name': 'Mathematics', 'marks': 85, 'total': 100, 'grade': 'A'},
        {'name': 'Science', 'marks': 78, 'total': 100, 'grade': 'B'},
        {'name': 'English', 'marks': 92, 'total': 100, 'grade': 'A+'},
        {'name': 'Urdu', 'marks': 88, 'total': 100, 'grade': 'A'},
        {'name': 'Pakistan Studies', 'marks': 75, 'total': 100, 'grade': 'B'},
      ],
      'percentage': 83.6,
    },
    {
      'term': 'Second Term 2024',
      'subjects': [
        {'name': 'Mathematics', 'marks': 90, 'total': 100, 'grade': 'A+'},
        {'name': 'Science', 'marks': 82, 'total': 100, 'grade': 'A'},
        {'name': 'English', 'marks': 88, 'total': 100, 'grade': 'A'},
        {'name': 'Urdu', 'marks': 85, 'total': 100, 'grade': 'A'},
        {'name': 'Pakistan Studies', 'marks': 80, 'total': 100, 'grade': 'A'},
      ],
      'percentage': 85.0,
    },
  ];

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
        title: _isUrdu ? 'میرے نتائج' : 'My Results',
        isUrdu: _isUrdu,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _results.length,
        itemBuilder: (context, index) {
          final r = _results[index];
          return Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
            ),
            child: ExpansionTile(
              title: Text(r['term']),
              subtitle: Text(
                '${_isUrdu ? 'فیصد' : 'Percentage'}: ${r['percentage']}%',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Column(
                    children: [
                      ...r['subjects'].map<Widget>((s) {
                        return ListTile(
                          title: Text(s['name']),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${s['marks']}/${s['total']}',
                                style: theme.textTheme.bodyMedium,
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _gradeColor(s['grade']).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  s['grade'],
                                  style: TextStyle(
                                    color: _gradeColor(s['grade']),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                      const SizedBox(height: 12),
                      CustomButton(
                        label: _isUrdu ? 'PDF ڈاؤن لوڈ' : 'Download PDF',
                        variant: ButtonVariant.outlined,
                        icon: Icons.download,
                        onPressed: () {},
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
