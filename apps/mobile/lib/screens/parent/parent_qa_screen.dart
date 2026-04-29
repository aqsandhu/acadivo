import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/empty_state_widget.dart';

class ParentQAScreen extends ConsumerStatefulWidget {
  const ParentQAScreen({super.key});

  @override
  ConsumerState<ParentQAScreen> createState() => _ParentQAScreenState();
}

class _ParentQAScreenState extends ConsumerState<ParentQAScreen> {
  bool _isUrdu = false;
  String? _selectedChild;
  String? _selectedTeacher;
  final _questionController = TextEditingController();

  final List<Map<String, dynamic>> _history = [
    {'child': 'Ahmad Ali', 'teacher': 'Mr. Ali', 'question': 'How is Ahmad performing in Math?', 'answer': 'He is doing well, scored 85/100.', 'date': '10 Mar'},
    {'child': 'Ahmad Ali', 'teacher': 'Mrs. Fatima', 'question': 'Is Ahmad attending regularly?', 'answer': 'Yes, 95% attendance.', 'date': '05 Mar'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'استاد سے پوچھیں' : 'Ask Teacher',
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
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  CustomDropdown<String>(
                    label: _isUrdu ? 'بچہ' : 'Child',
                    value: _selectedChild,
                    items: const [
                      DropdownMenuItem(value: '1', child: Text('Ahmad Ali')),
                      DropdownMenuItem(value: '2', child: Text('Fatima Ali')),
                    ],
                    onChanged: (v) => setState(() => _selectedChild = v),
                  ),
                  const SizedBox(height: 12),
                  CustomDropdown<String>(
                    label: _isUrdu ? 'استاد' : 'Teacher',
                    value: _selectedTeacher,
                    items: const [
                      DropdownMenuItem(value: '1', child: Text('Mr. Ali - Math')),
                      DropdownMenuItem(value: '2', child: Text('Mrs. Fatima - Science')),
                    ],
                    onChanged: (v) => setState(() => _selectedTeacher = v),
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    label: _isUrdu ? 'سوال' : 'Question',
                    controller: _questionController,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    label: _isUrdu ? 'بھیجیں' : 'Send',
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(_isUrdu ? 'سوال بھیج دیا گیا' : 'Question sent')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            _isUrdu ? 'سوالوں کی تاریخ' : 'Question History',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          if (_history.isEmpty)
            EmptyStateWidget(
              icon: Icons.history,
              title: _isUrdu ? 'کوئی تاریخ نہیں' : 'No History',
              subtitle: '',
            )
          else
            ..._history.map((h) => Card(
              elevation: 0,
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          h['child'],
                          style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.primary),
                        ),
                        const SizedBox(width: 8),
                        Text('•', style: theme.textTheme.bodySmall),
                        const SizedBox(width: 8),
                        Text(h['teacher'], style: theme.textTheme.bodySmall),
                        const Spacer(),
                        Text(h['date'], style: theme.textTheme.bodySmall),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      h['question'],
                      style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primaryContainer.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(h['answer']),
                    ),
                  ],
                ),
              ),
            )).toList(),
        ],
      ),
    );
  }
}
