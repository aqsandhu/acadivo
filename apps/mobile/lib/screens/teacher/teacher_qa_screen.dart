import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/locale_provider.dart';
import '../../providers/qa_provider.dart';
import '../../utils/app_localizations.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';

class TeacherQaScreen extends ConsumerStatefulWidget {
  const TeacherQaScreen({super.key});
  @override
  ConsumerState<TeacherQaScreen> createState() => _TeacherQaScreenState();
}

class _TeacherQaScreenState extends ConsumerState<TeacherQaScreen> {
  final TextEditingController _questionController = TextEditingController();
  final TextEditingController _answerController = TextEditingController();
  String? _answeringQuestionId;
  bool _isSubmitting = false;

  Future<void> _addQuestion() async {
    if (_questionController.text.isEmpty) return;
    setState(() => _isSubmitting = true);
    final success = await ref.read(qaProvider.notifier).askQuestion(
      question: _questionController.text,
      category: 'teacher',
    );
    setState(() => _isSubmitting = false);
    if (success && mounted) {
      _questionController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_t('question_submitted'))),
      );
    }
  }

  Future<void> _answerQuestion(String questionId) async {
    if (_answerController.text.isEmpty) return;
    setState(() => _isSubmitting = true);
    final success = await ref.read(qaProvider.notifier).answerQuestion(
      id: questionId,
      answer: _answerController.text,
    );
    setState(() {
      _isSubmitting = false;
      _answeringQuestionId = null;
    });
    _answerController.clear();
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_t('answer_submitted'))),
      );
    }
  }

  String _t(String key) {
    final localizations = AppLocalizations.of(context);
    return localizations?.translate(key) ?? key;
  }

  @override
  void dispose() {
    _questionController.dispose();
    _answerController.dispose();
    super.dispose();
  }

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
                        final isAnswering = _answeringQuestionId == qa.id;
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
                                    backgroundColor: theme.colorScheme.errorContainer,
                                    side: BorderSide.none,
                                  )
                                : Chip(
                                    label: Text(_t('answered')),
                                    backgroundColor: theme.colorScheme.primaryContainer,
                                    side: BorderSide.none,
                                  ),
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
                                      const SizedBox(height: 12),
                                      if (qa.isPending || isAnswering)
                                        TextButton.icon(
                                          onPressed: () => setState(() => _answeringQuestionId = qa.id),
                                          icon: const Icon(Icons.edit),
                                          label: Text(_t('edit_answer')),
                                        ),
                                    ] else ...[
                                      if (isAnswering) ...[
                                        TextField(
                                          controller: _answerController,
                                          decoration: InputDecoration(
                                            hintText: _t('enter_answer'),
                                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                          ),
                                          maxLines: 3,
                                        ),
                                        const SizedBox(height: 12),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: OutlinedButton(
                                                onPressed: () => setState(() => _answeringQuestionId = null),
                                                child: Text(_t('cancel')),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: _isSubmitting
                                                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                                                  : FilledButton(
                                                      onPressed: () => _answerQuestion(qa.id),
                                                      child: Text(_t('submit')),
                                                    ),
                                            ),
                                          ],
                                        ),
                                      ] else
                                        TextButton.icon(
                                          onPressed: () => setState(() => _answeringQuestionId = qa.id),
                                          icon: const Icon(Icons.reply),
                                          label: Text(_t('answer_question')),
                                        ),
                                    ],
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
              child: Column(
                children: [
                  TextField(
                    controller: _questionController,
                    decoration: InputDecoration(
                      hintText: _t('enter_question'),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: _isSubmitting
                        ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                        : ElevatedButton(
                            onPressed: _addQuestion,
                            child: Text(_t('add_q_and_a')),
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
