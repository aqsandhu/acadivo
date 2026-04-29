import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

import '../../services/principal_service.dart';
import '../../services/api_service.dart';
import '../../models/teacher_model.dart';

class SchoolTeachersScreen extends ConsumerStatefulWidget {
  const SchoolTeachersScreen({super.key});
  @override
  ConsumerState<SchoolTeachersScreen> createState() => _SchoolTeachersScreenState();
}

class _SchoolTeachersScreenState extends ConsumerState<SchoolTeachersScreen> {
  bool _isLoading = true;
  String? _error;
  List<TeacherModel> _teachers = [];
  List<TeacherModel> _filtered = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = PrincipalService(api);
      final data = await service.getTeachers();
      setState(() { _teachers = data; _filtered = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _search(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _teachers.where((t) =>
        t.name.toLowerCase().contains(q) ||
        (t.email?.toLowerCase().contains(q) ?? false) ||
        (t.subject?.toLowerCase().contains(q) ?? false)
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
          title: isUrdu ? 'اسکول کے اساتذہ' : 'School Teachers',
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
                  hintText: isUrdu ? 'تلاش کریں...' : 'Search teachers...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            Expanded(
              child: _isLoading && _teachers.isEmpty
                ? const Center(child: LoadingWidget())
                : _error != null && _teachers.isEmpty
                  ? AppErrorWidget(message: _error!, onRetry: _loadData)
                  : _filtered.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.school_outlined,
                        title: isUrdu ? 'کوئی استاد نہیں' : 'No Teachers Found',
                        subtitle: isUrdu ? 'تلاش کے مطابق کوئی استاد نہیں ملا' : 'No teachers match your search.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _filtered.length,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (context, index) {
                            final t = _filtered[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: UserAvatar(name: t.name, size: 40),
                                title: Text(t.name, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text(t.subject ?? t.email ?? ''),
                                trailing: StatusBadge(
                                  label: t.isActive ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive'),
                                  type: t.isActive ? StatusType.success : StatusType.error,
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
