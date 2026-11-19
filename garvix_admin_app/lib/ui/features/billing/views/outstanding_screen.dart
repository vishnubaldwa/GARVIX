import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../domain/models/auth_user.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/billing_view_model.dart';
import 'billing_forms.dart';

class OutstandingScreen extends StatefulWidget {
  const OutstandingScreen({
    super.key,
    required this.viewModel,
    required this.user,
  });

  final BillingViewModel viewModel;
  final AuthUser user;

  @override
  State<OutstandingScreen> createState() => _OutstandingScreenState();
}

class _OutstandingScreenState extends State<OutstandingScreen> {
  @override
  void initState() {
    super.initState();
    widget.viewModel.loadAll();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Outstanding & Payments'),
        actions: [
          IconButton(
            onPressed: widget.viewModel.loadAll,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: ListenableBuilder(
        listenable: widget.viewModel,
        builder: (context, _) {
          final pending = widget.viewModel.outstandingInvoices;
          return RefreshIndicator(
            onRefresh: widget.viewModel.loadAll,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
              children: [
                AppleCard(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppleColors.amberSoft,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(
                          Icons.account_balance_wallet_rounded,
                          color: AppleColors.amber,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Total Pending Receivables',
                              style: TextStyle(
                                fontSize: 12.5,
                                color: AppleColors.inkSecondary,
                              ),
                            ),
                            Text(
                              formatInr(widget.viewModel.totalOutstanding),
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: AppleColors.amber,
                              ),
                            ),
                            Text(
                              '${pending.length} unpaid / partial invoice(s)',
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: AppleColors.inkMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                if (pending.isEmpty)
                  const AppleEmptyState(
                    icon: Icons.verified_rounded,
                    title: 'All payments settled!',
                    subtitle: 'Zero pending dues across all issued invoices.',
                  )
                else
                  for (final inv in pending) ...[
                    AppleCard(
                      padding: const EdgeInsets.all(15),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  inv.customerName,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              AppleBadge(
                                label: inv.paymentStatus,
                                background: AppleColors.redSoft,
                                foreground: AppleColors.red,
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${inv.invoiceNumber} • ${formatShortDate(inv.createdAt)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppleColors.inkMuted,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Text(
                                'Due: ${formatInr(inv.balanceDue)}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppleColors.red,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                '(Paid ${formatInr(inv.amountPaid)} of ${formatInr(inv.totalAmount)})',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppleColors.inkSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if (widget.user.canManageInvoices)
                                FilledButton.icon(
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppleColors.green,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                      vertical: 9,
                                    ),
                                  ),
                                  onPressed: () => showRecordPaymentSheet(
                                    context,
                                    widget.viewModel,
                                    inv,
                                  ),
                                  icon: const Icon(
                                    Icons.check_circle_outline_rounded,
                                    size: 16,
                                  ),
                                  label: const Text('Record Payment'),
                                ),
                              FilledButton.tonalIcon(
                                onPressed: () {
                                  SharePlus.instance.share(
                                    ShareParams(
                                      text:
                                          'Payment Reminder — GARVIX Invoice ${inv.invoiceNumber}\nPending Balance: ${formatInr(inv.balanceDue)}\nPay instantly via UPI: ${inv.portalUrl}',
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.ios_share_rounded, size: 16),
                                label: const Text('Send Reminder'),
                              ),
                              if (widget.user.isFullAdmin)
                                OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppleColors.red,
                                    side: const BorderSide(
                                      color: Color(0x33BE123C),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 9,
                                    ),
                                  ),
                                  onPressed: () => confirmSuperAdminDelete(
                                    context,
                                    label: 'invoice ${inv.invoiceNumber}',
                                    onDelete: () => widget.viewModel.deleteRecord(
                                      entity: 'invoice',
                                      id: inv.id,
                                    ),
                                  ),
                                  icon: const Icon(
                                    Icons.delete_outline_rounded,
                                    size: 16,
                                  ),
                                  label: const Text('Delete'),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
              ],
            ),
          );
        },
      ),
    );
  }
}
