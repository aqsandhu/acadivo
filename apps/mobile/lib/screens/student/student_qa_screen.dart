import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/empty_state_widget.dart';

class StudentQAScreen extends ConsumerStatefulWidget {
  const StudentQAScreen({super.key});

  @override
  ConsumerState<StudentQAScreen> createState() => _StudentQAScreenState();
}

class _StudentQAScreenState extends ConsumerState<StudentQAScreen> {
  bool _isUrdu = false;
  final List<Map<String, dynamic>> _myQuestions = [
    {'question': 'How do I solve quadratic equations?', 'subject': 'Math', 'teacher': 'Mr. Ali', 'answered': true, 'answer': 'Use the formula x = (-b ± √(b²-4ac))/2a'},
    {'question': 'What is the difference between mitosis and meiosis?', 'subject': 'Biology', 'teacher': 'Mrs. Fatima', 'answered': false, 'answer': ''},
  ];

  final List<Map<String, dynamic>> _publicQA = [
    {'question': 'What is photosynthesis?', 'answer': 'Process by which plants make food using sunlight', 'subject': 'Science'},
    {'question': 'How to find the area of a circle?', 'answer': 'A = πr²', 'subject': 'Math'},
  ];

  void _showAskDialog() {
    final questionController = TextEditingController();
    String? selectedTeacher;
    String? selectedSubject;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 16, right: 16, top: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isUrdu ? 'سوال پوچھیں' : 'Ask a Question',
                style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              CustomDropdown<String>(
                label: _isUrdu ? 'استاد' : 'Teacher',
                value: selectedTeacher,
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Mr. Ali - Math')),
                  DropdownMenuItem(value: '2', child: Text('Mrs. Fatima - Science')),
                  DropdownMenuItem(value: '3', child: Text('Mr. Khan - English')),
                ],
                onChanged: (v) => setState(() => selectedTeacher = v),
              ),
              const SizedBox(height: 12),
              CustomDropdown<String>(
                label: _isUrdu ? 'مضمون' : 'Subject',
                value: selectedSubject,
                items: const [
                  DropdownMenuItem(value: 'math', child: Text('Mathematics')),
                  DropdownMenuItem(value: 'science', child: Text('Science')),
                  DropdownMenuItem(value: 'english', child: Text('English')),
                ],
                onChanged: (v) => setState(() => selectedSubject = v),
              ),
              const SizedBox(height: 12),
              CustomTextField(
                label: _isUrdu ? 'سوال' : 'Question',
                controller: questionController,
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              CustomButton(
                label: _isUrdu ? 'بھیجیں' : 'Send',
                onPressed: () => Navigator.of(ctx).pop(),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: CustomAppBar(
          title: _isUrdu ? 'سوالات' : 'Ask Questions',
          bottom: TabBar(
            tabs: [
              Tab(text: _isUrdu ? 'میرے سوالات' : 'My Questions'),
              Tab(text: _isUrdu ? 'عوامی Q&A' : 'Public Q&A'),
            ],
          ),
          isUrdu: _isUrdu,
        ),
        body: TabBarView(
          children: [
            _myQuestions.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.help_outline,
                    title: _isUrdu ? 'کوئی سوالات نہیں' : 'No Questions',
                    subtitle: _isUrdu ? 'اپنا پہلا سوال پوچھیں' : 'Ask your first question',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _myQuestions.length,
                    itemBuilder: (context, index) {
                      final q = _myQuestions[index];
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.primaryContainer,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      q['subject'],
                                      style: theme.textTheme.labelSmall?.copyWith(
                                        color: theme.colorScheme.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  if (q['answered'])
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF10B981).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        'Answered',
                                        style: TextStyle(
                                          color: Color(0xFF10B981),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    )
                                  else
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF59E0B).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        'Pending',
                                        style: TextStyle(
                                          color: Color(0xFFF59E0B),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                q['question'],
                                style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                              ),
                              if (q['answered']) ...[
                                const SizedBox(height: 12),
                                const Divider(),
                                const SizedBox(height: 8),
                                Text(
                                  q['answer'],
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
            ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _publicQA.length,
              itemBuilder: (context, index) {
                final q = _publicQA[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                  ),
                  child: ExpansionTile(
                    title: Text(q['question']),
                    subtitle: Text(q['subject'], style: theme.textTheme.bodySmall),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(
                          q['answer'],
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: _showAskDialog,
          icon: const Icon(Icons.add),
          label: Text(_isUrdu ? 'سوال پوچھیں' : 'Ask Question'),
        ),
      ),
    );
  }
}
