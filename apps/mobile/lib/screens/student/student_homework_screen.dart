import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/file_picker_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/status_badge.dart';

class StudentHomeworkScreen extends ConsumerStatefulWidget {
  const StudentHomeworkScreen({super.key});

  @override
  ConsumerState<StudentHomeworkScreen> createState() => _StudentHomeworkScreenState();
}

class _StudentHomeworkScreenState extends ConsumerState<StudentHomeworkScreen> {
  int _selectedTab = 0;
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _pending = [
    {'title': 'Algebra Exercises', 'subject': 'Mathematics', 'dueDate': DateTime(2024, 3, 18), 'description': 'Complete exercises 1-20 from Chapter 5'},
    {'title': 'Science Lab Report', 'subject': 'Science', 'dueDate': DateTime(2024, 3, 15), 'description': 'Write lab report on photosynthesis experiment'},
    {'title': 'English Essay', 'subject': 'English', 'dueDate': DateTime(2024, 3, 20), 'description': 'Write 500 words on My Favorite Hobby'},
  ];

  final List<Map<String, dynamic>> _submitted = [
    {'title': 'Urdu Essay', 'subject': 'Urdu', 'submittedDate': '12 Mar', 'grade': 'A', 'feedback': 'Excellent work!'},
    {'title': 'Geography Map', 'subject': 'Geography', 'submittedDate': '10 Mar', 'grade': 'B+', 'feedback': 'Good effort, improve labeling'},
  ];

  bool _isLate(DateTime dueDate) => DateTime.now().isAfter(dueDate);

  String _timeRemaining(DateTime dueDate) {
    final diff = dueDate.difference(DateTime.now());
    if (diff.inDays > 0) return '${diff.inDays}d remaining';
    if (diff.inHours > 0) return '${diff.inHours}h remaining';
    return 'Due now';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'میرا ہوم ورک' : 'My Homework',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<int>(
              segments: [
                ButtonSegment(value: 0, label: Text(_isUrdu ? 'زیر التواء' : 'Pending')),
                ButtonSegment(value: 1, label: Text(_isUrdu ? 'جمع کرایا' : 'Submitted')),
              ],
              selected: {_selectedTab},
              onSelectionChanged: (v) => setState(() => _selectedTab = v.first),
            ),
          ),
          Expanded(
            child: _selectedTab == 0 ? _buildPendingTab(theme) : _buildSubmittedTab(theme),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingTab(ThemeData theme) {
    if (_pending.isEmpty) {
      return EmptyStateWidget(
        icon: Icons.assignment_turned_in_outlined,
        title: _isUrdu ? 'کوئی زیر التواء ہوم ورک نہیں' : 'No Pending Homework',
        subtitle: _isUrdu ? 'سب کچھ اپ ڈیٹ ہے!' : 'You are all caught up!',
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _pending.length,
      itemBuilder: (context, index) {
        final h = _pending[index];
        final late = _isLate(h['dueDate']);
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: late ? const Color(0xFFEF4444).withOpacity(0.3) : theme.colorScheme.outlineVariant.withOpacity(0.5),
            ),
          ),
          child: InkWell(
            onTap: () => _showSubmitDialog(h),
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
                          color: theme.colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          h['subject'],
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const Spacer(),
                      if (late)
                        const StatusBadge(label: 'Late', type: StatusType.danger)
                      else
                        StatusBadge(
                          label: _timeRemaining(h['dueDate']),
                          type: StatusType.warning,
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    h['title'],
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    h['description'],
                    style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.access_time, size: 14, color: theme.colorScheme.onSurfaceVariant),
                      const SizedBox(width: 4),
                      Text(
                        'Due: ${h['dueDate'].day}/${h['dueDate'].month}/${h['dueDate'].year}',
                        style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSubmittedTab(ThemeData theme) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _submitted.length,
      itemBuilder: (context, index) {
        final s = _submitted[index];
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
          ),
          child: ExpansionTile(
            title: Text(s['title']),
            subtitle: Text('${s['subject']} • ${s['submittedDate']}'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
              ),
              child: Text(
                s['grade'],
                style: const TextStyle(
                  color: Color(0xFF10B981),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isUrdu ? 'استاد کا تاثرہ' : 'Teacher Feedback',
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primaryContainer.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(s['feedback']),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSubmitDialog(Map<String, dynamic> h) {
    final textController = TextEditingController();
    List<String> files = [];
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
              Text(h['title'], style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              CustomTextField(
                label: _isUrdu ? 'اپنا جواب' : 'Your Answer',
                controller: textController,
                maxLines: 4,
              ),
              const SizedBox(height: 16),
              FilePickerField(
                label: _isUrdu ? 'منسلکات' : 'Attachments',
                selectedFiles: files,
                onFilesChanged: (f) => setState(() => files = f),
              ),
              const SizedBox(height: 24),
              CustomButton(
                label: _isUrdu ? 'جمع کرائیں' : 'Submit',
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
