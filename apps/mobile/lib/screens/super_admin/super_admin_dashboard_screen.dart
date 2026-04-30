import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/super_admin_provider.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/stats_card.dart';
import '../../routing/route_names.dart';

class SuperAdminDashboardScreen extends ConsumerStatefulWidget {
  const SuperAdminDashboardScreen({super.key});

  @override
  ConsumerState<SuperAdminDashboardScreen> createState() => _SuperAdminDashboardScreenState();
}

class _SuperAdminDashboardScreenState extends ConsumerState<SuperAdminDashboardScreen> {
  bool _isUrdu = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(superAdminProvider.notifier).loadAnalytics();
    });
  }

  void _onNavChanged(int index) {
    switch (index) {
      case 0: break;
      case 1: context.push(RouteNames.superAdminSchools); break;
      case 2: context.push(RouteNames.superAdminAnalytics); break;
      case 3: context.push(RouteNames.superAdminSubscriptions); break;
      case 4: context.push(RouteNames.profile); break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(superAdminProvider);
    final analytics = state.analytics;

    final schoolsCount = analytics['schoolsCount']?.toString() ?? '0';
    final usersCount = analytics['usersCount']?.toString() ?? '0';
    final teachersCount = analytics['teachersCount']?.toString() ?? '0';
    final studentsCount = analytics['studentsCount']?.toString() ?? '0';

    return AppScaffold(
      currentIndex: 0,
      role: 'super_admin',
      showBottomNav: true,
      onNavChanged: _onNavChanged,
      child: Scaffold(
        appBar: CustomAppBar(
          title: _isUrdu ? 'سپر ایڈمن ڈیش بورڈ' : 'Super Admin Dashboard',
          isUrdu: _isUrdu,
        ),
        body: state.isLoading && analytics.isEmpty
            ? const Center(child: LoadingWidget())
            : state.error != null && analytics.isEmpty
                ? AppErrorWidget(message: state.error!, onRetry: () => ref.read(superAdminProvider.notifier).loadAnalytics())
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isUrdu ? 'پلیٹ فارم کا جائزہ' : 'Platform Overview',
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
                            StatsCard(icon: Icons.business, value: schoolsCount, label: 'Schools', color: const Color(0xFF1E40AF)),
                            StatsCard(icon: Icons.people, value: usersCount, label: 'Total Users', color: const Color(0xFF10B981)),
                            StatsCard(icon: Icons.school, value: teachersCount, label: 'Teachers', color: const Color(0xFFF59E0B)),
                            StatsCard(icon: Icons.family_restroom, value: studentsCount, label: 'Students', color: const Color(0xFF3B82F6)),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Text(
                          _isUrdu ? 'آمدنی کا خلاصہ' : 'Revenue Summary',
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 12),
                        Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                          ),
                          child: Container(
                            height: 200,
                            alignment: Alignment.center,
                            child: Text(
                              _isUrdu ? 'آمدنی کا چارٹ' : 'Revenue chart will appear here',
                              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          _isUrdu ? 'حالیہ سرگرمیاں' : 'Recent Activity',
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 12),
                        Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Column(
                            children: [
                              _buildActivityItem(theme, 'New school registered', 'Govt. School Faisalabad', '5 min ago'),
                              const Divider(height: 1),
                              _buildActivityItem(theme, 'Subscription renewed', 'Lahore Grammar School', '1 hour ago'),
                              const Divider(height: 1),
                              _buildActivityItem(theme, 'New user added', 'Teacher - Mrs. Khan', '3 hours ago'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildActivityItem(ThemeData theme, String title, String subtitle, String time) {
    return ListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: Text(time, style: theme.textTheme.bodySmall),
    );
  }
}