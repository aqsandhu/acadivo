import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class ManageStudentsScreen extends ConsumerStatefulWidget {
  const ManageStudentsScreen({super.key});

  @override
  ConsumerState<ManageStudentsScreen> createState() => _ManageStudentsScreenState();
}

class _ManageStudentsScreenState extends ConsumerState<ManageStudentsScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _students = [
    {'name': 'Ahmad Ali', 'class': '8-A', 'roll': 101, 'parent': 'Mr. Muhammad Ali'},
    {'name': 'Fatima Zahra', 'class': '9-B', 'roll': 45, 'parent': 'Mr. Khan'},
    {'name': 'Bilal Khan', 'class': '7-C', 'roll': 78, 'parent': 'Mrs. Ayesha'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    var filtered = _students;
    if (_searchController.text.isNotEmpty) {
      filtered = filtered.where((s) =>
        s['name'].toLowerCase().contains(_searchController.text.toLowerCase())
      ).toList();
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'طلباء کا انتظام' : 'Manage Students',
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () {}),
        ],
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: _isUrdu ? 'طلباء تلاش کریں...' : 'Search students...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: filtered.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.people_outline,
                    title: _isUrdu ? 'کوئی طالب علم نہیں ملا' : 'No Students Found',
                    subtitle: '',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final s = filtered[index];
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          leading: UserAvatar(name: s['name'], size: 44),
                          title: Text(s['name']),
                          subtitle: Text('${s['class']} | Roll: ${s['roll']} | Parent: ${s['parent']}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.edit, size: 20),
                            onPressed: () {},
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
