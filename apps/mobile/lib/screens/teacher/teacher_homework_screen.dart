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

import '../../services/teacher_service.dart';
import '../../services/api_service.dart';
import '../../models/homework_model.dart';

class TeacherHomeworkScreen extends ConsumerStatefulWidget {
  const TeacherHomeworkScreen({super.key});
  @override
  ConsumerState<TeacherHomeworkScreen> createState() => _TeacherHomeworkScreenState();
}

class _TeacherHomeworkScreenState extends ConsumerState<TeacherHomeworkScreen> {
  bool _isLoading = true;
  String? _error;
  List<HomeworkModel> _homework = [];
  List<HomeworkModel> _filtered = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      final data = await service.getHomework();
      setState(() { _homework = data; _filtered = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _search(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _homework.where((h) =>
        h.title.toLowerCase().contains(q) ||
        (h.subjectName?.toLowerCase().contains(q) ?? false)
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
          title: isUrdu ? 'ہوم ورک' : 'Homework',
          isUrdu: isUrdu,
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => context.push(RouteNames.teacherHomework + '/create'),
          child: const Icon(Icons.add),
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                controller: _searchController,
                onChanged: _search,
                decoration: InputDecoration(
                  hintText: isUrdu ? 'تلاش کریں...' : 'Search homework...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            Expanded(
              child: _isLoading && _homework.isEmpty
                ? const Center(child: LoadingWidget())
                : _error != null && _homework.isEmpty
                  ? AppErrorWidget(message: _error!, onRetry: _loadData)
                  : _filtered.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.assignment_outlined,
                        title: isUrdu ? 'کوئی ہوم ورک نہیں' : 'No Homework',
                        subtitle: isUrdu ? 'کوئی ہوم ورک تفویض نہیں کیا گیا' : 'No homework assigned yet.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _filtered.length,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (context, index) {
                            final h = _filtered[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: theme.colorScheme.secondaryContainer,
                                  child: Icon(Icons.assignment, color: theme.colorScheme.secondary, size: 18),
                                ),
                                title: Text(h.title, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text('${h.subjectName ?? ""} • ${h.className ?? ""}'),
                                trailing: StatusBadge(
                                  label: h.status,
                                  type: h.isActive ? StatusType.success : StatusType.info,
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
