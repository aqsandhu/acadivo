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
import '../../models/result_model.dart';

class SchoolReportsScreen extends ConsumerStatefulWidget {
  const SchoolReportsScreen({super.key});
  @override
  ConsumerState<SchoolReportsScreen> createState() => _SchoolReportsScreenState();
}

class _SchoolReportsScreenState extends ConsumerState<SchoolReportsScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic> _overview = {};

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = PrincipalService(api);
      final data = await service.getResultsOverview();
      setState(() { _overview = data; _isLoading = false; });
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
          title: isUrdu ? 'اسکول کی رپورٹس' : 'School Reports',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _overview.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _overview.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isUrdu ? 'امتحانی نتائج کا جائزہ' : 'Exam Results Overview',
                            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 12),
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
                            childAspectRatio: 1.3,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            children: [
                              StatsCard(icon: Icons.trending_up, value: '${_overview['totalExams'] ?? 0}', label: isUrdu ? 'کل امتحانات' : 'Total Exams', color: const Color(0xFF1E40AF)),
                              StatsCard(icon: Icons.school, value: '${_overview['passRate'] ?? 0}%', label: isUrdu ? 'پاس ریٹ' : 'Pass Rate', color: const Color(0xFF10B981)),
                              StatsCard(icon: Icons.grade, value: '${_overview['averageGrade'] ?? 'N/A'}', label: isUrdu ? 'اوسط گریڈ' : 'Avg Grade', color: const Color(0xFFF59E0B)),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(
                            isUrdu ? 'دستیاب رپورٹس' : 'Available Reports',
                            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 12),
                          Card(
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: Column(
                              children: [
                                ListTile(
                                  leading: const Icon(Icons.bar_chart, color: Color(0xFF1E40AF)),
                                  title: Text(isUrdu ? 'حاضری کی رپورٹ' : 'Attendance Report'),
                                  trailing: const Icon(Icons.chevron_right),
                                  onTap: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(isUrdu ? 'جلد آرہا ہے' : 'Coming soon')),
                                    );
                                  },
                                ),
                                const Divider(height: 1),
                                ListTile(
                                  leading: const Icon(Icons.trending_up, color: Color(0xFF10B981)),
                                  title: Text(isUrdu ? 'نتائج کی رپورٹ' : 'Results Report'),
                                  trailing: const Icon(Icons.chevron_right),
                                  onTap: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(isUrdu ? 'جلد آرہا ہے' : 'Coming soon')),
                                    );
                                  },
                                ),
                                const Divider(height: 1),
                                ListTile(
                                  leading: const Icon(Icons.payment, color: Color(0xFFF59E0B)),
                                  title: Text(isUrdu ? 'فیس کی رپورٹ' : 'Fee Report'),
                                  trailing: const Icon(Icons.chevron_right),
                                  onTap: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(isUrdu ? 'جلد آرہا ہے' : 'Coming soon')),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }
}
