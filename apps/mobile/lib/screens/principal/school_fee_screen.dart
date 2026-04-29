import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';

class SchoolFeeScreen extends ConsumerStatefulWidget {
  const SchoolFeeScreen({super.key});

  @override
  ConsumerState<SchoolFeeScreen> createState() => _SchoolFeeScreenState();
}

class _SchoolFeeScreenState extends ConsumerState<SchoolFeeScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _overview = [
    {'class': 'Class 1-5', 'collected': 180000, 'pending': 40000},
    {'class': 'Class 6-8', 'collected': 220000, 'pending': 50000},
    {'class': 'Class 9-10', 'collected': 280000, 'pending': 60000},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکول فیس' : 'School Fee Overview',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 1.5,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: const [
              StatsCard(icon: Icons.paid, value: 'Rs. 680K', label: 'Collected', color: Color(0xFF10B981)),
              StatsCard(icon: Icons.money_off, value: 'Rs. 150K', label: 'Pending', color: Color(0xFFEF4444)),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            _isUrdu ? 'کلاس وار جائزہ' : 'Class-wise Overview',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._overview.map((o) => Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(o['class'], style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildFeeStat('Collected', 'Rs. ${o['collected']}', const Color(0xFF10B981)),
                      ),
                      Expanded(
                        child: _buildFeeStat('Pending', 'Rs. ${o['pending']}', const Color(0xFFEF4444)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildFeeStat(String label, String value, Color color) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 13)),
          Text(label, style: TextStyle(fontSize: 11, color: color)),
        ],
      ),
    );
  }
}
