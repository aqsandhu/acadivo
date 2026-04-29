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

import '../../services/teacher_service.dart';
import '../../services/api_service.dart';
import '../../models/student_model.dart';

class GradeSubmissionScreen extends ConsumerStatefulWidget {
  final String? classId;
  const GradeSubmissionScreen({super.key, this.classId});
  @override
  ConsumerState<GradeSubmissionScreen> createState() => _GradeSubmissionScreenState();
}

class _GradeSubmissionScreenState extends ConsumerState<GradeSubmissionScreen> {
  bool _isLoading = true;
  String? _error;
  List<StudentModel> _students = [];
  Map<String, TextEditingController> _controllers = {};
  final _formKey = GlobalKey<FormState>();
  bool _submitting = false;
  String _examType = 'midterm';
  String _subjectId = '';

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      final students = await service.getClassStudents(widget.classId ?? '');
      setState(() {
        _students = students;
        for (var s in students) {
          _controllers[s.id] = TextEditingController();
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      final marksData = _students.map((s) => {
        'studentId': s.id,
        'marksObtained': double.tryParse(_controllers[s.id]!.text) ?? 0,
        'examType': _examType,
        'subjectId': _subjectId,
      }).toList();
      await service.uploadMarks(marksData);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ref.read(isRtlProvider) ? 'نمبرز محفوظ ہو گئے' : 'Marks saved successfully')),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _submitting = false);
    }
  }

  @override
  void dispose() {
    for (var c in _controllers.values) { c.dispose(); }
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
          title: isUrdu ? 'نمبرز درج کریں' : 'Submit Marks',
          isUrdu: isUrdu,
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: _submitting ? null : _submit,
          icon: const Icon(Icons.save),
          label: Text(isUrdu ? 'محفوظ کریں' : 'Save'),
        ),
        body: _isLoading && _students.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _students.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _students.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.people_outline,
                        title: isUrdu ? 'کوئی طالب علم نہیں' : 'No Students',
                        subtitle: isUrdu ? 'اس کلاس میں کوئی طالب علم نہیں' : 'No students in this class.',
                      )
                    : Form(
                        key: _formKey,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _students.length,
                          itemBuilder: (context, index) {
                            final s = _students[index];
                            final controller = _controllers[s.id];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: UserAvatar(name: s.name, size: 40),
                                title: Text(s.name, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text(s.uniqueId ?? ''),
                                trailing: SizedBox(
                                  width: 80,
                                  child: TextFormField(
                                    controller: controller,
                                    keyboardType: TextInputType.number,
                                    textAlign: TextAlign.center,
                                    decoration: InputDecoration(
                                      hintText: isUrdu ? 'نمبر' : 'Marks',
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                    ),
                                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
