import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';

class ManageClassesScreen extends ConsumerStatefulWidget {
  const ManageClassesScreen({super.key});

  @override
  ConsumerState<ManageClassesScreen> createState() => _ManageClassesScreenState();
}

class _ManageClassesScreenState extends ConsumerState<ManageClassesScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _classes = [
    {'name': 'Class 8', 'sections': ['A', 'B', 'C'], 'students': 95},
    {'name': 'Class 9', 'sections': ['A', 'B'], 'students': 62},
    {'name': 'Class 10', 'sections': ['A', 'B', 'C', 'D'], 'students': 120},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'کلاسز کا انتظام' : 'Manage Classes',
        actions: [IconButton(icon: const Icon(Icons.add), onPressed: () {})],
        isUrdu: _isUrdu,
      ),
      body: _classes.isEmpty
          ? EmptyStateWidget(
              icon: Icons.class_outlined,
              title: _isUrdu ? 'کوئی کلاسز نہیں' : 'No Classes',
              subtitle: '',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _classes.length,
              itemBuilder: (context, index) {
                final c = _classes[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: ExpansionTile(
                    title: Text(c['name']),
                    subtitle: Text('${c['students']} students | ${c['sections'].length} sections'),
                    children: c['sections'].map<Widget>((s) => ListTile(
                      title: Text('Section $s'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
                          IconButton(icon: const Icon(Icons.delete, size: 20, color: Colors.red), onPressed: () {}),
                        ],
                      ),
                    )).toList(),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
