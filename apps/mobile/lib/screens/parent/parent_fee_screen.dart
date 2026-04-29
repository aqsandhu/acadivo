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

import '../../services/parent_service.dart';
import '../../services/api_service.dart';
import '../../models/fee_record_model.dart';
import '../../models/student_model.dart';

class ParentFeeScreen extends ConsumerStatefulWidget {
  const ParentFeeScreen({super.key});
  @override
  ConsumerState<ParentFeeScreen> createState() => _ParentFeeScreenState();
}

class _ParentFeeScreenState extends ConsumerState<ParentFeeScreen> {
  bool _isLoading = true;
  String? _error;
  List<StudentModel> _children = [];
  List<FeeRecordModel> _records = [];
  Map<String, dynamic> _summary = {};
  String? _selectedChildId;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final children = await service.getMyChildren();
      setState(() { _children = children; _isLoading = false; });
      if (children.isNotEmpty) {
        _selectedChildId = children.first.id;
        _loadChildFee(children.first.id);
      }
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _loadChildFee(String childId) async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final records = await service.getChildFeeRecords(childId);
      final summary = await service.getFeeSummary(childId);
      setState(() { _records = records; _summary = summary; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    final totalPaid = _summary['totalPaid'] ?? 0.0;
    final totalPending = _summary['totalPending'] ?? 0.0;
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'فیس' : 'Fee',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _children.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _children.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : Column(
                    children: [
                      if (_children.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: DropdownButtonFormField<String>(
                            value: _selectedChildId,
                            decoration: InputDecoration(
                              labelText: isUrdu ? 'بچہ منتخب کریں' : 'Select Child',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            items: _children.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
                            onChanged: (val) { if (val != null) { setState(() => _selectedChildId = val); _loadChildFee(val); } },
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 2,
                          childAspectRatio: 1.5,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          children: [
                            StatsCard(icon: Icons.paid, value: 'Rs. ${totalPaid.toStringAsFixed(0)}', label: isUrdu ? 'ادا شدہ' : 'Paid', color: const Color(0xFF10B981)),
                            StatsCard(icon: Icons.pending_actions, value: 'Rs. ${totalPending.toStringAsFixed(0)}', label: isUrdu ? 'باقی' : 'Pending', color: const Color(0xFFF59E0B)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: _records.isEmpty
                          ? EmptyStateWidget(
                              icon: Icons.payment_outlined,
                              title: isUrdu ? 'کوئی فیس ریکارڈ نہیں' : 'No Fee Records',
                              subtitle: isUrdu ? 'اس بچے کی کوئی فیس ریکارڈ نہیں' : 'No fee records for this child.',
                            )
                          : RefreshIndicator(
                              onRefresh: () => _loadChildFee(_selectedChildId!),
                              child: ListView.builder(
                                itemCount: _records.length,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemBuilder: (context, index) {
                                  final r = _records[index];
                                  return Card(
                                    elevation: 0,
                                    margin: const EdgeInsets.only(bottom: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    child: ListTile(
                                      leading: CircleAvatar(
                                        backgroundColor: r.status == FeePaymentStatus.paid ? Colors.green.shade50 : Colors.orange.shade50,
                                        child: Icon(Icons.payment, color: r.status == FeePaymentStatus.paid ? Colors.green : Colors.orange, size: 18),
                                      ),
                                      title: Text(r.feeName ?? 'Fee', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                      subtitle: Text('Rs. ${r.amount.toStringAsFixed(0)}'),
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
