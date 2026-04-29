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

import '../../services/student_service.dart';
import '../../services/api_service.dart';
import '../../models/result_model.dart';

class StudentResultsScreen extends ConsumerStatefulWidget {
  const StudentResultsScreen({super.key});
  @override
  ConsumerState<StudentResultsScreen> createState() => _StudentResultsScreenState();
}

class _StudentResultsScreenState extends ConsumerState<StudentResultsScreen> {
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
          title: isUrdu ? 'نتائج' : 'Results',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _results.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _results.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _results.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.school_outlined,
                        title: isUrdu ? 'کوئی نتیجہ نہیں' : 'No Results',
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
                              margin: const EdgeInsets.only(bottom: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(r.examType ?? 'Exam', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                                        const Spacer(),
                                        StatusBadge(
                                          label: r.overallGrade ?? 'N/A',
                                          type: (r.overallGrade == 'A' || r.overallGrade == 'A+') ? StatusType.success : r.overallGrade == 'F' ? StatusType.error : StatusType.info,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                                      children: [
                                        _ResultStat(label: isUrdu ? 'کل نمبر' : 'Total', value: '${(r.totalMarksObtained ?? 0).toStringAsFixed(0)}'),
                                        _ResultStat(label: isUrdu ? 'پاسنگ' : 'Passing', value: '${0}'),
                                        _ResultStat(label: isUrdu ? 'فیصد' : 'Percentage', value: '${r.percentage?.toStringAsFixed(1) ?? "0.0"}%'),
                                      ],
                                    ),
                                  ],
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

class _ResultStat extends StatelessWidget {
  final String label; final String value;
  const _ResultStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
