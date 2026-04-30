import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/locale_provider.dart';
import '../../providers/qa_provider.dart';
import '../../utils/app_localizations.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';

class StudentQaScreen extends ConsumerStatefulWidget {
  const StudentQaScreen({super.key});
  @override
  ConsumerState<StudentQaScreen> createState() => _StudentQaScreenState();
}

class _StudentQaScreenState extends ConsumerState<StudentQaScreen> {
  final TextEditingController _questionController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _addQuestion() async {
    if (_questionController.text.isEmpty) return;
    setState(() => _isSubmitting = true);
    final success = await ref.read(qaProvider.notifier).askQuestion(
      question: _questionController.text,
      category: 'student',
    );
    setState(() => _isSubmitting = false);
    if (success && mounted) {
      _questionController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_t('question_submitted'))),
      );
    }
  }

  String _t(String key) {
    final localizations = AppLocalizations.of(context);
    return localizations?.translate(key) ?? key;
  }

  @override
  void dispose() { _questionController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    final qaAsync = ref.watch(qaProvider);

    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: _t('q_and_a'),
          isUrdu: isUrdu,
        ),
        body: Column(
          children: [
            Expanded(
              child: qaAsync.when(
                data: (questions) {
                  if (questions.isEmpty) {
                    return EmptyStateWidget(
                      icon: Icons.question_answer_outlined,
                      title: _t('no_questions'),
                      subtitle: _t('no_questions_yet'),
                    );
                  }
                  return RefreshIndicator(
                    onRefresh: () => ref.read(qaProvider.notifier).loadQuestions(),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: questions.length,
                      itemBuilder: (context, index) {
                        final qa = questions[index];
                        return Card(
                          elevation: 0,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ExpansionTile(
                            title: Text(qa.question, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                            subtitle: Text(
                              '${qa.askedByName} • ${qa.createdAt.day}/${qa.createdAt.month}/${qa.createdAt.year}',
                              style: theme.textTheme.bodySmall,
                            ),
                            trailing: qa.isPending
                                ? Chip(
                                    label: Text(_t('pending')),
                                    backgroundColor: theme.colorScheme.secondaryContainer,
                                    side: BorderSide.none,
                                  )
                                : Icon(Icons.check_circle, color: theme.colorScheme.primary),
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (qa.answer != null && qa.answer!.isNotEmpty) ...[
                                      Text(
                                        qa.answer!,
                                        style: theme.textTheme.bodyMedium,
                                      ),
                                      const SizedBox(height: 8),
                                      if (qa.answeredByName != null)
                                        Text(
                                          '${_t('answered_by')}: ${qa.answeredByName}',
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: theme.colorScheme.onSurfaceVariant,
                                          ),
                                        ),
                                    ] else
                                      Text(
                                        _t('no_answer_yet'),
                                        style: theme.textTheme.bodyMedium?.copyWith(
                                          color: theme.colorScheme.onSurfaceVariant,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  );
                },
                loading: () => const Center(child: LoadingWidget()),
                error: (e, _) => AppErrorWidget(message: e.toString(), onRetry: () => ref.read(qaProvider.notifier).loadQuestions()),
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
                        hintText: _t('ask_question'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _isSubmitting
                      ? const SizedBox(width: 48, height: 48, child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
                      : IconButton(
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
