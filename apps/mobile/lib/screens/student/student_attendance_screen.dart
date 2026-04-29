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

import '../../services/student_service.dart';
import '../../services/api_service.dart';
import '../../models/attendance_model.dart';

class StudentAttendanceScreen extends ConsumerStatefulWidget {
  const StudentAttendanceScreen({super.key});
  @override
  ConsumerState<StudentAttendanceScreen> createState() => _StudentAttendanceScreenState();
}

class _StudentAttendanceScreenState extends ConsumerState<StudentAttendanceScreen> {
  bool _isLoading = true;
  String? _error;
  List<AttendanceModel> _attendance = [];
  Map<String, dynamic> _summary = {};

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = StudentService(api);
      final data = await service.getMyAttendance();
      final summary = await service.getAttendanceSummary();
      setState(() { _attendance = data; _summary = summary; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    final present = _summary['present'] ?? 0;
    final absent = _summary['absent'] ?? 0;
    final late = _summary['late'] ?? 0;
    final total = _summary['total'] ?? 1;
    final percentage = total > 0 ? ((present / total) * 100).toStringAsFixed(1) : '0.0';
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'میری حاضری' : 'My Attendance',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _attendance.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _attendance.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: 2,
                            childAspectRatio: 1.5,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            children: [
                              StatsCard(icon: Icons.event_available, value: '$present', label: isUrdu ? 'حاضر' : 'Present', color: const Color(0xFF10B981)),
                              StatsCard(icon: Icons.person_off, value: '$absent', label: isUrdu ? 'غیر حاضر' : 'Absent', color: const Color(0xFFEF4444)),
                              StatsCard(icon: Icons.access_time, value: '$late', label: isUrdu ? 'تاخیر' : 'Late', color: const Color(0xFFF59E0B)),
                              StatsCard(icon: Icons.percent, value: '$percentage%', label: isUrdu ? 'حاضری%' : 'Attendance%', color: const Color(0xFF3B82F6)),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'حاضری کی تفصیل' : 'Attendance Details', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._attendance.map((a) => Card(
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
                          )),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }
}
