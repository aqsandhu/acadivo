import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:acadivo/main.dart';

void main() {
  testWidgets('App launches successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const AcadivoApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });

  testWidgets('App shows MaterialApp with correct title', (WidgetTester tester) async {
    await tester.pumpWidget(const AcadivoApp());
    final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
    expect(materialApp.title, 'Acadivo');
  });
}
