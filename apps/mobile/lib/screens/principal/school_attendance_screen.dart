import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/stats_card.dart';

class SchoolAttendanceScreen extends ConsumerStatefulWidget {
  const SchoolAttendanceScreen({super.key});

  @override
  ConsumerState<SchoolAttendanceScreen> createState() => _SchoolAttendanceScreenState();
}

class _SchoolAttendanceScreenState extends ConsumerState<SchoolAttendanceScreen> {
  bool _isUrdu = false;
  String? _selectedClass;

  final List<Map<String, dynamic>> _summary = [
    {'class': '8-A', 'present': 30, 'absent': 2, 'late': 0},
    {'class': '9-B', 'present': 28, 'absent': 1, 'late': 1},
    {'class': '10-C', 'present': 32, 'absent': 0, 'late': 0},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکول کی حاضری' : 'School Attendance',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: CustomDropdown<String>(
              label: _isUrdu ? 'کلاس' : 'Class',
              value: _selectedClass,
              items: const [
                DropdownMenuItem(value: null, child: Text('All Classes')),
                DropdownMenuItem(value: '8', child: Text('Class 8')),
                DropdownMenuItem(value: '9', child: Text('Class 9')),
                DropdownMenuItem(value: '10', child: Text('Class 10')),
              ],
              onChanged: (v) => setState(() => _selectedClass = v),
            ),
          ),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 3,
            childAspectRatio: 1.5,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            children: const [
              StatsCard(icon: Icons.event_available, value: '822', label: 'Present', color: Color(0xFF10B981)),
              StatsCard(icon: Icons.event_busy, value: '28', label: 'Absent', color: Color(0xFFEF4444)),
              StatsCard(icon: Icons.access_time, value: '12', label: 'Late', color: Color(0xFFF59E0B)),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            _isUrdu ? 'کلاس وار خلاصہ' : 'Class-wise Summary',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._summary.map((s) => Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s['class'], style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _buildMiniStat('Present', s['present'].toString(), const Color(0xFF10B981)),
                      _buildMiniStat('Absent', s['absent'].toString(), const Color(0xFFEF4444)),
                      _buildMiniStat('Late', s['late'].toString(), const Color(0xFFF59E0B)),
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

  Widget _buildMiniStat(String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
            Text(label, style: TextStyle(fontSize: 11, color: color)),
          ],
        ),
      ),
    );
  }
}
