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
import '../../models/fee_record_model.dart';

class SchoolFeeScreen extends ConsumerStatefulWidget {
  const SchoolFeeScreen({super.key});
  @override
  ConsumerState<SchoolFeeScreen> createState() => _SchoolFeeScreenState();
}

class _SchoolFeeScreenState extends ConsumerState<SchoolFeeScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic> _overview = {};
  List<FeeRecordModel> _records = [];
  List<FeeRecordModel> _filtered = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = PrincipalService(api);
      final overview = await service.getFeeOverview();
      final records = await service.getFeeRecords();
      setState(() { _overview = overview; _records = records; _filtered = records; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _search(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _records.where((r) =>
        (r.studentName?.toLowerCase().contains(q) ?? false) ||
        r.status.name.toLowerCase().contains(q)
      ).toList();
    });
  }

  @override
  void dispose() { _searchController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    final collected = _overview['collected'] ?? 0.0;
    final pending = _overview['pending'] ?? 0.0;
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'اسکول کی فیس' : 'School Fee',
          isUrdu: isUrdu,
        ),
        body: Column(
          children: [
            if (_isLoading && _records.isEmpty)
              const Expanded(child: Center(child: LoadingWidget()))
            else if (_error != null && _records.isEmpty)
              Expanded(child: AppErrorWidget(message: _error!, onRetry: _loadData))
            else ...[
              Padding(
                padding: const EdgeInsets.all(16),
                child: GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  childAspectRatio: 1.5,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  children: [
                    StatsCard(icon: Icons.paid, value: 'Rs. ${collected.toStringAsFixed(0)}', label: isUrdu ? 'وصول شدہ' : 'Collected', color: const Color(0xFF10B981)),
                    StatsCard(icon: Icons.pending_actions, value: 'Rs. ${pending.toStringAsFixed(0)}', label: isUrdu ? 'باقی' : 'Pending', color: const Color(0xFFF59E0B)),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  controller: _searchController,
                  onChanged: _search,
                  decoration: InputDecoration(
                    hintText: isUrdu ? 'تلاش کریں...' : 'Search fee records...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: _filtered.isEmpty
                  ? EmptyStateWidget(
                      icon: Icons.payment_outlined,
                      title: isUrdu ? 'کوئی فیس ریکارڈ نہیں' : 'No Fee Records',
                      subtitle: isUrdu ? 'کوئی فیس ریکارڈ دستیاب نہیں' : 'No fee records available.',
                    )
                  : RefreshIndicator(
                      onRefresh: _loadData,
                      child: ListView.builder(
                        itemCount: _filtered.length,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemBuilder: (context, index) {
                          final r = _filtered[index];
                          return Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: r.status == FeePaymentStatus.paid ? Colors.green.shade50 : Colors.orange.shade50,
                                child: Icon(Icons.payment, color: r.status == FeePaymentStatus.paid ? Colors.green : Colors.orange, size: 18),
                              ),
                              title: Text(r.studentName ?? 'Unknown', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              subtitle: Text('${r.feeName ?? ""} • Rs. ${r.amount ?? 0}'),
                              trailing: StatusBadge(
                                label: r.status,
                                type: r.status == FeePaymentStatus.paid ? StatusType.success : StatusType.warning,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
