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

import '../../services/parent_service.dart';
import '../../services/api_service.dart';
import '../../models/attendance_model.dart';
import '../../models/student_model.dart';

class ParentAttendanceScreen extends ConsumerStatefulWidget {
  const ParentAttendanceScreen({super.key});
  @override
  ConsumerState<ParentAttendanceScreen> createState() => _ParentAttendanceScreenState();
}

class _ParentAttendanceScreenState extends ConsumerState<ParentAttendanceScreen> {
  bool _isLoading = true;
  String? _error;
  List<StudentModel> _children = [];
  List<AttendanceModel> _attendance = [];
  String? _selectedChildId;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final children = await service.getMyChildren();
      setState(() { _children = children; _isLoading = false; });
      if (children.isNotEmpty) {
        _selectedChildId = children.first.id;
        _loadChildAttendance(children.first.id);
      }
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _loadChildAttendance(String childId) async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final data = await service.getChildAttendance(childId);
      setState(() { _attendance = data; _isLoading = false; });
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
          title: isUrdu ? 'حاضری' : 'Attendance',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _children.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _children.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : Column(
                    children: [
                      if (_children.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: DropdownButtonFormField<String>(
                            value: _selectedChildId,
                            decoration: InputDecoration(
                              labelText: isUrdu ? 'بچہ منتخب کریں' : 'Select Child',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            items: _children.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
                            onChanged: (val) { if (val != null) { setState(() => _selectedChildId = val); _loadChildAttendance(val); } },
                          ),
                        ),
                      Expanded(
                        child: _attendance.isEmpty
                          ? EmptyStateWidget(
                              icon: Icons.event_available_outlined,
                              title: isUrdu ? 'کوئی حاضری نہیں' : 'No Attendance',
                              subtitle: isUrdu ? 'اس بچے کی کوئی حاضری ریکارڈ نہیں' : 'No attendance records for this child.',
                            )
                          : RefreshIndicator(
                              onRefresh: () => _loadChildAttendance(_selectedChildId!),
                              child: ListView.builder(
                                itemCount: _attendance.length,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemBuilder: (context, index) {
                                  final a = _attendance[index];
                                  return Card(
                                    elevation: 0,
                                    margin: const EdgeInsets.only(bottom: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    child: ListTile(
                                      leading: Icon(
                                        a.status == 'present' ? Icons.check_circle : a.status == 'absent' ? Icons.cancel : Icons.access_time,
                                        color: a.status == 'present' ? Colors.green : a.status == 'absent' ? Colors.red : Colors.orange,
                                      ),
                                      title: Text(a.date != null ? '${a.date!.day}/${a.date!.month}/${a.date!.year}' : '', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                      subtitle: Text(a.subjectName ?? a.subjectId ?? ''),
                                      trailing: StatusBadge(
                                        label: a.status.toUpperCase(),
                                        type: a.status == 'present' ? StatusType.success : a.status == 'absent' ? StatusType.error : StatusType.warning,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                      ),
                    ],
                  ),
      ),
    );
  }
}
