import 'package:flutter/material.dart';
import 'custom_text_field.dart';

class DatePickerField extends StatelessWidget {
  final String label;
  final DateTime? selectedDate;
  final ValueChanged<DateTime?>? onDateSelected;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final String? Function(DateTime?)? validator;

  const DatePickerField({
    super.key,
    required this.label,
    this.selectedDate,
    this.onDateSelected,
    this.firstDate,
    this.lastDate,
    this.validator,
  });

  String get _formattedDate {
    if (selectedDate == null) return '';
    return '${selectedDate!.day.toString().padLeft(2, '0')}/${selectedDate!.month.toString().padLeft(2, '0')}/${selectedDate!.year}';
  }

  Future<void> _pickDate(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDate ?? now,
      firstDate: firstDate ?? DateTime(now.year - 5),
      lastDate: lastDate ?? DateTime(now.year + 5),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            dialogBackgroundColor: Theme.of(context).colorScheme.surface,
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      onDateSelected?.call(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      label: label,
      hint: 'Select date',
      readOnly: true,
      onTap: () => _pickDate(context),
      prefixIcon: const Icon(Icons.calendar_today_outlined),
      controller: TextEditingController(text: _formattedDate),
      validator: validator != null
          ? (_) => validator!(selectedDate)
          : null,
    );
  }
}
