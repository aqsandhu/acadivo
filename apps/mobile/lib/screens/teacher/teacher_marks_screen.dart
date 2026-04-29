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
import '../../models/mark_model.dart';

class TeacherMarksScreen extends ConsumerStatefulWidget {
  const TeacherMarksScreen({super.key});
  @override
  ConsumerState<TeacherMarksScreen> createState() => _TeacherMarksScreenState();
}

class _TeacherMarksScreenState extends ConsumerState<TeacherMarksScreen> {
  bool _isLoading = true;
  String? _error;
  List<MarkModel> _marks = [];
  List<MarkModel> _filtered = [];
  final TextEditingController _searchController = TextEditingController();
  String _examType = 'midterm';

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      // Using a default classId - in real app would be selected
      final data = await service.getMarks(classId: 'default', examType: _examType);
      setState(() { _marks = data; _filtered = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _search(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _marks.where((m) =>
        (m.studentName?.toLowerCase().contains(q) ?? false) ||
        (m.subjectName?.toLowerCase().contains(q) ?? false)
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
          title: isUrdu ? 'نمبرز' : 'Marks',
          isUrdu: isUrdu,
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => context.push(RouteNames.teacherMarks + '/grade'),
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
                  hintText: isUrdu ? 'تلاش کریں...' : 'Search marks...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            Expanded(
              child: _isLoading && _marks.isEmpty
                ? const Center(child: LoadingWidget())
                : _error != null && _marks.isEmpty
                  ? AppErrorWidget(message: _error!, onRetry: _loadData)
                  : _filtered.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.score_outlined,
                        title: isUrdu ? 'کوئی نمبر نہیں' : 'No Marks',
                        subtitle: isUrdu ? 'کوئی نمبر درج نہیں' : 'No marks recorded yet.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _filtered.length,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (context, index) {
                            final m = _filtered[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: theme.colorScheme.tertiaryContainer,
                                  child: Text('${m.marksObtained ?? 0}', style: TextStyle(color: theme.colorScheme.tertiary, fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                                title: Text(m.studentName ?? 'Unknown', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text('${m.subjectName ?? ""} • ${m.examType ?? ""}'),
                                trailing: Text('${m.marksObtained ?? 0}/${m.totalMarks ?? 0}', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
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
