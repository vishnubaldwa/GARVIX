import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/crm_repository.dart';
import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../billing/view_models/billing_view_model.dart';
import '../../billing/views/billing_forms.dart';
import '../../billing/views/outstanding_screen.dart';
import '../../finance/views/finance_screen.dart';
import '../../leads/view_models/leads_view_model.dart';
import '../../leads/views/leads_screen.dart';
import '../../operations/views/amc_screen.dart';
import '../../operations/views/challans_screen.dart';
import '../../operations/views/inventory_screen.dart';
import '../../settings/views/audit_logs_screen.dart';
import '../../settings/views/settings_screen.dart';
import '../../team/view_models/team_view_model.dart';
import '../../team/views/roles_matrix_screen.dart';
import '../../team/views/team_management_screen.dart';

class _ModuleItem {
  const _ModuleItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;
}

class _ModuleSection {
  const _ModuleSection({required this.title, required this.items});

  final String title;
  final List<_ModuleItem> items;
}

class ModulesHubScreen extends StatelessWidget {
  const ModulesHubScreen({
    super.key,
    required this.user,
    required this.crmRepository,
    required this.erpRepository,
    required this.leadsViewModel,
    required this.billingViewModel,
    required this.teamViewModel,
    required this.onNavigateTab,
  });

  final AuthUser user;
  final CrmRepository crmRepository;
  final ErpRepository erpRepository;
  final LeadsViewModel leadsViewModel;
  final BillingViewModel billingViewModel;
  final TeamViewModel teamViewModel;
  final void Function(String tabKey) onNavigateTab;

