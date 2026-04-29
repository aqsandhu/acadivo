import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class SchoolSettingsScreen extends ConsumerStatefulWidget {
  const SchoolSettingsScreen({super.key});

  @override
  ConsumerState<SchoolSettingsScreen> createState() => _SchoolSettingsScreenState();
}

class _SchoolSettingsScreenState extends ConsumerState<SchoolSettingsScreen> {
  bool _isUrdu = false;
  final _nameController = TextEditingController(text: 'Govt. High School Lahore');
  final _addressController = TextEditingController(text: 'Main Road, Lahore');
  final _phoneController = TextEditingController(text: '042-1234567');
  final _emailController = TextEditingController(text: 'school@edu.pk');

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکول کی ترتیبات' : 'School Settings',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            _isUrdu ? 'اسکول کی معلومات' : 'School Information',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          CustomTextField(label: _isUrdu ? 'اسکول کا نام' : 'School Name', controller: _nameController),
          const SizedBox(height: 12),
          CustomTextField(label: _isUrdu ? 'پتہ' : 'Address', controller: _addressController, maxLines: 2),
          const SizedBox(height: 12),
          CustomTextField(label: _isUrdu ? 'فون' : 'Phone', controller: _phoneController, keyboardType: TextInputType.phone),
          const SizedBox(height: 12),
          CustomTextField(label: _isUrdu ? 'ای میل' : 'Email', controller: _emailController, keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 24),
          Text(
            _isUrdu ? 'اکیڈمک ترتیبات' : 'Academic Settings',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          ListTile(
            title: Text(_isUrdu ? 'حاضری کی قسم' : 'Attendance Type'),
            subtitle: const Text('Daily'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            title: Text(_isUrdu ? 'گریڈنگ سسٹم' : 'Grading System'),
            subtitle: const Text('A-F Scale'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            title: Text(_isUrdu ? 'امتحانی شیڈول' : 'Exam Schedule'),
            subtitle: const Text('2 Mid-terms + Final'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          const SizedBox(height: 24),
          CustomButton(
            label: _isUrdu ? 'ترتیبات محفوظ کریں' : 'Save Settings',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(_isUrdu ? 'ترتیبات محفوظ ہو گئیں' : 'Settings saved')),
              );
            },
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
