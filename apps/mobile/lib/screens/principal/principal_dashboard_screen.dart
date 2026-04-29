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

import '../../services/principal_service.dart';
import '../../services/api_service.dart';
import '../../models/dashboard_stats_model.dart';

class PrincipalDashboardScreen extends ConsumerStatefulWidget {
  const PrincipalDashboardScreen({super.key});
  @override
  ConsumerState<PrincipalDashboardScreen> createState() => _PrincipalDashboardScreenState();
}

class _PrincipalDashboardScreenState extends ConsumerState<PrincipalDashboardScreen> {
  bool _isLoading = true;
  String? _error;
  DashboardStatsModel? _stats;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = PrincipalService(api);
      final data = await service.getDashboard();
      setState(() { _stats = data ?? DashboardStatsModel(); _isLoading = false; });
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
          title: isUrdu ? 'پنسپل ڈیش بورڈ' : 'Principal Dashboard',
          actions: [
            IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () => context.push(RouteNames.notifications)),
          ],
          isUrdu: isUrdu,
        ),
        body: _isLoading && _stats == null
            ? const Center(child: LoadingWidget())
            : _error != null && _stats == null
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isUrdu ? 'اسکول کا جائزہ' : 'School Overview',
                            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 20),
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
                            childAspectRatio: 1.2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            children: [
                              StatsCard(icon: Icons.school, value: '${_stats?.totalTeachers ?? 0}', label: isUrdu ? 'اساتذہ' : 'Teachers', color: const Color(0xFF1E40AF)),
                              StatsCard(icon: Icons.people, value: '${_stats?.totalStudents ?? 0}', label: isUrdu ? 'طلباء' : 'Students', color: const Color(0xFF10B981)),
                              StatsCard(icon: Icons.family_restroom, value: '${_stats?.totalParents ?? 0}', label: isUrdu ? 'والدین' : 'Parents', color: const Color(0xFFF59E0B)),
                              StatsCard(icon: Icons.class_, value: '${_stats?.totalClasses ?? 0}', label: isUrdu ? 'کلاسز' : 'Classes', color: const Color(0xFF3B82F6)),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'آج کی حاضری' : "Today's Attendance", style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          Card(
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _StatCol(label: isUrdu ? 'حاضر' : 'Present', value: '${_stats?.presentToday ?? 0}', color: Colors.green),
                                  _StatCol(label: isUrdu ? 'غیر حاضر' : 'Absent', value: '${_stats?.absentToday ?? 0}', color: Colors.red),
                                  _StatCol(label: isUrdu ? 'تاخیر' : 'Late', value: '${_stats?.lateToday ?? 0}', color: Colors.orange),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'فوری کارروائیاں' : 'Quick Actions', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: [
                              _ActionChip(icon: Icons.school, label: isUrdu ? 'اساتذہ' : 'Teachers', onTap: () => context.push(RouteNames.principalTeachers)),
                              _ActionChip(icon: Icons.people, label: isUrdu ? 'طلباء' : 'Students', onTap: () => context.push(RouteNames.principalStudents)),
                              _ActionChip(icon: Icons.event_available, label: isUrdu ? 'حاضری' : 'Attendance', onTap: () => context.push(RouteNames.principalAttendance)),
                              _ActionChip(icon: Icons.payment, label: isUrdu ? 'فیس' : 'Fee', onTap: () => context.push(RouteNames.principalFee)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }
}

class _StatCol extends StatelessWidget {
  final String label; final String value; final Color color;
  const _StatCol({required this.label, required this.value, required this.color});
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 4),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}

class _ActionChip extends StatelessWidget {
  final IconData icon; final String label; final VoidCallback onTap;
  const _ActionChip({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ActionChip(
      avatar: Icon(icon, size: 18, color: theme.colorScheme.primary),
      label: Text(label),
      backgroundColor: theme.colorScheme.primaryContainer.withOpacity(0.3),
      side: BorderSide.none,
      onPressed: onTap,
    );
  }
}
