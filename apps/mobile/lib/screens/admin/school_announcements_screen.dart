import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/empty_state_widget.dart';

class SchoolAnnouncementsScreen extends ConsumerStatefulWidget {
  const SchoolAnnouncementsScreen({super.key});

  @override
  ConsumerState<SchoolAnnouncementsScreen> createState() => _SchoolAnnouncementsScreenState();
}

class _SchoolAnnouncementsScreenState extends ConsumerState<SchoolAnnouncementsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _announcements = [
    {'title': 'Annual Sports Day', 'content': 'On March 25th', 'author': 'Principal', 'date': '15 Mar', 'pinned': true},
    {'title': 'Fee Deadline Extended', 'content': 'Due date is now March 20th', 'author': 'Admin', 'date': '14 Mar', 'pinned': false},
  ];

  void _showCreateDialog() {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    bool isPinned = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 16, right: 16, top: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isUrdu ? 'اعلان بنائیں' : 'Create Announcement',
                style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              CustomTextField(label: _isUrdu ? 'عنوان' : 'Title', controller: titleController),
              const SizedBox(height: 12),
              CustomTextField(
                label: _isUrdu ? 'مواد' : 'Content',
                controller: contentController,
                maxLines: 4,
              ),
              const SizedBox(height: 8),
              CheckboxListTile(
                title: Text(_isUrdu ? 'سب سے اوپر رکھیں' : 'Pin to top'),
                value: isPinned,
                onChanged: (v) => setState(() => isPinned = v!),
                controlAffinity: ListTileControlAffinity.leading,
              ),
              const SizedBox(height: 16),
              CustomButton(
                label: _isUrdu ? 'شائع کریں' : 'Publish',
                onPressed: () => Navigator.of(ctx).pop(),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'نوٹس بورڈ' : 'Noticeboard',
        isUrdu: _isUrdu,
      ),
      body: _announcements.isEmpty
          ? EmptyStateWidget(
              icon: Icons.campaign_outlined,
              title: _isUrdu ? 'کوئی اعلانات نہیں' : 'No Announcements',
              subtitle: '',
              actionLabel: 'Create',
              onAction: _showCreateDialog,
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _announcements.length,
              itemBuilder: (context, index) {
                final a = _announcements[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: a['pinned']
                          ? theme.colorScheme.primary.withOpacity(0.3)
                          : theme.colorScheme.outlineVariant.withOpacity(0.5),
                    ),
                  ),
                  child: ListTile(
                    leading: a['pinned']
                        ? Icon(Icons.push_pin, color: theme.colorScheme.primary)
                        : const Icon(Icons.campaign_outlined),
                    title: Text(a['title']),
                    subtitle: Text('${a['author']} • ${a['date']}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
                        IconButton(icon: const Icon(Icons.delete, size: 20, color: Colors.red), onPressed: () {}),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateDialog,
        icon: const Icon(Icons.add),
        label: Text(_isUrdu ? 'اعلان' : 'Announcement'),
      ),
    );
  }
}
