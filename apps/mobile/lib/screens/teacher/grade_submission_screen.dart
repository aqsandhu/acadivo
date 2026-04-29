import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/user_avatar.dart';

class GradeSubmissionScreen extends ConsumerStatefulWidget {
  const GradeSubmissionScreen({super.key});

  @override
  ConsumerState<GradeSubmissionScreen> createState() => _GradeSubmissionScreenState();
}

class _GradeSubmissionScreenState extends ConsumerState<GradeSubmissionScreen> {
  final _marksController = TextEditingController();
  final _feedbackController = TextEditingController();
  bool _isLoading = false;
  bool _isUrdu = false;
  final int _maxMarks = 20;

  Future<void> _submitGrade() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() => _isLoading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isUrdu ? 'درجہ بندی محفوظ ہو گئی' : 'Grade submitted successfully')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'جمع کروائی کا درجہ' : 'Grade Submission',
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
              child: Row(
                children: [
                  const UserAvatar(name: 'Ahmad Ali', size: 56),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Ahmad Ali', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                        Text('Roll: 101 | Class 8-A', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _isUrdu ? 'جمع کروائی' : 'Submission',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'Here is my completed algebra homework. I have solved all 20 problems and attached the working.',
              style: theme.textTheme.bodyMedium,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              Chip(
                avatar: const Icon(Icons.picture_as_pdf, size: 18),
                label: const Text('homework.pdf'),
              ),
              Chip(
                avatar: const Icon(Icons.image, size: 18),
                label: const Text('working.jpg'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            _isUrdu ? 'درجہ بندی' : 'Grading',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          CustomTextField(
            label: _isUrdu ? 'نمبر ($_maxMarks میں سے)' : 'Marks (out of $_maxMarks)',
            controller: _marksController,
            keyboardType: TextInputType.number,
            prefixIcon: const Icon(Icons.score_outlined),
          ),
          const SizedBox(height: 16),
          CustomTextField(
            label: _isUrdu ? 'تاثرات' : 'Feedback',
            controller: _feedbackController,
            maxLines: 4,
            hint: _isUrdu ? 'تاثرات لکھیں...' : 'Write feedback...',
          ),
          const SizedBox(height: 24),
          CustomButton(
            label: _isUrdu ? 'درجہ بندی جمع کرائیں' : 'Submit Grade',
            isLoading: _isLoading,
            onPressed: _submitGrade,
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
