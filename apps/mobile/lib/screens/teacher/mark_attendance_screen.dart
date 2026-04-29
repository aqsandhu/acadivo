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

import '../../services/teacher_service.dart';
import '../../services/api_service.dart';
import '../../models/attendance_model.dart';
import '../../models/student_model.dart';

class MarkAttendanceScreen extends ConsumerStatefulWidget {
  final String? classId;
  final String? sectionId;
  const MarkAttendanceScreen({super.key, this.classId, this.sectionId});
  @override
  ConsumerState<MarkAttendanceScreen> createState() => _MarkAttendanceScreenState();
}

class _MarkAttendanceScreenState extends ConsumerState<MarkAttendanceScreen> {
  bool _isLoading = true;
  String? _error;
  DateTime _selectedDate = DateTime.now();
  List<StudentModel> _students = [];
  Map<String, String> _attendance = {};

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
        for (var s in students) { _attendance[s.id] = 'present'; }
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _submit() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      final records = _attendance.entries.map((e) => {
        'studentId': e.key,
        'status': e.value,
        'date': _selectedDate.toIso8601String(),
      }).toList();
      await service.markAttendance(records);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ref.read(isRtlProvider) ? 'حاضری محفوظ ہو گئی' : 'Attendance saved successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'حاضری درج کریں' : 'Mark Attendance',
          isUrdu: isUrdu,
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: _isLoading ? null : _submit,
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
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _students.length,
                          padding: const EdgeInsets.all(16),
                          itemBuilder: (context, index) {
                            final s = _students[index];
                            final status = _attendance[s.id] ?? 'present';
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: UserAvatar(name: s.name, size: 40),
                                title: Text(s.name, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text(s.uniqueId ?? ''),
                                trailing: DropdownButton<String>(
                                  value: status,
                                  items: ['present', 'absent', 'late', 'leave'].map((val) => DropdownMenuItem(
                                    value: val,
                                    child: Text(val.toUpperCase(), style: TextStyle(
                                      color: val == 'present' ? Colors.green : val == 'absent' ? Colors.red : val == 'late' ? Colors.orange : Colors.blue,
                                      fontWeight: FontWeight.w600,
                                    )),
                                  )).toList(),
                                  onChanged: (val) { if (val != null) setState(() => _attendance[s.id] = val); },
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
