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

import '../../services/student_service.dart';
import '../../services/api_service.dart';
import '../../models/result_model.dart';

class StudentMarksScreen extends ConsumerStatefulWidget {
  const StudentMarksScreen({super.key});
  @override
  ConsumerState<StudentMarksScreen> createState() => _StudentMarksScreenState();
}

class _StudentMarksScreenState extends ConsumerState<StudentMarksScreen> {
  bool _isLoading = true;
  String? _error;
  List<ResultModel> _results = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = StudentService(api);
      final data = await service.getMyResults();
      setState(() { _results = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

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
        body: _isLoading && _results.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _results.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _results.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.score_outlined,
                        title: isUrdu ? 'کوئی نمبر نہیں' : 'No Marks',
                        subtitle: isUrdu ? 'کوئی نتیجہ دستیاب نہیں' : 'No results available yet.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _results.length,
                          padding: const EdgeInsets.all(16),
                          itemBuilder: (context, index) {
                            final r = _results[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: theme.colorScheme.tertiaryContainer,
                                  child: Text('${(r.totalMarksObtained ?? 0).toStringAsFixed(0)}', style: TextStyle(color: theme.colorScheme.tertiary, fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                                title: Text(r.examType ?? 'Exam', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text('${r.grade ?? ""} • Percentage: ${r.percentage?.toStringAsFixed(1) ?? "N/A"}%'),
                                trailing: Text(
                                  '${(r.totalMarksObtained ?? 0).toStringAsFixed(0)}/${(r.totalMaxMarks ?? 0).toStringAsFixed(0)}',
                                  style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
