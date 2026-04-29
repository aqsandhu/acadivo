import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/user_avatar.dart';

class ChildDetailScreen extends ConsumerStatefulWidget {
  final String childName;
  const ChildDetailScreen({super.key, required this.childName});

  @override
  ConsumerState<ChildDetailScreen> createState() => _ChildDetailScreenState();
}

class _ChildDetailScreenState extends ConsumerState<ChildDetailScreen> {
  bool _isUrdu = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DefaultTabController(
      length: 6,
      child: Scaffold(
        appBar: CustomAppBar(
          title: widget.childName,
          isUrdu: _isUrdu,
        ),
        body: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              color: theme.colorScheme.primaryContainer.withOpacity(0.3),
              child: Row(
                children: [
                  UserAvatar(name: widget.childName, size: 72),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.childName,
                          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text('Class 8-A', style: theme.textTheme.bodyMedium),
                        Text('Roll: 101', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            TabBar(
              isScrollable: true,
              tabs: [
                Tab(text: _isUrdu ? 'حاضری' : 'Attendance'),
                Tab(text: _isUrdu ? 'ہوم ورک' : 'Homework'),
                Tab(text: _isUrdu ? 'نتائج' : 'Results'),
                Tab(text: _isUrdu ? 'فیس' : 'Fee'),
                Tab(text: _isUrdu ? 'رپورٹس' : 'Reports'),
                Tab(text: _isUrdu ? 'پیغامات' : 'Messages'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildAttendanceTab(theme),
                  _buildHomeworkTab(theme),
                  _buildResultsTab(theme),
                  _buildFeeTab(theme),
                  _buildReportsTab(theme),
                  _buildMessagesTab(theme),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendanceTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Attendance Calendar', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Container(
            height: 200,
            alignment: Alignment.center,
            child: Text(
              'Calendar view here',
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
          ),
        ),
        const SizedBox(height: 16),
        _buildSummaryCard(theme, 'Present: 18 | Absent: 2 | Late: 1 | Leave: 1'),
      ],
    );
  }

  Widget _buildHomeworkTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            title: const Text('Algebra Exercises'),
            subtitle: const Text('Due: 18 Mar | Status: Pending'),
            trailing: const Icon(Icons.chevron_right),
          ),
        ),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            title: const Text('Urdu Essay'),
            subtitle: const Text('Submitted: 12 Mar | Grade: A'),
            trailing: const Icon(Icons.check_circle, color: Color(0xFF10B981)),
          ),
        ),
      ],
    );
  }

  Widget _buildResultsTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            title: const Text('First Term 2024'),
            subtitle: const Text('Percentage: 83.6% | Grade: A'),
            trailing: IconButton(
              icon: const Icon(Icons.download),
              onPressed: () {},
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFeeTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildFeeRow('Admission Fee', 'Paid', const Color(0xFF10B981)),
                _buildFeeRow('Monthly Fee - Jan', 'Paid', const Color(0xFF10B981)),
                _buildFeeRow('Monthly Fee - Feb', 'Paid', const Color(0xFF10B981)),
                _buildFeeRow('Monthly Fee - Mar', 'Unpaid', const Color(0xFFEF4444)),
                const Divider(),
                _buildFeeRow('Balance Due', 'Rs. 5,000', const Color(0xFFEF4444)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFeeRow(String label, String status, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildReportsTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.add),
          label: Text(_isUrdu ? 'رپورٹ کی درخواست' : 'Request Report'),
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            title: const Text('Progress Report'),
            subtitle: const Text('Requested: 10 Mar | Status: Completed'),
            trailing: IconButton(icon: const Icon(Icons.download), onPressed: () {}),
          ),
        ),
      ],
    );
  }

  Widget _buildMessagesTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            leading: const UserAvatar(name: 'Mr. Ali', size: 40),
            title: const Text('Mr. Ali'),
            subtitle: const Text('Tap to message teacher'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(ThemeData theme, String text) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(text, style: theme.textTheme.bodyMedium),
      ),
    );
  }
}
