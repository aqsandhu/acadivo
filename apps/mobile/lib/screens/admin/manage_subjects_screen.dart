import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';

class ManageSubjectsScreen extends ConsumerStatefulWidget {
  const ManageSubjectsScreen({super.key});

  @override
  ConsumerState<ManageSubjectsScreen> createState() => _ManageSubjectsScreenState();
}

class _ManageSubjectsScreenState extends ConsumerState<ManageSubjectsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _subjects = [
    {'name': 'Mathematics', 'code': 'MATH', 'teachers': 5},
    {'name': 'Science', 'code': 'SCI', 'teachers': 4},
    {'name': 'English', 'code': 'ENG', 'teachers': 6},
    {'name': 'Urdu', 'code': 'URD', 'teachers': 5},
    {'name': 'Pakistan Studies', 'code': 'PKS', 'teachers': 3},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'مضامین کا انتظام' : 'Manage Subjects',
        actions: [IconButton(icon: const Icon(Icons.add), onPressed: () {})],
        isUrdu: _isUrdu,
      ),
      body: _subjects.isEmpty
          ? EmptyStateWidget(icon: Icons.book_outlined, title: _isUrdu ? 'کوئی مضامین نہیں' : 'No Subjects', subtitle: '')
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _subjects.length,
              itemBuilder: (context, index) {
                final s = _subjects[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: theme.colorScheme.primaryContainer,
                      child: Text(s['code'], style: TextStyle(fontSize: 12, color: theme.colorScheme.primary)),
                    ),
                    title: Text(s['name']),
                    subtitle: Text('${s['teachers']} teachers'),
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
      floatingActionButton: FloatingActionButton(onPressed: () {}, child: const Icon(Icons.add)),
    );
  }
}
