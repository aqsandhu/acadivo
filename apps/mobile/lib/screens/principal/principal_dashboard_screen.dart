import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';

class PrincipalDashboardScreen extends ConsumerStatefulWidget {
  const PrincipalDashboardScreen({super.key});

  @override
  ConsumerState<PrincipalDashboardScreen> createState() => _PrincipalDashboardScreenState();
}

class _PrincipalDashboardScreenState extends ConsumerState<PrincipalDashboardScreen> {
  bool _isUrdu = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'پنسپل ڈیش بورڈ' : 'Principal Dashboard',
        isUrdu: _isUrdu,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _isUrdu ? 'اسکول کا جائزہ' : 'School Overview',
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
              children: const [
                StatsCard(icon: Icons.school, value: '45', label: 'Teachers', color: Color(0xFF1E40AF)),
                StatsCard(icon: Icons.people, value: '850', label: 'Students', color: Color(0xFF10B981)),
                StatsCard(icon: Icons.family_restroom, value: '620', label: 'Parents', color: Color(0xFFF59E0B)),
                StatsCard(icon: Icons.percent, value: '92%', label: 'Avg Attendance', color: Color(0xFF3B82F6)),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              _isUrdu ? 'حالیہ اعلانات' : 'Recent Announcements',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                leading: Icon(Icons.campaign, color: theme.colorScheme.primary),
                title: const Text('Annual Sports Day'),
                subtitle: const Text('March 25th, 2024'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ),
            const SizedBox(height: 24),
            Text(
              _isUrdu ? 'حاضری کا جائزہ' : 'Attendance Overview',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Container(
                height: 200,
                alignment: Alignment.center,
                child: Text(
                  _isUrdu ? 'حاضری کا چارٹ' : 'Attendance chart will appear here',
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
