import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  bool _isUrdu = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'ایڈمن ڈیش بورڈ' : 'Admin Dashboard',
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
                StatsCard(icon: Icons.class_, value: '24', label: 'Classes', color: Color(0xFF3B82F6)),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              _isUrdu ? 'فوری کارروائیاں' : 'Quick Actions',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _buildActionChip(theme, Icons.person_add, 'Add Teacher'),
                _buildActionChip(theme, Icons.person_add_alt, 'Add Student'),
                _buildActionChip(theme, Icons.campaign, 'Announcement'),
                _buildActionChip(theme, Icons.payment, 'Fee Record'),
              ],
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
                  _buildActivityItem(theme, 'New teacher added', 'Mr. Khan - Mathematics', '2 min ago'),
                  const Divider(height: 1),
                  _buildActivityItem(theme, 'Student registered', 'Fatima Ali - Class 5-B', '1 hour ago'),
                  const Divider(height: 1),
                  _buildActivityItem(theme, 'Fee received', 'Rs. 5,000 from Ahmad's parent', '3 hours ago'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionChip(ThemeData theme, IconData icon, String label) {
    return ActionChip(
      avatar: Icon(icon, size: 18, color: theme.colorScheme.primary),
      label: Text(label),
      backgroundColor: theme.colorScheme.primaryContainer.withOpacity(0.3),
      side: BorderSide.none,
      onPressed: () {},
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
