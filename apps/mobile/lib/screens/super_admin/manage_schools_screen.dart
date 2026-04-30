import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/super_admin_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';

class ManageSchoolsScreen extends ConsumerStatefulWidget {
  const ManageSchoolsScreen({super.key});

  @override
  ConsumerState<ManageSchoolsScreen> createState() => _ManageSchoolsScreenState();
}

class _ManageSchoolsScreenState extends ConsumerState<ManageSchoolsScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(superAdminProvider.notifier).loadSchools();
    });
  }

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
              onPressed: () async {
                Navigator.of(ctx).pop();
                final success = await ref.read(superAdminProvider.notifier).createSchool({
                  'name': nameController.text.trim(),
                  'city': cityController.text.trim(),
                });
                if (success && mounted) {
                  ref.read(superAdminProvider.notifier).loadSchools();
                }
              },
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
    final state = ref.watch(superAdminProvider);
    var filtered = state.schools;
    if (_searchController.text.isNotEmpty) {
      filtered = filtered.where((s) {
        final name = s['name']?.toString().toLowerCase() ?? '';
        return name.contains(_searchController.text.toLowerCase());
      }).toList();
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
          if (state.isLoading && state.schools.isEmpty)
            const Expanded(child: Center(child: LoadingWidget()))
          else if (state.error != null && state.schools.isEmpty)
            Expanded(child: AppErrorWidget(message: state.error!, onRetry: () => ref.read(superAdminProvider.notifier).loadSchools()))
          else
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
                            title: Text(s['name']?.toString() ?? ''),
                            subtitle: Text('${s['city']?.toString() ?? ''} | ${s['students']?.toString() ?? '0'} students'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                StatusBadge(
                                  label: s['plan']?.toString() ?? 'Basic',
                                  type: s['plan']?.toString() == 'Enterprise'
                                      ? StatusType.primary
                                      : s['plan']?.toString() == 'Premium'
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
