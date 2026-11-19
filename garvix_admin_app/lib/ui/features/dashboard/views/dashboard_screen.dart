import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../data/repositories/crm_repository.dart';
import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../billing/view_models/billing_view_model.dart';
import '../../billing/views/billing_forms.dart';
import '../../billing/views/outstanding_screen.dart';
import '../../finance/views/finance_screen.dart';
import '../../leads/view_models/leads_view_model.dart';
import '../../leads/views/leads_screen.dart';
import '../../operations/views/challans_screen.dart';
import '../../team/view_models/team_view_model.dart';
import '../../team/views/roles_matrix_screen.dart';
import '../view_models/dashboard_view_model.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({
    super.key,
    required this.viewModel,
    required this.user,
    required this.crmRepository,
    required this.erpRepository,
    required this.leadsViewModel,
    required this.billingViewModel,
    required this.teamViewModel,
    required this.onNavigateTab,
  });

  final DashboardViewModel viewModel;
  final AuthUser user;
  final CrmRepository crmRepository;
  final ErpRepository erpRepository;
  final LeadsViewModel leadsViewModel;
  final BillingViewModel billingViewModel;
  final TeamViewModel teamViewModel;
  final void Function(String tabKey) onNavigateTab;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    widget.viewModel.load();
  }

  void _push(Widget screen) {
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => screen));
  }

  List<Widget> _buildQuickActions() {
    final u = widget.user;
    final pills = <Widget>[];

    void addPill({
      required String label,
      required IconData icon,
      required Color color,
      required VoidCallback onTap,
    }) {
      pills.add(
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: ActionChip(
            backgroundColor: Colors.white,
            side: const BorderSide(color: AppleColors.border),
            shape: const StadiumBorder(),
            avatar: Icon(icon, size: 17, color: color),
            label: Text(
              label,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: AppleColors.inkPrimary,
              ),
            ),
            onPressed: onTap,
          ),
        ),
      );
    }

    if (u.canCreateQuotation) {
      addPill(
        label: '+ Quote',
        icon: Icons.description_outlined,
        color: AppleColors.blue,
        onTap: () => _push(
          CreateBillingDocumentScreen(
            viewModel: widget.billingViewModel,
            isInvoice: false,
          ),
        ),
      );
    }
    if (u.canManageInvoices) {
      addPill(
        label: '+ Invoice',
        icon: Icons.receipt_long_rounded,
        color: AppleColors.green,
        onTap: () => _push(
          CreateBillingDocumentScreen(
            viewModel: widget.billingViewModel,
            isInvoice: true,
          ),
        ),
      );
    }
    if (u.canCreateClient) {
      addPill(
        label: '+ Client',
        icon: Icons.person_add_alt_1_outlined,
        color: const Color(0xFF4F46E5),
        onTap: () => showCreateClientSheet(context, widget.billingViewModel),
      );
    }
    if (u.canViewChallans) {
      addPill(
        label: 'Challans',
        icon: Icons.local_shipping_outlined,
        color: const Color(0xFF0284C7),
        onTap: () => _push(
          ChallansScreen(
            erpRepository: widget.erpRepository,
            crmRepository: widget.crmRepository,
            user: u,
          ),
        ),
      );
    }
    if (u.canViewFinances) {
      addPill(
        label: 'CA Return',
        icon: Icons.table_chart_outlined,
        color: AppleColors.green,
        onTap: () => _push(
          FinanceScreen(
            erpRepository: widget.erpRepository,
            user: u,
            initialTab: 2,
          ),
        ),
      );
      addPill(
        label: '+ Expense',
        icon: Icons.payments_outlined,
        color: AppleColors.red,
        onTap: () => _push(
          FinanceScreen(
            erpRepository: widget.erpRepository,
            user: u,
            initialTab: 0,
          ),
        ),
      );
    }
    if (u.canManageRoles) {
      addPill(
        label: 'Roles',
        icon: Icons.admin_panel_settings_outlined,
        color: AppleColors.amber,
        onTap: () => _push(
          RolesMatrixScreen(viewModel: widget.teamViewModel, currentUser: u),
        ),
      );
    }

    return pills;
  }

  @override
  Widget build(BuildContext context) {
    final quickActions = _buildQuickActions();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, ${widget.user.name.split(' ').first}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppleColors.inkMuted,
              ),
            ),
            const Text('Overview'),
          ],
        ),
        actions: [
          IconButton(
            onPressed: widget.viewModel.load,
            icon: const Icon(Icons.refresh_rounded, size: 22),
            tooltip: 'Refresh',
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: ListenableBuilder(
        listenable: widget.viewModel,
        builder: (context, _) {
          if (widget.viewModel.isLoading && widget.viewModel.data == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (widget.viewModel.error != null && widget.viewModel.data == null) {
            return AppleEmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Unable to load dashboard',
              subtitle: widget.viewModel.error!,
              actionLabel: 'Retry',
              onAction: widget.viewModel.load,
            );
          }

          final data = widget.viewModel.data;
          if (data == null) {
            return const SizedBox.shrink();
          }

          final kpis = data.kpis;

          return RefreshIndicator(
            onRefresh: widget.viewModel.load,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 32),
              children: [
                if (quickActions.isNotEmpty) ...[
                  SizedBox(
                    height: 40,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: quickActions,
                    ),
                  ),
                  const SizedBox(height: 14),
                ],

                // 2x2 Apple KPI Grid (financial metrics shown when permitted)
                if (widget.user.canViewFinances ||
                    widget.user.canManageInvoices) ...[
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.38,
                    children: [
                      _KpiTile(
                        label: 'Total Sales',
                        value: formatInr(kpis.totalInvoiced),
                        caption: '${kpis.invoiceCount} Tax Invoices',
                        icon: Icons.receipt_long_rounded,
                        iconColor: AppleColors.blue,
                        iconBg: AppleColors.blueSoft,
                        onTap: () => widget.onNavigateTab('billing'),
                      ),
                      _KpiTile(
                        label: 'Receivables',
                        value: formatInr(kpis.totalReceivables),
                        caption: 'Tap to collect dues',
                        icon: Icons.account_balance_wallet_outlined,
                        iconColor: AppleColors.amber,
                        iconBg: AppleColors.amberSoft,
                        valueColor: AppleColors.amber,
                        onTap: () => _push(
                          OutstandingScreen(
                            viewModel: widget.billingViewModel,
                            user: widget.user,
                          ),
                        ),
                      ),
                      _KpiTile(
                        label: 'GST ITC',
                        value: formatInr(kpis.totalItc),
                        caption: 'Input tax credit',
                        icon: Icons.verified_user_outlined,
                        iconColor: AppleColors.green,
                        iconBg: AppleColors.greenSoft,
                        valueColor: AppleColors.green,
                        onTap: widget.user.canViewFinances
                            ? () => _push(
                                  FinanceScreen(
                                    erpRepository: widget.erpRepository,
                                    user: widget.user,
                                    initialTab: 1,
                                  ),
                                )
                            : null,
                      ),
                      _KpiTile(
                        label: 'Net Margin',
                        value: formatInr(kpis.netProfit),
                        caption: 'Sales - Cost',
                        icon: Icons.trending_up_rounded,
                        iconColor: const Color(0xFF4F46E5),
                        iconBg: const Color(0xFFEEF2FF),
                        valueColor: kpis.netProfit >= 0
                            ? AppleColors.inkPrimary
                            : AppleColors.red,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],

                // Quick Shortcut Strip
                Row(
                  children: [
                    if (widget.user.canViewVault)
                      Expanded(
                        child: AppleCard(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
                          ),
                          onTap: () => widget.onNavigateTab('vault'),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(9),
                                decoration: BoxDecoration(
                                  color: AppleColors.blueSoft,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.folder_shared_rounded,
                                  color: AppleColors.blue,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${kpis.vaultDocCount} Docs',
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: AppleColors.inkPrimary,
                                      ),
                                    ),
                                    const Text(
                                      'Company Vault',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: AppleColors.inkSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    if (widget.user.canViewVault && widget.user.canViewLeads)
                      const SizedBox(width: 12),
                    if (widget.user.canViewLeads)
                      Expanded(
                        child: AppleCard(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
                          ),
                          onTap: () => _push(
                            LeadsScreen(
                              viewModel: widget.leadsViewModel,
                              user: widget.user,
                              erpRepository: widget.erpRepository,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(9),
                                decoration: BoxDecoration(
                                  color: AppleColors.greenSoft,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.mail_outline_rounded,
                                  color: AppleColors.green,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${kpis.leadCount} Leads',
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: AppleColors.inkPrimary,
                                      ),
                                    ),
                                    const Text(
                                      'Website CRM',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: AppleColors.inkSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),

                // Low Stock Banner
                if (data.lowStockProducts.isNotEmpty &&
                    widget.user.canViewInventory) ...[
                  const SizedBox(height: 16),
                  AppleCard(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(9),
                          decoration: BoxDecoration(
                            color: AppleColors.amberSoft,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.warning_amber_rounded,
                            color: AppleColors.amber,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Low Stock Alert (${data.lowStockProducts.length} items)',
                                style: const TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppleColors.inkPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                data.lowStockProducts
                                    .map((p) => '${p.name} (${p.currentStock})')
                                    .join(', '),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppleColors.inkSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Recent Invoices
                if (widget.user.canManageInvoices ||
                    widget.user.canViewFinances) ...[
                  const SizedBox(height: 22),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Recent Invoices',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                          color: AppleColors.inkPrimary,
                        ),
                      ),
                      TextButton(
                        onPressed: () => widget.onNavigateTab('billing'),
                        child: const Text('See all'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  if (data.recentInvoices.isEmpty)
                    const AppleCard(
                      child: Text(
                        'No tax invoices issued yet.',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppleColors.inkMuted,
                        ),
                      ),
                    )
                  else
                    AppleCard(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Column(
                        children: [
                          for (int i = 0; i < data.recentInvoices.length; i++) ...[
                            if (i > 0)
                              const Divider(
                                height: 1,
                                indent: 16,
                                endIndent: 16,
                              ),
                            ListTile(
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 4,
                              ),
                              title: Text(
                                data.recentInvoices[i].customerName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              subtitle: Text(
                                '${data.recentInvoices[i].invoiceNumber} • ${formatShortDate(data.recentInvoices[i].createdAt)}',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: AppleColors.inkMuted,
                                ),
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        formatInr(
                                          data.recentInvoices[i].totalAmount,
                                        ),
                                        style: const TextStyle(
                                          fontSize: 13.5,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      _StatusPill(
                                        status: data
                                            .recentInvoices[i].paymentStatus,
                                      ),
                                    ],
                                  ),
                                  IconButton(
                                    icon: const Icon(
                                      Icons.ios_share_rounded,
                                      size: 18,
                                      color: AppleColors.blue,
                                    ),
                                    onPressed: () {
                                      final inv = data.recentInvoices[i];
                                      SharePlus.instance.share(
                                        ShareParams(
                                          text:
                                              'GARVIX Invoice ${inv.invoiceNumber} (${formatInr(inv.totalAmount)}): ${inv.portalUrl}',
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                ],

                // Recent Leads
                if (widget.user.canViewLeads) ...[
                  const SizedBox(height: 22),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Latest Enquiries',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                          color: AppleColors.inkPrimary,
                        ),
                      ),
                      TextButton(
                        onPressed: () => _push(
                          LeadsScreen(
                            viewModel: widget.leadsViewModel,
                            user: widget.user,
                            erpRepository: widget.erpRepository,
                          ),
                        ),
                        child: const Text('All leads'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  if (data.recentLeads.isEmpty)
                    const AppleCard(
                      child: Text(
                        'No website enquiries yet.',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppleColors.inkMuted,
                        ),
                      ),
                    )
                  else
                    AppleCard(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Column(
                        children: [
                          for (int i = 0; i < data.recentLeads.length; i++) ...[
                            if (i > 0)
                              const Divider(
                                height: 1,
                                indent: 16,
                                endIndent: 16,
                              ),
                            ListTile(
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 4,
                              ),
                              title: Text(
                                data.recentLeads[i].name,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              subtitle: Text(
                                '${data.recentLeads[i].company ?? data.recentLeads[i].phone} • ${data.recentLeads[i].solution}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppleColors.inkSecondary,
                                ),
                              ),
                              trailing: AppleBadge(
                                label: data.recentLeads[i].status,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _KpiTile extends StatelessWidget {
  const _KpiTile({
    required this.label,
    required this.value,
    required this.caption,
    required this.icon,
    required this.iconColor,
    required this.iconBg,
    this.valueColor = AppleColors.inkPrimary,
    this.onTap,
  });

  final String label;
  final String value;
  final String caption;
  final IconData icon;
  final Color iconColor;
  final Color iconBg;
  final Color valueColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return AppleCard(
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppleColors.inkSecondary,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconBg,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 15, color: iconColor),
              ),
            ],
          ),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 21,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.5,
                color: valueColor,
              ),
            ),
          ),
          Text(
            caption,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11, color: AppleColors.inkMuted),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final upper = status.toUpperCase();
    if (upper == 'PAID') {
      return const AppleBadge(
        label: 'PAID',
        background: AppleColors.greenSoft,
        foreground: AppleColors.green,
      );
    }
    if (upper == 'PARTIAL') {
      return const AppleBadge(
        label: 'PARTIAL',
        background: AppleColors.amberSoft,
        foreground: AppleColors.amber,
      );
    }
    return AppleBadge(
      label: upper,
      background: AppleColors.redSoft,
      foreground: AppleColors.red,
    );
  }
}
