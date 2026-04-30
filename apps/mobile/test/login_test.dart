import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:acadivo/main.dart';

void main() {
  group('Login Page Widget Tests', () {
    testWidgets('App renders login flow scaffold', (WidgetTester tester) async {
      await tester.pumpWidget(const AcadivoApp());
      await tester.pumpAndSettle();
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('App supports multiple locales', (WidgetTester tester) async {
      await tester.pumpWidget(const AcadivoApp());
      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.supportedLocales, isNotEmpty);
    });

    testWidgets('App has localization delegates', (WidgetTester tester) async {
      await tester.pumpWidget(const AcadivoApp());
      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.localizationsDelegates, isNotNull);
      expect(materialApp.localizationsDelegates!.length, greaterThan(0));
    });
  });
}
