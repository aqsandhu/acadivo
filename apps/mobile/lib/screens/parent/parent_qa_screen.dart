import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

class ParentQaScreen extends ConsumerStatefulWidget {
  const ParentQaScreen({super.key});
  @override
  ConsumerState<ParentQaScreen> createState() => _ParentQaScreenState();
}

class _ParentQaScreenState extends ConsumerState<ParentQaScreen> {
  final TextEditingController _questionController = TextEditingController();
  final List<Map<String, dynamic>> _questions = [
    {'question': 'When is the next parent-teacher meeting?', 'answer': 'Scheduled for April 15th at 10 AM.', 'date': '2024-03-20'},
    {'question': 'How to pay fees online?', 'answer': 'You can pay through the fee section in the app.', 'date': '2024-03-18'},
  ];

  void _addQuestion() {
    if (_questionController.text.isEmpty) return;
    setState(() {
      _questions.add({
        'question': _questionController.text,
        'answer': '',
        'date': DateTime.now().toString().split(' ')[0],
      });
      _questionController.clear();
    });
  }

  @override
  void dispose() { _questionController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'سوال و جواب' : 'Q & A',
          isUrdu: isUrdu,
        ),
        body: Column(
          children: [
            Expanded(
              child: _questions.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.question_answer_outlined,
                    title: isUrdu ? 'کوئی سوال نہیں' : 'No Questions',
                    subtitle: isUrdu ? 'ابھی تک کوئی سوال نہیں پوچھا گیا' : 'No questions asked yet.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _questions.length,
                    itemBuilder: (context, index) {
                      final qa = _questions[index];
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ExpansionTile(
                          title: Text(qa['question'], style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                          subtitle: Text(qa['date'], style: theme.textTheme.bodySmall),
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Text(
                                qa['answer'].isEmpty ? (isUrdu ? 'ابھی تک جواب نہیں' : 'No answer yet') : qa['answer'],
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: qa['answer'].isEmpty ? theme.colorScheme.onSurfaceVariant : null,
                                  fontStyle: qa['answer'].isEmpty ? FontStyle.italic : FontStyle.normal,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                border: Border(top: BorderSide(color: theme.colorScheme.outlineVariant)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _questionController,
                      decoration: InputDecoration(
                        hintText: isUrdu ? 'سوال پوچھیں...' : 'Ask a question...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addQuestion,
                    icon: const Icon(Icons.send),
                    style: IconButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
