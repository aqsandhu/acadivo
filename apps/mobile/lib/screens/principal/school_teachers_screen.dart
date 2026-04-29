import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class SchoolTeachersScreen extends ConsumerStatefulWidget {
  const SchoolTeachersScreen({super.key});

  @override
  ConsumerState<SchoolTeachersScreen> createState() => _SchoolTeachersScreenState();
}

class _SchoolTeachersScreenState extends ConsumerState<SchoolTeachersScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _teachers = [
    {'name': 'Mr. Ali Khan', 'subject': 'Mathematics', 'classes': '8-A, 9-B', 'phone': '03001234567'},
    {'name': 'Mrs. Fatima Hassan', 'subject': 'Science', 'classes': '7-A, 10-C', 'phone': '03001234568'},
    {'name': 'Mr. Imran Raza', 'subject': 'English', 'classes': '8-B, 9-A', 'phone': '03001234569'},
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

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکول کے اساتذہ' : 'School Teachers',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
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
          Expanded(
            child: filtered.isEmpty
                ? EmptyStateWidget(icon: Icons.people_outline, title: _isUrdu ? 'کوئی استاد نہیں' : 'No Teachers', subtitle: '')
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
                          subtitle: Text('${t['subject']} | ${t['classes']} | ${t['phone']}'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {},
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
