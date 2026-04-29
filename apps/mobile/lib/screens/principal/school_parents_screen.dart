import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class SchoolParentsScreen extends ConsumerStatefulWidget {
  const SchoolParentsScreen({super.key});

  @override
  ConsumerState<SchoolParentsScreen> createState() => _SchoolParentsScreenState();
}

class _SchoolParentsScreenState extends ConsumerState<SchoolParentsScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _parents = [
    {'name': 'Mr. Muhammad Ali', 'phone': '03001234567', 'children': 'Ahmad Ali, Fatima Ali'},
    {'name': 'Mrs. Ayesha Khan', 'phone': '03001234568', 'children': 'Bilal Khan'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    var filtered = _parents;
    if (_searchController.text.isNotEmpty) {
      filtered = filtered.where((p) =>
        p['name'].toLowerCase().contains(_searchController.text.toLowerCase())
      ).toList();
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکول کے والدین' : 'School Parents',
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: _isUrdu ? 'والدین تلاش کریں...' : 'Search parents...',
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
                ? EmptyStateWidget(icon: Icons.family_restroom_outlined, title: _isUrdu ? 'کوئی والدین نہیں' : 'No Parents', subtitle: '')
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final p = filtered[index];
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          leading: UserAvatar(name: p['name'], size: 44),
                          title: Text(p['name']),
                          subtitle: Text('${p['phone']} | Children: ${p['children']}'),
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
