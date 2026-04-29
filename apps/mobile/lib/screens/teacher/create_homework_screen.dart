import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/custom_dropdown.dart';
import '../../widgets/date_picker_field.dart';
import '../../widgets/file_picker_field.dart';

class CreateHomeworkScreen extends ConsumerStatefulWidget {
  const CreateHomeworkScreen({super.key});

  @override
  ConsumerState<CreateHomeworkScreen> createState() => _CreateHomeworkScreenState();
}

class _CreateHomeworkScreenState extends ConsumerState<CreateHomeworkScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _marksController = TextEditingController();
  String? _selectedClass;
  String? _selectedSubject;
  DateTime? _dueDate;
  List<String> _attachments = [];
  bool _isLoading = false;
  bool _isUrdu = false;

  Future<void> _publish(bool isDraft) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() => _isLoading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isDraft ? 'Draft saved' : 'Homework published')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'ہوم ورک بنائیں' : 'Create Homework',
        isUrdu: _isUrdu,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            CustomTextField(
              label: _isUrdu ? 'عنوان' : 'Title',
              hint: _isUrdu ? 'ہوم ورک کا عنوان' : 'Homework title',
              controller: _titleController,
              validator: (v) => v == null || v.isEmpty ? (_isUrdu ? 'عنوان درج کریں' : 'Enter title') : null,
            ),
            const SizedBox(height: 16),
            CustomTextField(
              label: _isUrdu ? 'تفصیل' : 'Description',
              hint: _isUrdu ? 'ہوم ورک کی تفصیل' : 'Describe the homework',
              controller: _descController,
              maxLines: 4,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: CustomDropdown<String>(
                    label: _isUrdu ? 'کلاس' : 'Class',
                    value: _selectedClass,
                    items: const [
                      DropdownMenuItem(value: '8-A', child: Text('Class 8-A')),
                      DropdownMenuItem(value: '9-B', child: Text('Class 9-B')),
                      DropdownMenuItem(value: '10-C', child: Text('Class 10-C')),
                    ],
                    onChanged: (v) => setState(() => _selectedClass = v),
                    validator: (v) => v == null ? (_isUrdu ? 'کلاس منتخب کریں' : 'Select class') : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomDropdown<String>(
                    label: _isUrdu ? 'مضمون' : 'Subject',
                    value: _selectedSubject,
                    items: const [
                      DropdownMenuItem(value: 'math', child: Text('Mathematics')),
                      DropdownMenuItem(value: 'science', child: Text('Science')),
                      DropdownMenuItem(value: 'physics', child: Text('Physics')),
                    ],
                    onChanged: (v) => setState(() => _selectedSubject = v),
                    validator: (v) => v == null ? (_isUrdu ? 'مضمون منتخب کریں' : 'Select subject') : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            DatePickerField(
              label: _isUrdu ? 'آخری تاریخ' : 'Due Date',
              selectedDate: _dueDate,
              onDateSelected: (d) => setState(() => _dueDate = d),
              validator: (v) => v == null ? (_isUrdu ? 'تاریخ منتخب کریں' : 'Select due date') : null,
            ),
            const SizedBox(height: 16),
            CustomTextField(
              label: _isUrdu ? 'زیادہ سے زیادہ نمبر' : 'Max Marks',
              controller: _marksController,
              keyboardType: TextInputType.number,
              prefixIcon: const Icon(Icons.score_outlined),
            ),
            const SizedBox(height: 16),
            FilePickerField(
              label: _isUrdu ? 'منسلکات' : 'Attachments',
              selectedFiles: _attachments,
              onFilesChanged: (files) => setState(() => _attachments = files),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: CustomButton(
                    label: _isUrdu ? 'ڈرافٹ' : 'Save Draft',
                    variant: ButtonVariant.outlined,
                    onPressed: () => _publish(true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomButton(
                    label: _isUrdu ? 'شائع کریں' : 'Publish',
                    isLoading: _isLoading,
                    onPressed: () => _publish(false),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
