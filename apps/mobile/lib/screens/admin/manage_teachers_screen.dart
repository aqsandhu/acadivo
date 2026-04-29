import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';

class ManageTeachersScreen extends ConsumerStatefulWidget {
  const ManageTeachersScreen({super.key});

  @override
  ConsumerState<ManageTeachersScreen> createState() => _ManageTeachersScreenState();
}

class _ManageTeachersScreenState extends ConsumerState<ManageTeachersScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();
  String? _filterSubject;

  final List<Map<String, dynamic>> _teachers = [
    {'name': 'Mr. Ali Khan', 'subject': 'Mathematics', 'classes': '8-A, 9-B', 'phone': '03001234567', 'status': 'active'},
    {'name': 'Mrs. Fatima Hassan', 'subject': 'Science', 'classes': '7-A, 10-C', 'phone': '03001234568', 'status': 'active'},
    {'name': 'Mr. Imran Raza', 'subject': 'English', 'classes': '8-B, 9-A', 'phone': '03001234569', 'status': 'on_leave'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    var filtered = _teachers;
    if (_searchController.text.isNotEmpty) {
      filtered = filtered.where((t) =>
        t['name'].toLowerCase().contains(_searchController.text.toLowerCase())
      ).toList();
    }
    if (_filterSubject != null) {
      filtered = filtered.where((t) => t['subject'] == _filterSubject).toList();
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اساتذہ کا انتظام' : 'Manage Teachers',
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {},
          ),
        ],
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: _isUrdu ? 'اساتذہ تلاش کریں...' : 'Search teachers...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: theme.colorScheme.surface,
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: 8),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.filter_list),
                  onSelected: (v) => setState(() => _filterSubject = v),
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(value: null, child: Text('All')),
                    const PopupMenuItem(value: 'Mathematics', child: Text('Mathematics')),
                    const PopupMenuItem(value: 'Science', child: Text('Science')),
                    const PopupMenuItem(value: 'English', child: Text('English')),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: filtered.isEmpty
                ? EmptyStateWidget(
                    icon: Icons.people_outline,
                    title: _isUrdu ? 'کوئی استاد نہیں ملا' : 'No Teachers Found',
                    subtitle: '',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final t = filtered[index];
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          leading: UserAvatar(name: t['name'], size: 44),
                          title: Text(t['name']),
                          subtitle: Text('${t['subject']} | ${t['classes']}'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              StatusBadge(
                                label: t['status'],
                                type: t['status'] == 'active' ? StatusType.success : StatusType.warning,
                              ),
                              IconButton(
                                icon: const Icon(Icons.edit, size: 20),
                                onPressed: () {},
                              ),
                            ],
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
