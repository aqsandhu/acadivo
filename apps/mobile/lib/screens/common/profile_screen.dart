import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/user_avatar.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController(text: '03001234567');
  final _emailController = TextEditingController(text: 'user@school.edu.pk');
  final _addressController = TextEditingController(text: 'Lahore, Pakistan');
  bool _isEditing = false;
  bool _isUrdu = false;

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(_isUrdu ? 'لاگ آؤٹ' : 'Logout'),
        content: Text(_isUrdu ? 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟' : 'Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(_isUrdu ? 'منسوخ' : 'Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              // logout logic
            },
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            child: Text(_isUrdu ? 'لاگ آؤٹ' : 'Logout'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'پروفائل' : 'Profile',
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.check : Icons.edit),
            onPressed: () => setState(() => _isEditing = !_isEditing),
          ),
        ],
        isUrdu: _isUrdu,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Center(
              child: Stack(
                children: [
                  const UserAvatar(name: 'Ali Khan', size: 100, imageUrl: null),
                  if (_isEditing)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt, size: 18, color: Colors.white),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                'Ali Khan',
                style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 4),
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  'Teacher',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Center(
              child: Text(
                'Govt. High School Lahore',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Center(
              child: Text(
                'ID: TCH-2024-001',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  fontFamily: 'monospace',
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 16),
            Text(
              _isUrdu ? 'رابطہ کی معلومات' : 'Contact Information',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: _isUrdu ? 'فون نمبر' : 'Phone Number',
              controller: _phoneController,
              prefixIcon: const Icon(Icons.phone_outlined),
              readOnly: !_isEditing,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: _isUrdu ? 'ای میل' : 'Email',
              controller: _emailController,
              prefixIcon: const Icon(Icons.email_outlined),
              readOnly: !_isEditing,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: _isUrdu ? 'پتہ' : 'Address',
              controller: _addressController,
              prefixIcon: const Icon(Icons.location_on_outlined),
              readOnly: !_isEditing,
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            CustomButton(
              label: _isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Change Password',
              variant: ButtonVariant.outlined,
              onPressed: () {},
            ),
            const SizedBox(height: 16),
            CustomButton(
              label: _isUrdu ? 'لاگ آؤٹ' : 'Logout',
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              onPressed: _showLogoutDialog,
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
