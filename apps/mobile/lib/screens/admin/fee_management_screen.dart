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

import '../../services/fee_service.dart';
import '../../services/api_service.dart';
import '../../models/fee_record_model.dart';

class FeeManagementScreen extends ConsumerStatefulWidget {
  const FeeManagementScreen({super.key});
  @override
  ConsumerState<FeeManagementScreen> createState() => _FeeManagementScreenState();
}

class _FeeManagementScreenState extends ConsumerState<FeeManagementScreen> {
  bool _isLoading = true;
  String? _error;
  List<FeeRecordModel> _records = [];
  List<FeeRecordModel> _filtered = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = FeeService(api);
      final data = await service.getFeeRecords();
      setState(() { _records = data; _filtered = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  void _search(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _records.where((r) =>
        (r.studentName?.toLowerCase().contains(q) ?? false) ||
        (r.status.name.toLowerCase().contains(q))
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
          title: isUrdu ? 'فیس کا انتظام' : 'Fee Management',
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
                  hintText: isUrdu ? 'تلاش کریں...' : 'Search fee records...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            Expanded(
              child: _isLoading && _records.isEmpty
                ? const Center(child: LoadingWidget())
                : _error != null && _records.isEmpty
                  ? AppErrorWidget(message: _error!, onRetry: _loadData)
                  : _filtered.isEmpty
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
        ),
      ),
    );
  }
}
