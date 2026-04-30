import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/super_admin_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';

class PlatformUsersScreen extends ConsumerStatefulWidget {
  const PlatformUsersScreen({super.key});

  @override
  ConsumerState<PlatformUsersScreen> createState() => _PlatformUsersScreenState();
}

class _PlatformUsersScreenState extends ConsumerState<PlatformUsersScreen> {
  bool _isUrdu = false;
  final TextEditingController _searchController = TextEditingController();
  String? _roleFilter;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(superAdminProvider.notifier).loadUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(superAdminProvider);
    var filtered = state.users;
    if (_searchController.text.isNotEmpty) {
      filtered = filtered.where((u) {
        final name = u['name']?.toString().toLowerCase() ?? '';
        return name.contains(_searchController.text.toLowerCase());
      }).toList();
    }
    if (_roleFilter != null) {
      filtered = filtered.where((u) => u['role']?.toString() == _roleFilter).toList();
    }

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'تمام صارفین' : 'All Users',
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
                      hintText: _isUrdu ? 'صارفین تلاش کریں...' : 'Search users...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: theme.colorScheme.surface,
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: 8),
                PopupMenuButton<String?>(
                  icon: const Icon(Icons.filter_list),
                  onSelected: (v) => setState(() => _roleFilter = v),
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(value: null, child: Text('All Roles')),
                    const PopupMenuItem(value: 'teacher', child: Text('Teacher')),
                    const PopupMenuItem(value: 'student', child: Text('Student')),
                    const PopupMenuItem(value: 'parent', child: Text('Parent')),
                    const PopupMenuItem(value: 'admin', child: Text('Admin')),
                  ],
                ),
              ],
            ),
          ),
          if (state.isLoading && state.users.isEmpty)
            const Expanded(child: Center(child: LoadingWidget()))
          else if (state.error != null && state.users.isEmpty)
            Expanded(child: AppErrorWidget(message: state.error!, onRetry: () => ref.read(superAdminProvider.notifier).loadUsers()))
          else
            Expanded(
              child: filtered.isEmpty
                  ? EmptyStateWidget(icon: Icons.people_outline, title: _isUrdu ? 'کوئی صارف نہیں' : 'No Users', subtitle: '')
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final u = filtered[index];
                        final role = u['role']?.toString() ?? 'unknown';
                        return Card(
                          elevation: 0,
                          margin: const EdgeInsets.only(bottom: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: UserAvatar(name: u['name']?.toString() ?? 'U', size: 44),
                            title: Text(u['name']?.toString() ?? ''),
                            subtitle: Text('${u['email']?.toString() ?? ''} | ${u['school']?.toString() ?? ''}'),
                            trailing: StatusBadge(
                              label: role.toUpperCase(),
                              type: role == 'admin'
                                  ? StatusType.danger
                                  : role == 'teacher'
                                      ? StatusType.primary
                                      : role == 'student'
                                          ? StatusType.info
                                          : StatusType.success,
                            ),
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
