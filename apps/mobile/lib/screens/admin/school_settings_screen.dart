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
import '../../services/api_service.dart';

class SchoolSettingsScreen extends ConsumerStatefulWidget {
  const SchoolSettingsScreen({super.key});
  @override
  ConsumerState<SchoolSettingsScreen> createState() => _SchoolSettingsScreenState();
}

class _SchoolSettingsScreenState extends ConsumerState<SchoolSettingsScreen> {
  bool _isLoading = false;
  bool _isSaving = false;
  final _schoolNameController = TextEditingController();
  final _schoolHoursController = TextEditingController();
  bool _pushNotifications = true;
  bool _emailNotifications = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final response = await api.dio.get('/admin/settings');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] ?? response.data ?? {};
        setState(() {
          _schoolNameController.text = data['schoolName']?.toString() ?? '';
          _schoolHoursController.text = data['schoolHours']?.toString() ?? '';
          _pushNotifications = data['pushNotifications'] ?? true;
          _emailNotifications = data['emailNotifications'] ?? false;
        });
      }
    } catch (e) {
      debugPrint('Failed to load settings: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isSaving = true);
    try {
      final api = ref.read(apiServiceProvider);
      await api.dio.put('/admin/settings', data: {
        'schoolName': _schoolNameController.text.trim(),
        'schoolHours': _schoolHoursController.text.trim(),
        'pushNotifications': _pushNotifications,
        'emailNotifications': _emailNotifications,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ref.read(isRtlProvider) ? 'ترتیبات محفوظ ہو گئیں' : 'Settings saved successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    _schoolNameController.dispose();
    _schoolHoursController.dispose();
    super.dispose();
  }

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
          actions: [
            if (_isSaving)
              const Padding(
                padding: EdgeInsets.all(16),
                child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
              )
            else
              IconButton(
                icon: const Icon(Icons.save),
                onPressed: _saveSettings,
              ),
          ],
        ),
        body: _isLoading
            ? const Center(child: LoadingWidget())
            : ListView(
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
                          subtitle: TextField(
                            controller: _schoolNameController,
                            decoration: const InputDecoration(
                              hintText: 'Enter school name',
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                        const Divider(height: 1),
                        ListTile(
                          leading: const Icon(Icons.schedule_outlined),
                          title: Text(isUrdu ? 'اسکول کا وقت' : 'School Hours'),
                          subtitle: TextField(
                            controller: _schoolHoursController,
                            decoration: const InputDecoration(
                              hintText: 'e.g. 8:00 AM - 2:00 PM',
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
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
                          value: _pushNotifications,
                          onChanged: (v) => setState(() => _pushNotifications = v),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          secondary: const Icon(Icons.email_outlined),
                          title: Text(isUrdu ? 'ای میل نوٹیفیکیشن' : 'Email Notifications'),
                          subtitle: Text(isUrdu ? 'ای میل نوٹیفیکیشن وصول کریں' : 'Receive email notifications'),
                          value: _emailNotifications,
                          onChanged: (v) => setState(() => _emailNotifications = v),
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
