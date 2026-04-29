import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_button.dart';

class SubscriptionsScreen extends ConsumerStatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  ConsumerState<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends ConsumerState<SubscriptionsScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _plans = [
    {
      'name': 'Basic',
      'price': 'Rs. 5,000/month',
      'features': ['Up to 200 students', '5 teachers', 'Basic reports', 'Email support'],
      'color': const Color(0xFF3B82F6),
    },
    {
      'name': 'Premium',
      'price': 'Rs. 15,000/month',
      'features': ['Up to 1000 students', '50 teachers', 'Advanced reports', 'Priority support', 'Custom branding'],
      'color': const Color(0xFF1E40AF),
    },
    {
      'name': 'Enterprise',
      'price': 'Rs. 35,000/month',
      'features': ['Unlimited students', 'Unlimited teachers', 'All features', '24/7 support', 'API access', 'Dedicated manager'],
      'color': const Color(0xFF10B981),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'سبسکرپشن پلانز' : 'Subscription Plans',
        isUrdu: _isUrdu,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            _isUrdu ? 'دستیاب پلانز' : 'Available Plans',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          ..._plans.map((p) => Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: p['color'].withOpacity(0.3), width: 2),
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
                          color: p['color'].withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          p['name'],
                          style: TextStyle(
                            color: p['color'],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        p['price'],
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: p['color'],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...p['features'].map<Widget>((f) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Icon(Icons.check_circle, size: 18, color: p['color']),
                        const SizedBox(width: 8),
                        Text(f),
                      ],
                    ),
                  )).toList(),
                  const SizedBox(height: 16),
                  CustomButton(
                    label: _isUrdu ? 'پلان منتخب کریں' : 'Select Plan',
                    backgroundColor: p['color'],
                    onPressed: () {},
                  ),
                ],
              ),
            ),
          )).toList(),
        ],
      ),
    );
  }
}
