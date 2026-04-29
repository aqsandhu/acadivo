import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

class TeacherReportsScreen extends ConsumerStatefulWidget {
  const TeacherReportsScreen({super.key});
  @override
  ConsumerState<TeacherReportsScreen> createState() => _TeacherReportsScreenState();
}

class _TeacherReportsScreenState extends ConsumerState<TeacherReportsScreen> {
  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'رپورٹس' : 'Reports',
          isUrdu: isUrdu,
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(isUrdu ? 'دستیاب رپورٹس' : 'Available Reports', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  ListTile(
                    leading: Icon(Icons.bar_chart, color: theme.colorScheme.primary),
                    title: Text(isUrdu ? 'کلاس کی کارکردگی' : 'Class Performance'),
                    subtitle: Text(isUrdu ? 'نمبرز اور حاضری کا جائزہ' : 'Marks and attendance overview'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Icon(Icons.assignment, color: theme.colorScheme.secondary),
                    title: Text(isUrdu ? 'ہوم ورک رپورٹ' : 'Homework Report'),
                    subtitle: Text(isUrdu ? 'طلباء کی کارکردگی' : 'Student submissions overview'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Icon(Icons.event_available, color: const Color(0xFF10B981)),
                    title: Text(isUrdu ? 'حاضری رپورٹ' : 'Attendance Report'),
                    subtitle: Text(isUrdu ? 'مہینے وار حاضری' : 'Monthly attendance summary'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
