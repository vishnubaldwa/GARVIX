import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:garvix_admin_app/domain/models/auth_user.dart';

void main() {
  test('AuthUser role permission helpers work for ADMIN and DOCUMENT_VIEWER', () {
    const admin = AuthUser(
      id: '1',
      username: 'admin',
      email: 'admin@garvix.in',
      name: 'Vishnu Baldwa',
      role: 'ADMIN',
      permissions: [],
    );
    expect(admin.isFullAdmin, isTrue);
    expect(admin.canManageVault, isTrue);
    expect(admin.canViewBilling, isTrue);
    expect(admin.initials, equals('VB'));

    const banker = AuthUser(
      id: '2',
      username: 'hdfcbank',
      email: 'hdfcbank@garvix.in',
      name: 'HDFC RM',
      role: 'DOCUMENT_VIEWER',
      permissions: ['CAN_VIEW_DOCUMENTS'],
    );
    expect(banker.isFullAdmin, isFalse);
    expect(banker.isDocumentViewerOnly, isTrue);
    expect(banker.canViewVault, isTrue);
    expect(banker.canManageVault, isFalse);
    expect(banker.canViewBilling, isFalse);
  });

  testWidgets('MaterialApp smoke test renders GARVIX title', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: Text('GARVIX ERP'))),
    );
    expect(find.text('GARVIX ERP'), findsOneWidget);
  });
}
