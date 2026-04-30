import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/super_admin_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';

class ManageAdsScreen extends ConsumerStatefulWidget {
  const ManageAdsScreen({super.key});

  @override
  ConsumerState<ManageAdsScreen> createState() => _ManageAdsScreenState();
}

class _ManageAdsScreenState extends ConsumerState<ManageAdsScreen> {
  bool _isUrdu = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(superAdminProvider.notifier).loadAdvertisements();
    });
  }

  void _showCreateAdDialog() {
    final titleController = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: 16, right: 16, top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _isUrdu ? 'ایڈ بنائیں' : 'Create Ad',
              style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            CustomTextField(label: _isUrdu ? 'عنوان' : 'Title', controller: titleController),
            const SizedBox(height: 12),
            CustomTextField(label: _isUrdu ? 'پوزیشن' : 'Position', hint: 'e.g. Dashboard, Login Screen'),
            const SizedBox(height: 16),
            CustomButton(
              label: _isUrdu ? 'بنائیں' : 'Create',
              onPressed: () => Navigator.of(ctx).pop(),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(superAdminProvider);
    final ads = state.advertisements;

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'ایڈز کا انتظام' : 'Ad Management',
        actions: [IconButton(icon: const Icon(Icons.add), onPressed: _showCreateAdDialog)],
        isUrdu: _isUrdu,
      ),
      body: state.isLoading && ads.isEmpty
          ? const Center(child: LoadingWidget())
          : state.error != null && ads.isEmpty
              ? AppErrorWidget(message: state.error!, onRetry: () => ref.read(superAdminProvider.notifier).loadAdvertisements())
              : ads.isEmpty
                  ? EmptyStateWidget(
                      icon: Icons.campaign_outlined,
                      title: _isUrdu ? 'کوئی ایڈز نہیں' : 'No Ads',
                      subtitle: '',
                      actionLabel: 'Create Ad',
                      onAction: _showCreateAdDialog,
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: ads.length,
                      itemBuilder: (context, index) {
                        final ad = ads[index];
                        return Card(
                          elevation: 0,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.primaryContainer,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        ad['position']?.toString() ?? 'Dashboard',
                                        style: theme.textTheme.labelSmall?.copyWith(
                                          color: theme.colorScheme.primary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    const Spacer(),
                                    StatusBadge(
                                      label: ad['status']?.toString() ?? 'active',
                                      type: ad['status']?.toString() == 'active' ? StatusType.success : StatusType.warning,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  ad['title']?.toString() ?? '',
                                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    _buildMetric(Icons.visibility, '${ad['impressions'] ?? 0}', 'Impressions'),
                                    _buildMetric(Icons.touch_app, '${ad['clicks'] ?? 0}', 'Clicks'),
                                    _buildMetric(Icons.trending_up, '${_calculateCtr(ad)}%', 'CTR'),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () {},
                                        child: Text(ad['status']?.toString() == 'active' ? 'Pause' : 'Resume'),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () {},
                                        style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                                        child: const Text('Delete'),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateAdDialog,
        child: const Icon(Icons.add),
      ),
    );
  }

  String _calculateCtr(Map<String, dynamic> ad) {
    final clicks = (ad['clicks'] as num?) ?? 0;
    final impressions = (ad['impressions'] as num?) ?? 1;
    if (impressions == 0) return '0.0';
    return (clicks / impressions * 100).toStringAsFixed(1);
  }

  Widget _buildMetric(IconData icon, String value, String label) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          const SizedBox(width: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(width: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }
}
