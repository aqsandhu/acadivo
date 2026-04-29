import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';

class FeeManagementScreen extends ConsumerStatefulWidget {
  const FeeManagementScreen({super.key});

  @override
  ConsumerState<FeeManagementScreen> createState() => _FeeManagementScreenState();
}

class _FeeManagementScreenState extends ConsumerState<FeeManagementScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _structures = [
    {'class': 'Class 1-5', 'amount': 4000, 'type': 'Monthly'},
    {'class': 'Class 6-8', 'amount': 5000, 'type': 'Monthly'},
    {'class': 'Class 9-10', 'amount': 6000, 'type': 'Monthly'},
  ];

  final List<Map<String, dynamic>> _records = [
    {'student': 'Ahmad Ali', 'amount': 5000, 'status': 'paid', 'date': '10 Mar'},
    {'student': 'Fatima Zahra', 'amount': 4000, 'status': 'unpaid', 'date': '-'},
    {'student': 'Bilal Khan', 'amount': 5000, 'status': 'partial', 'date': '08 Mar'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: CustomAppBar(
          title: _isUrdu ? 'فیس کا انتظام' : 'Fee Management',
          bottom: TabBar(
            tabs: [
              Tab(text: _isUrdu ? 'فیس ڈھانچہ' : 'Fee Structure'),
              Tab(text: _isUrdu ? 'فیس ریکارڈ' : 'Fee Records'),
            ],
          ),
          isUrdu: _isUrdu,
        ),
        body: TabBarView(
          children: [
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ..._structures.map((s) => Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    title: Text(s['class']),
                    subtitle: Text(s['type']),
                    trailing: Text(
                      'Rs. ${s['amount']}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ),
                )).toList(),
              ],
            ),
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  childAspectRatio: 1.5,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  children: [
                    StatsCard(icon: Icons.paid, value: 'Rs. 125K', label: 'Collected', color: Color(0xFF10B981)),
                    StatsCard(icon: Icons.money_off, value: 'Rs. 45K', label: 'Pending', color: Color(0xFFEF4444)),
                    StatsCard(icon: Icons.people, value: '820', label: 'Students', color: Color(0xFF3B82F6)),
                  ],
                ),
                const SizedBox(height: 20),
                ..._records.map((r) => Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    title: Text(r['student']),
                    subtitle: Text('Date: ${r['date']}'),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Rs. ${r['amount']}',
                          style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 4),
                        if (r['status'] == 'paid')
                          const StatusBadge(label: 'Paid', type: StatusType.success)
                        else if (r['status'] == 'unpaid')
                          const StatusBadge(label: 'Unpaid', type: StatusType.danger)
                        else
                          const StatusBadge(label: 'Partial', type: StatusType.warning),
                      ],
                    ),
                  ),
                )).toList(),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
