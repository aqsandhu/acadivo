import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/empty_state_widget.dart';

class ParentResultsScreen extends ConsumerStatefulWidget {
  const ParentResultsScreen({super.key});

  @override
  ConsumerState<ParentResultsScreen> createState() => _ParentResultsScreenState();
}

class _ParentResultsScreenState extends ConsumerState<ParentResultsScreen> {
  bool _isUrdu = false;
  String? _selectedChild;

  final List<Map<String, dynamic>> _results = [
    {
      'child': 'Ahmad Ali',
      'term': 'First Term 2024',
      'percentage': 83.6,
      'subjects': [
        {'name': 'Math', 'marks': 85},
        {'name': 'Science', 'marks': 78},
        {'name': 'English', 'marks': 92},
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'بچے کے نتائج' : 'Child Results',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: CustomDropdown<String>(
              label: _isUrdu ? 'بچہ منتخب کریں' : 'Select Child',
              value: _selectedChild,
              items: const [
                DropdownMenuItem(value: '1', child: Text('Ahmad Ali')),
                DropdownMenuItem(value: '2', child: Text('Fatima Ali')),
              ],
              onChanged: (v) => setState(() => _selectedChild = v),
            ),
          ),
          Expanded(
            child: _results.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.school_outlined,
                    title: _isUrdu ? 'کوئی نتائج نہیں' : 'No Results',
                    subtitle: '',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _results.length,
                    itemBuilder: (context, index) {
                      final r = _results[index];
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                        ),
                        child: ExpansionTile(
                          title: Text(r['term']),
                          subtitle: Text('Percentage: ${r['percentage']}%'),
                          children: [
                            ...r['subjects'].map<Widget>((s) {
                              return ListTile(
                                title: Text(s['name']),
                                trailing: Text('${s['marks']}/100'),
                              );
                            }).toList(),
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: CustomButton(
                                label: _isUrdu ? 'رپورٹ ڈاؤن لوڈ' : 'Download Report',
                                variant: ButtonVariant.outlined,
                                icon: Icons.download,
                                onPressed: () {},
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
