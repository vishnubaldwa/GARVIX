import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../domain/models/auth_user.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/dashboard_view_model.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({
    super.key,
    required this.viewModel,
    required this.user,
    required this.onNavigateTab,
  });

  final DashboardViewModel viewModel;
  final AuthUser user;
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

  @override
  Widget build(BuildContext context) {
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
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
              children: [
                // 2x2 Apple KPI Grid
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
                    ),
                    _KpiTile(
                      label: 'Receivables',
                      value: formatInr(kpis.totalReceivables),
                      caption: 'Pending dues',
                      icon: Icons.account_balance_wallet_outlined,
                      iconColor: AppleColors.amber,
                      iconBg: AppleColors.amberSoft,
                      valueColor: AppleColors.amber,
                    ),
                    _KpiTile(
                      label: 'GST ITC',
                      value: formatInr(kpis.totalItc),
                      caption: 'Input tax credit',
                      icon: Icons.verified_user_outlined,
                      iconColor: AppleColors.green,
                      iconBg: AppleColors.greenSoft,
                      valueColor: AppleColors.green,
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

                // Quick Shortcut Strip
                Row(
                  children: [
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
                    const SizedBox(width: 12),
                    Expanded(
                      child: AppleCard(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 14,
                        ),
                        onTap: () => widget.onNavigateTab('leads'),
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
                if (data.lowStockProducts.isNotEmpty) ...[
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
                      style: TextStyle(fontSize: 13, color: AppleColors.inkMuted),
                    ),
                  )
                else
                  AppleCard(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Column(
                      children: [
                        for (int i = 0; i < data.recentInvoices.length; i++) ...[
                          if (i > 0)
                            const Divider(height: 1, indent: 16, endIndent: 16),
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
                                      formatInr(data.recentInvoices[i].totalAmount),
                                      style: const TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    _StatusPill(
                                      status: data.recentInvoices[i].paymentStatus,
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

                // Recent Leads
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
                      onPressed: () => widget.onNavigateTab('leads'),
                      child: const Text('All leads'),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                if (data.recentLeads.isEmpty)
                  const AppleCard(
                    child: Text(
                      'No website enquiries yet.',
                      style: TextStyle(fontSize: 13, color: AppleColors.inkMuted),
                    ),
                  )
                else
                  AppleCard(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Column(
                      children: [
                        for (int i = 0; i < data.recentLeads.length; i++) ...[
                          if (i > 0)
                            const Divider(height: 1, indent: 16, endIndent: 16),
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
  });

  final String label;
  final String value;
  final String caption;
  final IconData icon;
  final Color iconColor;
  final Color iconBg;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return AppleCard(
      padding: const EdgeInsets.all(14),
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
