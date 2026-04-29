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

import '../../providers/theme_provider.dart';

class SchoolSettingsScreen extends ConsumerStatefulWidget {
  const SchoolSettingsScreen({super.key});
  @override
  ConsumerState<SchoolSettingsScreen> createState() => _SchoolSettingsScreenState();
}

class _SchoolSettingsScreenState extends ConsumerState<SchoolSettingsScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'اسکول کی ترتیبات' : 'School Settings',
          isUrdu: isUrdu,
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              isUrdu ? 'عام ترتیبات' : 'General Settings',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.school_outlined),
                    title: Text(isUrdu ? 'اسکول کا نام' : 'School Name'),
                    subtitle: Text(isUrdu ? 'اپنے اسکول کا نام ترتیب دیں' : 'Set your school name'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.schedule_outlined),
                    title: Text(isUrdu ? 'اسکول کا وقت' : 'School Hours'),
                    subtitle: Text(isUrdu ? 'کام کے اوقات کا نظم' : 'Manage working hours'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.payment_outlined),
                    title: Text(isUrdu ? 'فیس کی ترتیبات' : 'Fee Settings'),
                    subtitle: Text(isUrdu ? 'فیس کا ڈھانچہ ترتیب دیں' : 'Configure fee structure'),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              isUrdu ? 'ظاہریت' : 'Appearance',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: SwitchListTile(
                secondary: const Icon(Icons.dark_mode_outlined),
                title: Text(isUrdu ? 'ڈارک موڈ' : 'Dark Mode'),
                subtitle: Text(isUrdu ? 'ڈارک تھیم فعال کریں' : 'Enable dark theme'),
                value: ref.watch(themeProvider) == ThemeMode.dark,
                onChanged: (v) => ref.read(themeProvider.notifier).toggle(),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              isUrdu ? 'براؤزر' : 'Notifications',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  SwitchListTile(
                    secondary: const Icon(Icons.notifications_outlined),
                    title: Text(isUrdu ? 'پش نوٹیفیکیشن' : 'Push Notifications'),
                    subtitle: Text(isUrdu ? 'پش نوٹیفیکیشن وصول کریں' : 'Receive push notifications'),
                    value: true,
                    onChanged: (v) {},
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    secondary: const Icon(Icons.email_outlined),
                    title: Text(isUrdu ? 'ای میل نوٹیفیکیشن' : 'Email Notifications'),
                    subtitle: Text(isUrdu ? 'ای میل نوٹیفیکیشن وصول کریں' : 'Receive email notifications'),
                    value: false,
                    onChanged: (v) {},
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
