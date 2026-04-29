import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

class TeacherQaScreen extends ConsumerStatefulWidget {
  const TeacherQaScreen({super.key});
  @override
  ConsumerState<TeacherQaScreen> createState() => _TeacherQaScreenState();
}

class _TeacherQaScreenState extends ConsumerState<TeacherQaScreen> {
  final TextEditingController _questionController = TextEditingController();
  final TextEditingController _answerController = TextEditingController();
  final List<Map<String, dynamic>> _qaList = [];

  void _addQa() {
    if (_questionController.text.isEmpty || _answerController.text.isEmpty) return;
    setState(() {
      _qaList.add({
        'question': _questionController.text,
        'answer': _answerController.text,
        'date': DateTime.now().toString().split(' ')[0],
      });
      _questionController.clear();
      _answerController.clear();
    });
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
              child: _qaList.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.question_answer_outlined,
                    title: isUrdu ? 'کوئی سوال نہیں' : 'No Q & A',
                    subtitle: isUrdu ? 'ابھی تک کوئی سوال جواب نہیں' : 'No questions and answers yet.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _qaList.length,
                    itemBuilder: (context, index) {
                      final qa = _qaList[index];
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
                              child: Text(qa['answer'], style: theme.textTheme.bodyMedium),
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
              child: Column(
                children: [
                  TextField(
                    controller: _questionController,
                    decoration: InputDecoration(
                      hintText: isUrdu ? 'سوال درج کریں' : 'Enter question...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _answerController,
                    decoration: InputDecoration(
                      hintText: isUrdu ? 'جواب درج کریں' : 'Enter answer...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _addQa,
                      child: Text(isUrdu ? 'شامل کریں' : 'Add Q&A'),
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
