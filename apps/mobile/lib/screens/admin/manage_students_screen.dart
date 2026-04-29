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
import '../../models/student_model.dart';
import '../../providers/auth_provider.dart';

class ManageStudentsScreen extends ConsumerStatefulWidget {
  const ManageStudentsScreen({super.key});
  @override
  ConsumerState<ManageStudentsScreen> createState() => _ManageStudentsScreenState();
}

class _ManageStudentsScreenState extends ConsumerState<ManageStudentsScreen> {
  bool _isLoading = true;
  String? _error;
  List<StudentModel> _students = [];
  List<StudentModel> _filtered = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = AdminService(api);
      final data = await service.getStudents();
      setState(() {
        _students = data;
        _filtered = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _search(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _students.where((s) =>
        s.name.toLowerCase().contains(q) ||
        (s.uniqueId?.toLowerCase().contains(q) ?? false) ||
        (s.className?.toLowerCase().contains(q) ?? false)
      ).toList();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'طلباء کا انتظام' : 'Manage Students',
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
                  hintText: isUrdu ? 'تلاش کریں...' : 'Search students...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            Expanded(
              child: _isLoading && _students.isEmpty
                ? const Center(child: LoadingWidget())
                : _error != null && _students.isEmpty
                  ? AppErrorWidget(message: _error!, onRetry: _loadData)
                  : _filtered.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.people_outline,
                        title: isUrdu ? 'کوئی طالب علم نہیں' : 'No Students Found',
                        subtitle: isUrdu ? 'تلاش کے مطابق کوئی طالب علم نہیں ملا' : 'No students match your search.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _filtered.length,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (context, index) {
                            final s = _filtered[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: UserAvatar(name: s.name, size: 40),
                                title: Text(s.name, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text('${s.className ?? ""} • ${s.sectionName ?? ""}'),
                                trailing: StatusBadge(
                                  label: s.isActive ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive'),
                                  type: s.isActive ? StatusType.success : StatusType.error,
                                ),
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
