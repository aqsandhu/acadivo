import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _isUrdu = false;
  ThemeMode _themeMode = ThemeMode.system;
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _smsNotifications = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'ترتیبات' : 'Settings',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        children: [
          _buildSection(theme, _isUrdu ? 'زبان' : 'Language'),
          _buildLanguageTile(theme),
          const Divider(),
          _buildSection(theme, _isUrdu ? 'تھیم' : 'Theme'),
          RadioListTile<ThemeMode>(
            title: Text(_isUrdu ? 'روشن' : 'Light'),
            value: ThemeMode.light,
            groupValue: _themeMode,
            onChanged: (v) => setState(() => _themeMode = v!),
            secondary: const Icon(Icons.light_mode),
          ),
          RadioListTile<ThemeMode>(
            title: Text(_isUrdu ? 'تاریک' : 'Dark'),
            value: ThemeMode.dark,
            groupValue: _themeMode,
            onChanged: (v) => setState(() => _themeMode = v!),
            secondary: const Icon(Icons.dark_mode),
          ),
          RadioListTile<ThemeMode>(
            title: Text(_isUrdu ? 'سسٹم' : 'System'),
            value: ThemeMode.system,
            groupValue: _themeMode,
            onChanged: (v) => setState(() => _themeMode = v!),
            secondary: const Icon(Icons.settings_brightness),
          ),
          const Divider(),
          _buildSection(theme, _isUrdu ? 'اطلاعات' : 'Notifications'),
          SwitchListTile(
            title: Text(_isUrdu ? 'پش اطلاعات' : 'Push Notifications'),
            subtitle: Text(_isUrdu ? 'ایپ اطلاعات وصول کریں' : 'Receive in-app notifications'),
            value: _pushNotifications,
            onChanged: (v) => setState(() => _pushNotifications = v),
            secondary: const Icon(Icons.notifications_active_outlined),
          ),
          SwitchListTile(
            title: Text(_isUrdu ? 'ای میل اطلاعات' : 'Email Notifications'),
            subtitle: Text(_isUrdu ? 'ای میل الرٹ وصول کریں' : 'Receive email alerts'),
            value: _emailNotifications,
            onChanged: (v) => setState(() => _emailNotifications = v),
            secondary: const Icon(Icons.email_outlined),
          ),
          SwitchListTile(
            title: Text(_isUrdu ? 'ایس ایم ایس اطلاعات' : 'SMS Notifications'),
            subtitle: Text(_isUrdu ? 'ٹیکسٹ میسج وصول کریں' : 'Receive text messages'),
            value: _smsNotifications,
            onChanged: (v) => setState(() => _smsNotifications = v),
            secondary: const Icon(Icons.sms_outlined),
          ),
          const Divider(),
          _buildSection(theme, _isUrdu ? 'پرائیویسی' : 'Privacy'),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: Text(_isUrdu ? 'پرائیویسی پالیسی' : 'Privacy Policy'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: Text(_isUrdu ? 'شرائط و ضوابط' : 'Terms of Service'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          const Divider(),
          _buildSection(theme, _isUrdu ? 'ایکائیو کے بارے میں' : 'About Acadivo'),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text(_isUrdu ? 'ورژن' : 'Version'),
            subtitle: const Text('1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.star_outline),
            title: Text(_isUrdu ? 'ایپ کو ریٹ کریں' : 'Rate the App'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSection(ThemeData theme, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.w700,
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildLanguageTile(ThemeData theme) {
    return ListTile(
      leading: const Icon(Icons.language),
      title: Text(_isUrdu ? 'زبان' : 'Language'),
      subtitle: Text(_isUrdu ? 'اردو' : 'English'),
      trailing: Switch(
        value: _isUrdu,
        onChanged: (v) => setState(() => _isUrdu = v),
      ),
    );
  }
}
