import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/status_badge.dart';

class ManageSchoolsScreen extends ConsumerStatefulWidget {
  const ManageSchoolsScreen({super.key});

  @override
  ConsumerState<ManageSchoolsScreen> createState() => _ManageSchoolsScreenState();
}

class _ManageSchoolsScreenState extends ConsumerState<ManageSchoolsScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _schools = [
    {'name': 'Govt. High School Lahore', 'city': 'Lahore', 'students': 850, 'status': 'active', 'plan': 'Premium'},
    {'name': 'Lahore Grammar School', 'city': 'Lahore', 'students': 1200, 'status': 'active', 'plan': 'Enterprise'},
    {'name': 'Beaconhouse Faisalabad', 'city': 'Faisalabad', 'students': 600, 'status': 'trial', 'plan': 'Basic'},
  ];

  void _showAddSchoolDialog() {
    final nameController = TextEditingController();
    final cityController = TextEditingController();
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
              _isUrdu ? 'اسکول شامل کریں' : 'Add School',
              style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            CustomTextField(label: _isUrdu ? 'اسکول کا نام' : 'School Name', controller: nameController),
            const SizedBox(height: 12),
            CustomTextField(label: _isUrdu ? 'شہر' : 'City', controller: cityController),
            const SizedBox(height: 16),
            CustomButton(
              label: _isUrdu ? 'شامل کریں' : 'Add',
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
    var filtered = _schools;
    if (_searchController.text.isNotEmpty) {
      filtered = filtered.where((s) =>
        s['name'].toLowerCase().contains(_searchController.text.toLowerCase())
      ).toList();
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'اسکولز کا انتظام' : 'Manage Schools',
        actions: [IconButton(icon: const Icon(Icons.add), onPressed: _showAddSchoolDialog)],
        isUrdu: _isUrdu,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: _isUrdu ? 'اسکول تلاش کریں...' : 'Search schools...',
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
                ? EmptyStateWidget(icon: Icons.business_outlined, title: _isUrdu ? 'کوئی اسکول نہیں' : 'No Schools', subtitle: '')
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
                          leading: CircleAvatar(
                            backgroundColor: theme.colorScheme.primaryContainer,
                            child: Icon(Icons.school, color: theme.colorScheme.primary),
                          ),
                          title: Text(s['name']),
                          subtitle: Text('${s['city']} | ${s['students']} students'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              StatusBadge(
                                label: s['plan'],
                                type: s['plan'] == 'Enterprise'
                                    ? StatusType.primary
                                    : s['plan'] == 'Premium'
                                        ? StatusType.info
                                        : StatusType.warning,
                              ),
                              const SizedBox(width: 8),
                              IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
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
        onPressed: _showAddSchoolDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
