import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';

class ParentDashboardScreen extends ConsumerStatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  ConsumerState<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends ConsumerState<ParentDashboardScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _children = [
    {
      'name': 'Ahmad Ali',
      'class': 'Class 8-A',
      'attendance': 'Present',
      'pendingHW': 3,
      'feeStatus': 'paid',
    },
    {
      'name': 'Fatima Ali',
      'class': 'Class 5-B',
      'attendance': 'Absent',
      'pendingHW': 1,
      'feeStatus': 'unpaid',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'والدین ڈیش بورڈ' : 'Parent Dashboard',
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
        isUrdu: _isUrdu,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _isUrdu ? 'السلام علیکم، محمد علی' : 'Assalamualaikum, Muhammad Ali',
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Text(
              _isUrdu ? 'میرے بچے' : 'My Children',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 180,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _children.length,
                itemBuilder: (context, index) {
                  final child = _children[index];
                  return Container(
                    width: 260,
                    margin: const EdgeInsets.only(right: 12),
                    child: Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                      ),
                      child: InkWell(
                        onTap: () {},
                        borderRadius: BorderRadius.circular(16),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const UserAvatar(name: 'Ahmad Ali', size: 48),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          child['name'],
                                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        Text(
                                          child['class'],
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: theme.colorScheme.onSurfaceVariant,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  StatusBadge(
                                    label: child['attendance'],
                                    type: child['attendance'] == 'Present'
                                        ? StatusType.success
                                        : StatusType.danger,
                                  ),
                                  const SizedBox(width: 8),
                                  if (child['pendingHW'] > 0)
                                    StatusBadge(
                                      label: '${child['pendingHW']} HW',
                                      type: StatusType.warning,
                                    ),
                                  const Spacer(),
                                  StatusBadge(
                                    label: child['feeStatus'] == 'paid' ? 'Fee Paid' : 'Fee Due',
                                    type: child['feeStatus'] == 'paid'
                                        ? StatusType.success
                                        : StatusType.danger,
                                  ),
                                ],
                              ),
                            ],
                          ),
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
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
              childAspectRatio: 1.3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: const [
                StatsCard(icon: Icons.payment, value: 'Rs. 15,000', label: 'Total Fee Due', color: Color(0xFFEF4444)),
                StatsCard(icon: Icons.message, value: '3', label: 'Unread Messages', color: Color(0xFF3B82F6)),
                StatsCard(icon: Icons.notifications, value: '7', label: 'Notifications', color: Color(0xFFF59E0B)),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              _isUrdu ? 'اسکول کے اعلانات' : 'School Announcements',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
              ),
              child: ListTile(
                leading: Icon(Icons.campaign, color: theme.colorScheme.primary),
                title: const Text('Annual Sports Day'),
                subtitle: const Text('March 25th, 2024'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}
