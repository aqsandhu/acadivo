import 'package:flutter/material.dart';

class FilePickerField extends StatelessWidget {
  final String label;
  final List<String> selectedFiles;
  final ValueChanged<List<String>>? onFilesChanged;
  final List<String> allowedExtensions;
  final bool allowMultiple;

  const FilePickerField({
    super.key,
    required this.label,
    this.selectedFiles = const [],
    this.onFilesChanged,
    this.allowedExtensions = const [],
    this.allowMultiple = true,
  });

  void _removeFile(int index) {
    final updated = [...selectedFiles];
    updated.removeAt(index);
    onFilesChanged?.call(updated);
  }

  void _addFile() {
    // Simulate file pick - in real app, use file_picker package
    final updated = [...selectedFiles, 'File ${selectedFiles.length + 1}'];
    onFilesChanged?.call(updated);
  }

  IconData _getFileIcon(String fileName) {
    final lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return Icons.picture_as_pdf;
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) {
      return Icons.image;
    }
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return Icons.description;
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return Icons.table_chart;
    return Icons.insert_drive_file;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        if (selectedFiles.isNotEmpty)
          Column(
            children: selectedFiles.asMap().entries.map((entry) {
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: theme.colorScheme.outlineVariant),
                ),
                child: ListTile(
                  leading: Icon(
                    _getFileIcon(entry.value),
                    color: theme.colorScheme.primary,
                  ),
                  title: Text(
                    entry.value,
                    style: theme.textTheme.bodyMedium,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: IconButton(
                    icon: Icon(Icons.close, color: theme.colorScheme.error, size: 18),
                    onPressed: () => _removeFile(entry.key),
                  ),
                ),
              );
            }).toList(),
          ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: _addFile,
          icon: const Icon(Icons.attach_file),
          label: const Text('Attach File'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 44),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }
}
