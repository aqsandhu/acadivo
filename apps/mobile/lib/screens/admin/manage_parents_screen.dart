import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

import '../../services/admin_service.dart';
import '../../services/api_service.dart';
import '../../models/parent_model.dart';
import '../../providers/auth_provider.dart';

class ManageParentsScreen extends ConsumerStatefulWidget {
  const ManageParentsScreen({super.key});
  @override
  ConsumerState<ManageParentsScreen> createState() => _ManageParentsScreenState();
}

class _ManageParentsScreenState extends ConsumerState<ManageParentsScreen> {
  bool _isLoading = true;
  String? _error;
  List<ParentModel> _parents = [];
  List<ParentModel> _filtered = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = AdminService(api);
      // ParentModel list from users with parent role
      final users = await service.getUsers(role: UserRole.parent);
      setState(() {
        _parents = users.map((u) => ParentModel(
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
        )).toList();
        _filtered = _parents;
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _search(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _parents.where((p) =>
        p.name.toLowerCase().contains(q) ||
        (p.email?.toLowerCase().contains(q) ?? false) ||
        (p.phone?.toLowerCase().contains(q) ?? false)
      ).toList();
    });
  }

  @override
  void dispose() { _searchController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'والدین کا انتظام' : 'Manage Parents',
          isUrdu: isUrdu,
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                onChanged: _search,
                decoration: InputDecoration(
                  hintText: isUrdu ? 'تلاش کریں...' : 'Search parents...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            Expanded(
              child: _isLoading && _parents.isEmpty
                ? const Center(child: LoadingWidget())
                : _error != null && _parents.isEmpty
                  ? AppErrorWidget(message: _error!, onRetry: _loadData)
                  : _filtered.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.family_restroom_outlined,
                        title: isUrdu ? 'کوئی والدین نہیں' : 'No Parents Found',
                        subtitle: isUrdu ? 'تلاش کے مطابق کوئی والدین نہیں ملا' : 'No parents match your search.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _filtered.length,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (context, index) {
                            final p = _filtered[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: UserAvatar(name: p.name, size: 40),
                                title: Text(p.name, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text(p.phone ?? p.email ?? ''),
                              ),
                            );
                          },
                        ),
                      ),
            ),
          ],
        ),
      ),
    );
  }
}
