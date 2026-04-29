import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/status_badge.dart';

class TeacherQAScreen extends ConsumerStatefulWidget {
  const TeacherQAScreen({super.key});

  @override
  ConsumerState<TeacherQAScreen> createState() => _TeacherQAScreenState();
}

class _TeacherQAScreenState extends ConsumerState<TeacherQAScreen> {
  int _filter = 0;
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _questions = [
    {
      'student': 'Ahmad Ali',
      'subject': 'Mathematics',
      'question': 'How do I solve quadratic equations?',
      'date': '2 hours ago',
      'answered': false,
      'answer': '',
    },
    {
      'student': 'Fatima Zahra',
      'subject': 'Science',
      'question': 'What is photosynthesis?',
      'date': 'Yesterday',
      'answered': true,
      'answer': 'Photosynthesis is the process by which plants use sunlight to synthesize foods.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filtered = _questions.where((q) {
      if (_filter == 0) return true;
      if (_filter == 1) return q['answered'];
      return !q['answered'];
    }).toList();

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'سوالات' : 'Q&A',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<int>(
              segments: [
                ButtonSegment(value: 0, label: Text(_isUrdu ? 'سب' : 'All')),
                ButtonSegment(value: 1, label: Text(_isUrdu ? 'جواب دیا' : 'Answered')),
                ButtonSegment(value: 2, label: Text(_isUrdu ? 'بغیر جواب' : 'Unanswered')),
              ],
              selected: {_filter},
              onSelectionChanged: (v) => setState(() => _filter = v.first),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final q = filtered[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                  ),
                  child: InkWell(
                    onTap: () => _showAnswerDialog(q),
                    borderRadius: BorderRadius.circular(16),
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
                                  color: theme.colorScheme.secondaryContainer,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  q['subject'],
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: theme.colorScheme.secondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              StatusBadge(
                                label: q['answered'] ? 'Answered' : 'Unanswered',
                                type: q['answered'] ? StatusType.success : StatusType.warning,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            q['question'],
                            style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.person_outline, size: 14, color: theme.colorScheme.onSurfaceVariant),
                              const SizedBox(width: 4),
                              Text(q['student'], style: theme.textTheme.bodySmall),
                              const SizedBox(width: 16),
                              Icon(Icons.access_time, size: 14, color: theme.colorScheme.onSurfaceVariant),
                              const SizedBox(width: 4),
                              Text(q['date'], style: theme.textTheme.bodySmall),
                            ],
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
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showAnswerDialog(Map<String, dynamic> q) {
    final answerController = TextEditingController(text: q['answer']);
    bool makePublic = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 16,
            right: 16,
            top: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                q['question'],
                style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              CustomTextField(
                label: _isUrdu ? 'آپ کا جواب' : 'Your Answer',
                controller: answerController,
                maxLines: 4,
              ),
              const SizedBox(height: 8),
              CheckboxListTile(
                title: Text(_isUrdu ? 'عوامی بنائیں' : 'Make Public'),
                value: makePublic,
                onChanged: (v) => setState(() => makePublic = v!),
                controlAffinity: ListTileControlAffinity.leading,
              ),
              const SizedBox(height: 16),
              CustomButton(
                label: _isUrdu ? 'جواب بھیجیں' : 'Submit Answer',
                onPressed: () => Navigator.of(ctx).pop(),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
