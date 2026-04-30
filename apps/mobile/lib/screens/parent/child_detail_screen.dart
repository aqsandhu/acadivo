import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';

import '../../services/parent_service.dart';
import '../../services/api_service.dart';
import '../../models/student_model.dart';
import '../../models/attendance_model.dart';
import '../../models/homework_model.dart';
import '../../models/result_model.dart';

class ChildDetailScreen extends ConsumerStatefulWidget {
  final String childId;
  const ChildDetailScreen({super.key, required this.childId});
  @override
  ConsumerState<ChildDetailScreen> createState() => _ChildDetailScreenState();
}

class _ChildDetailScreenState extends ConsumerState<ChildDetailScreen> {
  bool _isLoading = true;
  String? _error;
  StudentModel? _child;
  List<AttendanceModel> _attendance = [];
  List<HomeworkModel> _homework = [];
  List<ResultModel> _results = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final child = await service.getChildById(widget.childId);
      final attendance = await service.getChildAttendance(widget.childId);
      final homework = await service.getChildHomework(widget.childId);
      final results = await service.getChildResults(widget.childId);
      setState(() {
        _child = child;
        _attendance = attendance;
        _homework = homework;
        _results = results;
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
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
          title: isUrdu ? 'بچے کی تفصیل' : 'Child Details',
          isUrdu: isUrdu,
        ),
        body: _isLoading
            ? const Center(child: LoadingWidget())
            : _error != null
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Card(
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  UserAvatar(name: _child?.name ?? 'Child', size: 60),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(_child?.name ?? 'Unknown', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                                        const SizedBox(height: 4),
                                        Text('${_child?.className ?? ""} • ${_child?.sectionName ?? ""}', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'حالیہ حاضری' : 'Recent Attendance', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._attendance.take(5).map((a) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: Icon(
                                a.status == 'present' ? Icons.check_circle : a.status == 'absent' ? Icons.cancel : Icons.access_time,
                                color: a.status == 'present' ? Colors.green : a.status == 'absent' ? Colors.red : Colors.orange,
                              ),
                              title: Text(a.date != null ? '${a.date!.day}/${a.date!.month}/${a.date!.year}' : '', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              trailing: StatusBadge(
                                label: a.status.toUpperCase(),
                                type: a.status == 'present' ? StatusType.success : a.status == 'absent' ? StatusType.error : StatusType.warning,
                              ),
                            ),
                          )),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'حالیہ ہوم ورک' : 'Recent Homework', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._homework.take(3).map((h) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: CircleAvatar(backgroundColor: theme.colorScheme.secondaryContainer, child: Icon(Icons.assignment, color: theme.colorScheme.secondary, size: 18)),
                              title: Text(h.title, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              subtitle: Text(h.subjectName ?? ''),
                              trailing: StatusBadge(label: h.status, type: false ? StatusType.success : StatusType.warning),
                            ),
                          )),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'حالیہ نتائج' : 'Recent Results', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._results.take(3).map((r) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: CircleAvatar(backgroundColor: theme.colorScheme.tertiaryContainer, child: Text(r.overallGrade ?? 'N/A', style: TextStyle(color: theme.colorScheme.tertiary, fontWeight: FontWeight.bold, fontSize: 12))),
                              title: Text(r.examType ?? 'Exam', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              trailing: Text('${(r.totalMarksObtained ?? 0).toStringAsFixed(0)}/${(r.totalMaxMarks ?? 0).toStringAsFixed(0)}', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                            ),
                          )),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }
}
