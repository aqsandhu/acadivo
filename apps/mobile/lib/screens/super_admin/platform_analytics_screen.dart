import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';

class PlatformAnalyticsScreen extends ConsumerStatefulWidget {
  const PlatformAnalyticsScreen({super.key});

  @override
  ConsumerState<PlatformAnalyticsScreen> createState() => _PlatformAnalyticsScreenState();
}

class _PlatformAnalyticsScreenState extends ConsumerState<PlatformAnalyticsScreen> {
  bool _isUrdu = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'پلیٹ فارم تجزیات' : 'Platform Analytics',
        isUrdu: _isUrdu,
      ),
      body: SingleChildScrollView(
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
              children: const [
                StatsCard(icon: Icons.trending_up, value: '23%', label: 'Growth', color: Color(0xFF10B981)),
                StatsCard(icon: Icons.attach_money, value: 'Rs. 850K', label: 'Revenue', color: Color(0xFF1E40AF)),
                StatsCard(icon: Icons.people, value: '12.5K', label: 'Active Users', color: Color(0xFF3B82F6)),
                StatsCard(icon: Icons.school, value: '156', label: 'Schools', color: Color(0xFFF59E0B)),
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
