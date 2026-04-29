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

import '../../providers/auth_provider.dart';
import '../../models/user_model.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isEditing = false;
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _nameController.text = user?.name ?? '';
    _phoneController.text = user?.phone ?? '';
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    final updated = user.copyWith(name: _nameController.text.trim(), phone: _phoneController.text.trim());
    final success = await ref.read(authProvider.notifier).updateUser(updated);
    setState(() => _isSaving = false);
    if (success) {
      setState(() => _isEditing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ref.read(isRtlProvider) ? 'پروفائل اپ ڈیٹ ہو گئی' : 'Profile updated')),
        );
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    final user = ref.watch(currentUserProvider);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'پروفائل' : 'Profile',
          actions: [
            IconButton(
              icon: Icon(_isEditing ? Icons.close : Icons.edit),
              onPressed: () => setState(() => _isEditing = !_isEditing),
            ),
          ],
          isUrdu: isUrdu,
        ),
        body: user == null
            ? const Center(child: LoadingWidget())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: theme.colorScheme.primaryContainer,
                      child: Text(
                        user.name.substring(0, 1).toUpperCase(),
                        style: TextStyle(fontSize: 32, color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (_isEditing) ...[
                      TextField(
                        controller: _nameController,
                        decoration: InputDecoration(
                          labelText: isUrdu ? 'نام' : 'Name',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _phoneController,
                        decoration: InputDecoration(
                          labelText: isUrdu ? 'فون' : 'Phone',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _save,
                          child: _isSaving
                            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                            : Text(isUrdu ? 'محفوظ کریں' : 'Save'),
                        ),
                      ),
                    ] else ...[
                      Text(user.name, style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(user.email, style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                      const SizedBox(height: 4),
                      Chip(
                        label: Text(user.role.value.toUpperCase()),
                        backgroundColor: theme.colorScheme.primaryContainer,
                      ),
                      const SizedBox(height: 24),
                      Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          children: [
                            ListTile(
                              leading: const Icon(Icons.badge_outlined),
                              title: Text(isUrdu ? 'یونیک آئی ڈی' : 'Unique ID'),
                              subtitle: Text(user.uniqueId),
                            ),
                            const Divider(height: 1),
                            ListTile(
                              leading: const Icon(Icons.phone_outlined),
                              title: Text(isUrdu ? 'فون' : 'Phone'),
                              subtitle: Text(user.phone ?? (isUrdu ? 'درج نہیں' : 'Not provided')),
                            ),
                            const Divider(height: 1),
                            ListTile(
                              leading: const Icon(Icons.school_outlined),
                              title: Text(isUrdu ? 'اسکول' : 'School'),
                              subtitle: Text(user.schoolName ?? (isUrdu ? 'درج نہیں' : 'Not provided')),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: OutlinedButton(
                          onPressed: () => context.push(RouteNames.settings),
                          child: Text(isUrdu ? 'ترتیبات' : 'Settings'),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: () => ref.read(authProvider.notifier).logout(),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                          child: Text(isUrdu ? 'لاگ آؤٹ' : 'Logout'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
      ),
    );
  }
}
