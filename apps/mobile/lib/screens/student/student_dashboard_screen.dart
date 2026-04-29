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
import '../../models/dashboard_stats_model.dart';

class StudentDashboardScreen extends ConsumerStatefulWidget {
  const StudentDashboardScreen({super.key});
  @override
  ConsumerState<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends ConsumerState<StudentDashboardScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _todayClasses = [];
  List<Map<String, dynamic>> _announcements = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = StudentService(api);
      final timetable = await service.getMyTimetable();
      setState(() {
        _todayClasses = timetable.map((e) => {
          'subject': e.subjectName ?? e.subjectId,
          'time': '${e.startTime ?? ""} - ${e.endTime ?? ""}',
          'room': e.roomNumber ?? '',
          'teacher': e.teacherName ?? '',
        }).toList();
        _announcements = [
          {'title': 'Sports Day', 'content': 'Annual sports day on March 25th'},
          {'title': 'Exam Schedule', 'content': 'Mid-term exams start April 1st'},
        ];
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
          title: isUrdu ? 'طالب علم ڈیش بورڈ' : 'Student Dashboard',
          actions: [
            IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () => context.push(RouteNames.notifications)),
          ],
          isUrdu: isUrdu,
        ),
        body: _isLoading && _todayClasses.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _todayClasses.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(isUrdu ? 'آج کا شیڈول' : "Today's Schedule", style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._todayClasses.map((c) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5))),
                            child: ListTile(
                              leading: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(color: theme.colorScheme.primaryContainer, borderRadius: BorderRadius.circular(10)),
                                child: Icon(Icons.class_, color: theme.colorScheme.primary, size: 20),
                              ),
                              title: Text(c['subject'], style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              subtitle: Text('${c['teacher']} • ${c['room']}'),
                              trailing: Text(c['time'], style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                            ),
                          )),
                          const SizedBox(height: 20),
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
                            childAspectRatio: 1.3,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            children: [
                              StatsCard(icon: Icons.event_available, value: '92%', label: isUrdu ? 'حاضری' : 'Attendance', color: const Color(0xFF10B981)),
                              StatsCard(icon: Icons.assignment_late, value: '0', label: isUrdu ? 'باقی ہوم ورک' : 'Pending HW', color: const Color(0xFFF59E0B)),
                              StatsCard(icon: Icons.notifications, value: '0', label: isUrdu ? 'غیر پڑھے' : 'Unread', color: const Color(0xFF3B82F6)),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'اعلانات' : 'Announcements', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._announcements.map((a) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: Icon(Icons.campaign_outlined, color: theme.colorScheme.primary),
                              title: Text(a['title']!, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              subtitle: Text(a['content']!),
                              trailing: const StatusBadge(label: 'New', type: StatusType.info),
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
