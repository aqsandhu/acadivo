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
import '../../models/dashboard_stats_model.dart';

class TeacherDashboardScreen extends ConsumerStatefulWidget {
  const TeacherDashboardScreen({super.key});
  @override
  ConsumerState<TeacherDashboardScreen> createState() => _TeacherDashboardScreenState();
}

class _TeacherDashboardScreenState extends ConsumerState<TeacherDashboardScreen> {
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
      final service = TeacherService(api);
      final classes = await service.getMyClasses();
      setState(() {
        _todayClasses = classes;
        _announcements = [
          {'title': 'Staff Meeting', 'date': 'Today, 2:00 PM'},
          {'title': 'Exam Duty', 'date': 'Tomorrow'},
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
          title: isUrdu ? 'ٹیچر ڈیش بورڈ' : 'Teacher Dashboard',
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
                          if (_todayClasses.isEmpty)
                            EmptyStateWidget(
                              icon: Icons.class_outlined,
                              title: isUrdu ? 'آج کوئی کلاس نہیں' : 'No Classes Today',
                              subtitle: isUrdu ? 'آج کے لیے کوئی کلاس مقرر نہیں' : 'No classes scheduled for today.',
                            )
                          else
                            SizedBox(
                              height: 140,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: _todayClasses.length,
                                itemBuilder: (context, index) {
                                  final c = _todayClasses[index];
                                  return Container(
                                    width: 220,
                                    margin: const EdgeInsets.only(right: 12),
                                    child: Card(
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5))),
                                      child: Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(color: theme.colorScheme.primaryContainer, borderRadius: BorderRadius.circular(8)),
                                              child: Text(c['subject'] ?? '', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.primary, fontWeight: FontWeight.w600)),
                                            ),
                                            const SizedBox(height: 8),
                                            Text(c['className'] ?? '', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                                            const Spacer(),
                                            Row(
                                              children: [
                                                Icon(Icons.access_time, size: 14, color: theme.colorScheme.onSurfaceVariant),
                                                const SizedBox(width: 4),
                                                Text(c['time'] ?? '', style: theme.textTheme.bodySmall),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          const SizedBox(height: 24),
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
                            childAspectRatio: 1.2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            children: [
                              StatsCard(icon: Icons.class_, value: '${_todayClasses.length}', label: isUrdu ? 'آج کی کلاسز' : 'Classes Today', color: const Color(0xFF1E40AF)),
                              StatsCard(icon: Icons.assignment_late, value: '0', label: isUrdu ? 'ہوم ورک' : 'Homework', color: const Color(0xFFF59E0B)),
                              StatsCard(icon: Icons.message, value: '0', label: isUrdu ? 'پیغامات' : 'Messages', color: const Color(0xFF3B82F6)),
                              StatsCard(icon: Icons.assessment, value: '0', label: isUrdu ? 'رپورٹس' : 'Reports', color: const Color(0xFF10B981)),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'حالیہ اعلانات' : 'Recent Announcements', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._announcements.map((a) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: Icon(Icons.campaign_outlined, color: theme.colorScheme.primary),
                              title: Text(a['title']!, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              subtitle: Text(a['date']!),
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