  void _push(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => screen));
  }

  List<_ModuleSection> _buildSections(BuildContext context) {
    final sections = <_ModuleSection>[];

    // 1. Sales & CRM
    final salesItems = <_ModuleItem>[];
    if (user.canViewLeads) {
      salesItems.add(
        _ModuleItem(
          title: 'Website Leads & CRM',
          subtitle: 'Enquiries, call/email & pipeline status',
          icon: Icons.people_alt_rounded,
          color: AppleColors.blue,
          bgColor: AppleColors.blueSoft,
          onTap: () => _push(context, LeadsScreen(viewModel: leadsViewModel)),
        ),
      );
    }
    if (user.canCreateQuotation) {
      salesItems.add(
        _ModuleItem(
          title: 'New Quotation',
          subtitle: 'Multi-item proposal with Haryana / IGST',
          icon: Icons.description_outlined,
          color: const Color(0xFF4F46E5),
          bgColor: const Color(0xFFEEF2FF),
          onTap: () => _push(
            context,
            CreateBillingDocumentScreen(
              viewModel: billingViewModel,
              isInvoice: false,
            ),
          ),
        ),
      );
    }
    if (user.canCreateClient) {
      salesItems.add(
        _ModuleItem(
          title: 'Add New Client',
          subtitle: 'B2B / corporate party with GSTIN auto-state',
          icon: Icons.person_add_alt_1_outlined,
          color: AppleColors.green,
          bgColor: AppleColors.greenSoft,
          onTap: () => showCreateClientSheet(context, billingViewModel),
        ),
      );
    }
    if (salesItems.isNotEmpty) {
      sections.add(_ModuleSection(title: 'SALES & CRM', items: salesItems));
    }

    // 2. Billing & Dispatch
    final billingItems = <_ModuleItem>[];
    if (user.canManageInvoices) {
      billingItems.add(
        _ModuleItem(
          title: 'New GST Tax Invoice',
          subtitle: 'Issue invoice with Dynamic UPI QR & E-Way',
          icon: Icons.receipt_long_rounded,
          color: AppleColors.blue,
          bgColor: AppleColors.blueSoft,
          onTap: () => _push(
            context,
            CreateBillingDocumentScreen(
              viewModel: billingViewModel,
              isInvoice: true,
            ),
          ),
        ),
      );
    }
    if (user.canManageInvoices || user.canViewFinances) {
      billingItems.add(
        _ModuleItem(
          title: 'Outstanding & Payments',
          subtitle: 'Pending dues, 1-tap payment & reminders',
          icon: Icons.account_balance_wallet_outlined,
          color: AppleColors.amber,
          bgColor: AppleColors.amberSoft,
          onTap: () => _push(
            context,
            OutstandingScreen(viewModel: billingViewModel, user: user),
          ),
        ),
      );
    }
    if (user.canViewChallans) {
      billingItems.add(
        _ModuleItem(
          title: 'Delivery Challans',
          subtitle: 'Demo, deployment & returnable dispatches',
          icon: Icons.local_shipping_outlined,
          color: const Color(0xFF0284C7),
          bgColor: const Color(0xFFE0F2FE),
          onTap: () => _push(
            context,
            ChallansScreen(
              erpRepository: erpRepository,
              crmRepository: crmRepository,
              user: user,
            ),
          ),
        ),
      );
    }
    if (billingItems.isNotEmpty) {
      sections.add(
        _ModuleSection(title: 'BILLING & DISPATCH', items: billingItems),
      );
    }

    // 3. Inventory & Service
    final opsItems = <_ModuleItem>[];
    if (user.canViewInventory) {
      opsItems.add(
        _ModuleItem(
          title: 'Hardware & Products',
          subtitle: 'SKU catalog, stock alerts & add products',
          icon: Icons.inventory_2_outlined,
          color: const Color(0xFF7C3AED),
          bgColor: const Color(0xFFF3E8FF),
          onTap: () => _push(
            context,
            InventoryScreen(
              erpRepository: erpRepository,
              user: user,
              initialTab: 0,
            ),
          ),
        ),
      );
    }
    if (user.canCreateProduct || user.canViewService) {
      opsItems.add(
        _ModuleItem(
          title: 'Serial & IMEI Tracker',
          subtitle: 'Trace RFID hardware barcodes & warranties',
          icon: Icons.qr_code_scanner_rounded,
          color: AppleColors.inkPrimary,
          bgColor: AppleColors.canvas,
          onTap: () => _push(
            context,
            InventoryScreen(
              erpRepository: erpRepository,
              user: user,
              initialTab: 1,
            ),
          ),
        ),
      );
    }
    if (user.canViewService) {
      opsItems.add(
        _ModuleItem(
          title: 'AMC & Service Desk',
          subtitle: 'Annual contracts, expiry alerts & tickets',
          icon: Icons.build_circle_outlined,
          color: AppleColors.green,
          bgColor: AppleColors.greenSoft,
          onTap: () => _push(context, AmcScreen(erpRepository: erpRepository)),
        ),
      );
    }
    if (user.canViewVault) {
      opsItems.add(
        _ModuleItem(
          title: 'Company Document Vault',
          subtitle: 'MCA, Director KYC, Banker access & links',
          icon: Icons.folder_shared_rounded,
          color: AppleColors.blue,
          bgColor: AppleColors.blueSoft,
          onTap: () => onNavigateTab('vault'),
        ),
      );
    }
    if (opsItems.isNotEmpty) {
      sections.add(
        _ModuleSection(title: 'INVENTORY, SERVICE & VAULT', items: opsItems),
      );
    }

    // 4. Finance & CA GST
    if (user.canViewFinances) {
      sections.add(
        _ModuleSection(
          title: 'FINANCE & CA TAX RETURNS',
          items: [
            _ModuleItem(
              title: 'Business Expenses',
              subtitle: 'Log travel, cloud, R&D & office expenses',
              icon: Icons.payments_outlined,
              color: AppleColors.red,
              bgColor: AppleColors.redSoft,
              onTap: () => _push(
                context,
                FinanceScreen(erpRepository: erpRepository, initialTab: 0),
              ),
            ),
            _ModuleItem(
              title: 'Vendor Purchases & ITC',
              subtitle: 'Procurement bills & Input Tax Credit',
              icon: Icons.shopping_bag_outlined,
              color: AppleColors.green,
              bgColor: AppleColors.greenSoft,
              onTap: () => _push(
                context,
                FinanceScreen(erpRepository: erpRepository, initialTab: 1),
              ),
            ),
            _ModuleItem(
              title: '1-Click CA Return (GSTR)',
              subtitle: 'Download & share GSTR-1 / 3B Excel (.xlsx)',
              icon: Icons.table_chart_outlined,
              color: AppleColors.blue,
              bgColor: AppleColors.blueSoft,
              onTap: () => _push(
                context,
                FinanceScreen(erpRepository: erpRepository, initialTab: 2),
              ),
            ),
          ],
        ),
      );
    }

    // 5. Team & Administration
    final adminItems = <_ModuleItem>[];
    if (user.canManageTeam) {
      adminItems.add(
        _ModuleItem(
          title: 'Team & Staff',
          subtitle: 'Add staff, assign roles & reset passwords',
          icon: Icons.groups_rounded,
          color: AppleColors.blue,
          bgColor: AppleColors.blueSoft,
          onTap: () => _push(
            context,
            TeamManagementScreen(viewModel: teamViewModel, currentUser: user),
          ),
        ),
      );
    }
    if (user.canManageRoles) {
      adminItems.add(
        _ModuleItem(
          title: 'Roles & Permissions Matrix',
          subtitle: 'Custom roles & live 12-permission switches',
          icon: Icons.admin_panel_settings_outlined,
          color: const Color(0xFF4F46E5),
          bgColor: const Color(0xFFEEF2FF),
          onTap: () => _push(
            context,
            RolesMatrixScreen(viewModel: teamViewModel),
          ),
        ),
      );
    }
    if (user.canManageSettings) {
      adminItems.add(
        _ModuleItem(
          title: 'Company Settings & UPI',
          subtitle: 'Legal profile, GSTIN, bank details & UPI ID',
          icon: Icons.settings_outlined,
          color: AppleColors.inkPrimary,
          bgColor: AppleColors.canvas,
          onTap: () => _push(
            context,
            CompanySettingsScreen(erpRepository: erpRepository),
          ),
        ),
      );
    }
    if (user.canViewAudit) {
      adminItems.add(
        _ModuleItem(
          title: 'Security Audit Logs',
          subtitle: 'Immutable trail of logins, exports & edits',
          icon: Icons.shield_outlined,
          color: AppleColors.amber,
          bgColor: AppleColors.amberSoft,
          onTap: () => _push(
            context,
            AuditLogsScreen(erpRepository: erpRepository),
          ),
        ),
      );
    }
    if (adminItems.isNotEmpty) {
      sections.add(
        _ModuleSection(title: 'TEAM & ADMINISTRATION', items: adminItems),
      );
    }

    return sections;
  }

  @override
  Widget build(BuildContext context) {
    final sections = _buildSections(context);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ERP Modules'),
            Text(
              'Role: ${user.role}',
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w500,
                color: AppleColors.inkMuted,
              ),
            ),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 36),
        children: [
          for (final section in sections) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 10, 4, 8),
              child: Text(
                section.title,
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.7,
                  color: AppleColors.inkMuted,
                ),
              ),
            ),
            AppleCard(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Column(
                children: [
                  for (int i = 0; i < section.items.length; i++) ...[
                    if (i > 0)
                      const Divider(height: 1, indent: 64, endIndent: 16),
                    ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 4,
                      ),
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: section.items[i].bgColor,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          section.items[i].icon,
                          color: section.items[i].color,
                          size: 21,
                        ),
                      ),
                      title: Text(
                        section.items[i].title,
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        section.items[i].subtitle,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppleColors.inkSecondary,
                        ),
                      ),
                      trailing: const Icon(
                        Icons.chevron_right_rounded,
                        color: AppleColors.inkMuted,
                      ),
                      onTap: section.items[i].onTap,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 6),
          ],
        ],
      ),
    );
  }
}
