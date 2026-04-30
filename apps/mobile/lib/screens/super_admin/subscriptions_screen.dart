import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/super_admin_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/custom_button.dart';

class SubscriptionsScreen extends ConsumerStatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  ConsumerState<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends ConsumerState<SubscriptionsScreen> {
  bool _isUrdu = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(superAdminProvider.notifier).loadSubscriptions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(superAdminProvider);
    final plans = state.subscriptions;

    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'سبسکرپشن پلانز' : 'Subscription Plans',
        isUrdu: _isUrdu,
      ),
      body: state.isLoading && plans.isEmpty
          ? const Center(child: LoadingWidget())
          : state.error != null && plans.isEmpty
              ? AppErrorWidget(message: state.error!, onRetry: () => ref.read(superAdminProvider.notifier).loadSubscriptions())
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text(
                      _isUrdu ? 'دستیاب پلانز' : 'Available Plans',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 16),
                    ...plans.map((p) {
                      final color = _parseColor(p['color']?.toString());
                      return Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(color: color.withOpacity(0.3), width: 2),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: color.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      p['name']?.toString() ?? 'Plan',
                                      style: TextStyle(
                                        color: color,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  Text(
                                    p['price']?.toString() ?? '',
                                    style: theme.textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: color,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              ...(p['features'] as List<dynamic>? ?? []).map<Widget>((f) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  children: [
                                    Icon(Icons.check_circle, size: 18, color: color),
                                    const SizedBox(width: 8),
                                    Text(f.toString()),
                                  ],
                                ),
                              )).toList(),
                              const SizedBox(height: 16),
                              CustomButton(
                                label: _isUrdu ? 'پلان منتخب کریں' : 'Select Plan',
                                backgroundColor: color,
                                onPressed: () {},
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ),
    );
  }

  Color _parseColor(String? colorStr) {
    if (colorStr == null) return const Color(0xFF3B82F6);
    try {
      return Color(int.parse(colorStr.replaceFirst('#', '0xFF')));
    } catch (_) {
      return const Color(0xFF3B82F6);
    }
  }
}
