import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/custom_dropdown.dart';

class TeacherNotificationsScreen extends ConsumerStatefulWidget {
  const TeacherNotificationsScreen({super.key});

  @override
  ConsumerState<TeacherNotificationsScreen> createState() => _TeacherNotificationsScreenState();
}

class _TeacherNotificationsScreenState extends ConsumerState<TeacherNotificationsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  String _target = 'class';
  String? _selectedStudent;
  String? _selectedParent;
  bool _isLoading = false;
  bool _isUrdu = false;

  Future<void> _sendNotification() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() => _isLoading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isUrdu ? 'اطلاع بھیج دی گئی' : 'Notification sent successfully')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اطلاع بھیجیں' : 'Send Notification',
        isUrdu: _isUrdu,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            CustomTextField(
              label: _isUrdu ? 'عنوان' : 'Title',
              controller: _titleController,
              validator: (v) => v == null || v.isEmpty ? (_isUrdu ? 'عنوان درج کریں' : 'Enter title') : null,
            ),
            const SizedBox(height: 16),
            CustomTextField(
              label: _isUrdu ? 'پیغام' : 'Message',
              controller: _bodyController,
              maxLines: 4,
              validator: (v) => v == null || v.isEmpty ? (_isUrdu ? 'پیغام درج کریں' : 'Enter message') : null,
            ),
            const SizedBox(height: 16),
            Text(
              _isUrdu ? 'حصول' : 'Target',
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            RadioListTile<String>(
              title: Text(_isUrdu ? 'میری کلاس' : 'My Class'),
              value: 'class',
              groupValue: _target,
              onChanged: (v) => setState(() => _target = v!),
            ),
            RadioListTile<String>(
              title: Text(_isUrdu ? 'خصوصی طالب علم' : 'Specific Student'),
              value: 'student',
              groupValue: _target,
              onChanged: (v) => setState(() => _target = v!),
            ),
            RadioListTile<String>(
              title: Text(_isUrdu ? 'خصوصی والدین' : 'Specific Parent'),
              value: 'parent',
              groupValue: _target,
              onChanged: (v) => setState(() => _target = v!),
            ),
            if (_target == 'student') ...[
              const SizedBox(height: 16),
              CustomDropdown<String>(
                label: _isUrdu ? 'طالب علم منتخب کریں' : 'Select Student',
                value: _selectedStudent,
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Ahmad Ali')),
                  DropdownMenuItem(value: '2', child: Text('Bilal Khan')),
                  DropdownMenuItem(value: '3', child: Text('Fatima Zahra')),
                ],
                onChanged: (v) => setState(() => _selectedStudent = v),
              ),
            ],
            if (_target == 'parent') ...[
              const SizedBox(height: 16),
              CustomDropdown<String>(
                label: _isUrdu ? 'والدین منتخب کریں' : 'Select Parent',
                value: _selectedParent,
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Mr. Ahmed (Ahmad's Father)')),
                  DropdownMenuItem(value: '2', child: Text('Mrs. Khan (Bilal's Mother)')),
                ],
                onChanged: (v) => setState(() => _selectedParent = v),
              ),
            ],
            const SizedBox(height: 24),
            CustomButton(
              label: _isUrdu ? 'بھیجیں' : 'Send',
              isLoading: _isLoading,
              onPressed: _sendNotification,
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
