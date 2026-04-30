import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/super_admin_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/stats_card.dart';

class PlatformAnalyticsScreen extends ConsumerStatefulWidget {
  const PlatformAnalyticsScreen({super.key});

  @override
  ConsumerState<PlatformAnalyticsScreen> createState() => _PlatformAnalyticsScreenState();
}

class _PlatformAnalyticsScreenState extends ConsumerState<PlatformAnalyticsScreen> {
  bool _isUrdu = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(superAdminProvider.notifier).loadAnalytics();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(superAdminProvider);
    final analytics = state.analytics;

    final growth = analytics['growth']?.toString() ?? '0%';
    final revenue = analytics['revenue']?.toString() ?? 'Rs. 0';
    final activeUsers = analytics['activeUsers']?.toString() ?? '0';
    final schoolsCount = analytics['schoolsCount']?.toString() ?? '0';

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'پلیٹ فارم تجزیات' : 'Platform Analytics',
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
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
                        childAspectRatio: 1.2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        children: [
                          StatsCard(icon: Icons.trending_up, value: growth, label: 'Growth', color: const Color(0xFF10B981)),
                          StatsCard(icon: Icons.attach_money, value: revenue, label: 'Revenue', color: const Color(0xFF1E40AF)),
                          StatsCard(icon: Icons.people, value: activeUsers, label: 'Active Users', color: const Color(0xFF3B82F6)),
                          StatsCard(icon: Icons.school, value: schoolsCount, label: 'Schools', color: const Color(0xFFF59E0B)),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        _isUrdu ? 'صارفین کی نشوونما' : 'User Growth',
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
                            _isUrdu ? 'صارفین کی نشوونما کا چارٹ' : 'User growth chart',
                            style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        _isUrdu ? 'آمدنی کا رجحان' : 'Revenue Trend',
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
                            _isUrdu ? 'آمدنی کا چارٹ' : 'Revenue chart',
                            style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        _isUrdu ? 'اسکول کی نشوونما' : 'School Growth',
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
                            _isUrdu ? 'اسکول کی نشوونما کا چارٹ' : 'School growth chart',
                            style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
