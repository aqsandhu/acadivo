import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:acadivo/main.dart';

void main() {
  group('Auth Widget Tests', () {
    testWidgets('App initializes without errors', (WidgetTester tester) async {
      await tester.pumpWidget(const AcadivoApp());
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('App has a router configuration', (WidgetTester tester) async {
      await tester.pumpWidget(const AcadivoApp());
      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.routerConfig, isNotNull);
    });
  });
}
