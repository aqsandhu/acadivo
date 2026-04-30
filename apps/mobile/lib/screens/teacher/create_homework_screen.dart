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

import '../../services/teacher_service.dart';
import '../../services/api_service.dart';

class CreateHomeworkScreen extends ConsumerStatefulWidget {
  const CreateHomeworkScreen({super.key});
  @override
  ConsumerState<CreateHomeworkScreen> createState() => _CreateHomeworkScreenState();
}

class _CreateHomeworkScreenState extends ConsumerState<CreateHomeworkScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isLoading = false;
  DateTime? _dueDate;

  Future<void> _pickDueDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? now.add(const Duration(days: 7)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _dueDate = picked);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dueDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(ref.read(isRtlProvider) ? 'تاریخ منتخب کریں' : 'Please select a due date')),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      await service.createHomework({
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'dueDate': _dueDate!.toIso8601String(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ref.read(isRtlProvider) ? 'ہوم ورک بنایا گیا' : 'Homework created successfully')),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
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
          title: isUrdu ? 'ہوم ورک بنائیں' : 'Create Homework',
          isUrdu: isUrdu,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    labelText: isUrdu ? 'عنوان' : 'Title',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (v) => v == null || v.isEmpty ? (isUrdu ? 'عنوان درج کریں' : 'Please enter title') : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _descriptionController,
                  maxLines: 5,
                  decoration: InputDecoration(
                    labelText: isUrdu ? 'تفصیل' : 'Description',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (v) => v == null || v.isEmpty ? (isUrdu ? 'تفصیل درج کریں' : 'Please enter description') : null,
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: _pickDueDate,
                  borderRadius: BorderRadius.circular(12),
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: isUrdu ? 'آخری تاریخ' : 'Due Date',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      suffixIcon: const Icon(Icons.calendar_today),
                    ),
                    child: Text(
                      _dueDate != null
                          ? '${_dueDate!.day}/${_dueDate!.month}/${_dueDate!.year}'
                          : (isUrdu ? 'تاریخ منتخب کریں' : 'Select date'),
                      style: TextStyle(
                        color: _dueDate != null ? theme.colorScheme.onSurface : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    child: _isLoading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                      : Text(isUrdu ? 'بنائیں' : 'Create', style: const TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
