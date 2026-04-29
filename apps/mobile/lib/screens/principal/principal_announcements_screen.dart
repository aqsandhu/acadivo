import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class PrincipalAnnouncementsScreen extends ConsumerStatefulWidget {
  const PrincipalAnnouncementsScreen({super.key});

  @override
  ConsumerState<PrincipalAnnouncementsScreen> createState() => _PrincipalAnnouncementsScreenState();
}

class _PrincipalAnnouncementsScreenState extends ConsumerState<PrincipalAnnouncementsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _announcements = [
    {'title': 'Annual Sports Day', 'content': 'March 25th, 2024', 'date': '15 Mar', 'pinned': true},
    {'title': 'Parent Teacher Meeting', 'content': 'April 5th, 2024', 'date': '14 Mar', 'pinned': false},
  ];

  void _showCreateDialog() {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
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
            const SizedBox(height: 16),
            CustomButton(
              label: _isUrdu ? 'شائع کریں' : 'Publish',
              onPressed: () => Navigator.of(ctx).pop(),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکول کے اعلانات' : 'School Announcements',
        isUrdu: _isUrdu,
      ),
      body: ListView.builder(
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
              subtitle: Text(a['date']),
              trailing: IconButton(
                icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                onPressed: () {},
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateDialog,
        icon: const Icon(Icons.add),
        label: Text(_isUrdu ? 'اعلان' : 'Announce'),
      ),
    );
  }
}
