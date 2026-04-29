import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';

class ParentFeeScreen extends ConsumerStatefulWidget {
  const ParentFeeScreen({super.key});

  @override
  ConsumerState<ParentFeeScreen> createState() => _ParentFeeScreenState();
}

class _ParentFeeScreenState extends ConsumerState<ParentFeeScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _records = [
    {'child': 'Ahmad Ali', 'type': 'Monthly Fee - Mar', 'amount': 5000, 'status': 'unpaid', 'dueDate': '15 Mar 2024'},
    {'child': 'Ahmad Ali', 'type': 'Monthly Fee - Feb', 'amount': 5000, 'status': 'paid', 'dueDate': '15 Feb 2024'},
    {'child': 'Fatima Ali', 'type': 'Monthly Fee - Mar', 'amount': 4000, 'status': 'paid', 'dueDate': '15 Mar 2024'},
    {'child': 'Fatima Ali', 'type': 'Admission Fee', 'amount': 10000, 'status': 'partial', 'dueDate': '01 Jan 2024'},
  ];

  bool _isOverdue(String dueDate) {
    final parts = dueDate.split(' ');
    final day = int.parse(parts[0]);
    final month = _monthToInt(parts[1]);
    final year = int.parse(parts[2]);
    final due = DateTime(year, month, day);
    return DateTime.now().isAfter(due);
  }

  int _monthToInt(String month) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(month) + 1;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final totalDue = _records
        .where((r) => r['status'] != 'paid')
        .fold<int>(0, (sum, r) => sum + (r['amount'] as int));

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'فیس ریکارڈ' : 'Fee Records',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          StatsCard(
            icon: Icons.account_balance_wallet,
            value: 'Rs. $totalDue',
            label: _isUrdu ? 'کل بقایا' : 'Total Due',
            color: const Color(0xFFEF4444),
          ),
          const SizedBox(height: 20),
          Text(
            _isUrdu ? 'فیس ریکارڈ' : 'All Fee Records',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._records.map((r) {
            final overdue = _isOverdue(r['dueDate']) && r['status'] != 'paid';
            return Card(
              elevation: 0,
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(
                  color: overdue
                      ? const Color(0xFFEF4444).withOpacity(0.3)
                      : theme.colorScheme.outlineVariant.withOpacity(0.5),
                ),
              ),
              child: ListTile(
                title: Text(r['type']),
                subtitle: Text('${r['child']} • Due: ${r['dueDate']}'),
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
            );
          }).toList(),
        ],
      ),
    );
  }
}
