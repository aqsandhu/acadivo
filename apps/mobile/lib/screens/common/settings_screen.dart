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
import '../../providers/locale_provider.dart';
import '../../providers/auth_provider.dart';
import '../../storage/preferences.dart';
import '../../constants/storage_keys.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  late final Preferences _prefs;
  bool _notificationSounds = true;
  bool _pushNotifications = true;

  @override
  void initState() {
    super.initState();
    _prefs = Preferences.instance;
    _notificationSounds = _prefs.getNotificationSounds();
    _pushNotifications = _prefs.getPushNotifications();
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    final localeNotifier = ref.read(localeProvider.notifier);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'ترتیبات' : 'Settings',
          isUrdu: isUrdu,
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(isUrdu ? 'ظاہریت' : 'Appearance', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  SwitchListTile(
                    secondary: const Icon(Icons.dark_mode_outlined),
                    title: Text(isUrdu ? 'ڈارک موڈ' : 'Dark Mode'),
                    subtitle: Text(isUrdu ? 'ڈارک تھیم فعال کریں' : 'Enable dark theme'),
                    value: ref.watch(themeProvider) == ThemeMode.dark,
                    onChanged: (v) => ref.read(themeProvider.notifier).toggle(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(isUrdu ? 'زبان' : 'Language', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  RadioListTile<Locale>(
                    title: const Text('English'),
                    value: const Locale('en', 'US'),
                    groupValue: ref.watch(localeProvider),
                    onChanged: (v) { if (v != null) localeNotifier.setLocale(v); },
                  ),
                  const Divider(height: 1),
                  RadioListTile<Locale>(
                    title: const Text('Urdu'),
                    value: const Locale('ur', 'PK'),
                    groupValue: ref.watch(localeProvider),
                    onChanged: (v) { if (v != null) localeNotifier.setLocale(v); },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(isUrdu ? 'اطلاعات' : 'Notifications', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
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
                    value: _pushNotifications,
                    onChanged: (v) async {
                      await _prefs.setPushNotifications(v);
                      setState(() => _pushNotifications = v);
                    },
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    secondary: const Icon(Icons.volume_up_outlined),
                    title: Text(isUrdu ? 'نوٹیفکیشن آواز' : 'Notification Sounds'),
                    subtitle: Text(isUrdu ? 'نوٹیفکیشن آواز فعال کریں' : 'Play sound on new notifications'),
                    value: _notificationSounds,
                    onChanged: (v) async {
                      await _prefs.setNotificationSounds(v);
                      setState(() => _notificationSounds = v);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(isUrdu ? 'اکاؤنٹ' : 'Account', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.lock_outline),
                    title: Text(isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Change Password'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.logout, color: Colors.red),
                    title: Text(isUrdu ? 'لاگ آؤٹ' : 'Logout', style: const TextStyle(color: Colors.red)),
                    onTap: () => ref.read(authProvider.notifier).logout(),
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
