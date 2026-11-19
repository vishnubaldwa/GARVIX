import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/billing_view_model.dart';

class BillingScreen extends StatefulWidget {
  const BillingScreen({super.key, required this.viewModel});

  final BillingViewModel viewModel;

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  int _tab = 0; // 0: Invoices, 1: Quotes, 2: Clients

  @override
  void initState() {
    super.initState();
    widget.viewModel.loadAll();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Billing & Clients'),
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
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
                child: SizedBox(
                  width: double.infinity,
                  child: SegmentedButton<int>(
                    showSelectedIcon: false,
                    segments: [
                      ButtonSegment(
                        value: 0,
                        label: Text('Invoices (${widget.viewModel.invoices.length})', style: const TextStyle(fontSize: 12)),
                      ),
                      ButtonSegment(
                        value: 1,
                        label: Text('Quotes (${widget.viewModel.quotations.length})', style: const TextStyle(fontSize: 12)),
                      ),
                      ButtonSegment(
                        value: 2,
                        label: Text('Clients (${widget.viewModel.clients.length})', style: const TextStyle(fontSize: 12)),
                      ),
                    ],
                    selected: {_tab},
                    onSelectionChanged: (s) => setState(() => _tab = s.first),
                  ),
                ),
              ),
              Expanded(
                child: widget.viewModel.isLoading &&
                        widget.viewModel.invoices.isEmpty &&
                        widget.viewModel.clients.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : RefreshIndicator(
                        onRefresh: widget.viewModel.loadAll,
                        child: _tab == 0
                            ? _buildInvoices()
                            : _tab == 1
                                ? _buildQuotes()
                                : _buildClients(),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInvoices() {
    final items = widget.viewModel.invoices;
    if (items.isEmpty) {
      return const AppleEmptyState(
        icon: Icons.receipt_long_outlined,
        title: 'No invoices yet',
        subtitle: 'Issued Tax Invoices and Proforma Invoices appear here.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 28),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final inv = items[index];
        final isPaid = inv.paymentStatus.toUpperCase() == 'PAID';
        return AppleCard(
          padding: const EdgeInsets.all(15),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      inv.customerName,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                  ),
                  AppleBadge(
                    label: inv.paymentStatus,
                    background: isPaid ? AppleColors.greenSoft : AppleColors.amberSoft,
                    foreground: isPaid ? AppleColors.green : AppleColors.amber,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${inv.invoiceNumber} • ${formatShortDate(inv.createdAt)}',
                style: const TextStyle(fontSize: 12, color: AppleColors.inkMuted),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total', style: TextStyle(fontSize: 11, color: AppleColors.inkMuted)),
                      Text(
                        formatInr(inv.totalAmount),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                  const SizedBox(width: 24),
                  if (inv.balanceDue > 0)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Balance Due', style: TextStyle(fontSize: 11, color: AppleColors.inkMuted)),
                        Text(
                          formatInr(inv.balanceDue),
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppleColors.red,
                          ),
                        ),
                      ],
                    ),
                  const Spacer(),
                  FilledButton.tonalIcon(
                    onPressed: () {
                      SharePlus.instance.share(
                        ShareParams(
                          text:
                              'GARVIX Tax Invoice ${inv.invoiceNumber} — ${formatInr(inv.totalAmount)}\nView & Pay via UPI: ${inv.portalUrl}',
                        ),
                      );
                    },
                    icon: const Icon(Icons.ios_share_rounded, size: 16),
                    label: const Text('Share UPI'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildQuotes() {
    final items = widget.viewModel.quotations;
    if (items.isEmpty) {
      return const AppleEmptyState(
        icon: Icons.description_outlined,
        title: 'No quotations yet',
        subtitle: 'Sales proposals and client quotes appear here.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 28),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final q = items[index];
        return AppleCard(
          padding: const EdgeInsets.all(15),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            q.customerName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                          ),
                        ),
                        const SizedBox(width: 8),
                        AppleBadge(label: q.status),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${q.quoteNumber} • ${formatInr(q.totalAmount)} • ${formatShortDate(q.createdAt)}',
                      style: const TextStyle(fontSize: 12, color: AppleColors.inkSecondary),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.ios_share_rounded, color: AppleColors.blue),
                onPressed: () {
                  SharePlus.instance.share(
                    ShareParams(
                      text:
                          'GARVIX Quotation ${q.quoteNumber} (${formatInr(q.totalAmount)}): ${q.portalUrl}',
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildClients() {
    final items = widget.viewModel.clients;
    if (items.isEmpty) {
      return const AppleEmptyState(
        icon: Icons.business_outlined,
        title: 'No clients yet',
        subtitle: 'Parties & B2B clients will appear here.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 28),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final c = items[index];
        return AppleCard(
          padding: const EdgeInsets.all(15),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.companyName,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${c.state}${c.gstin != null && c.gstin!.isNotEmpty ? " • GST: ${c.gstin}" : ""}',
                      style: const TextStyle(fontSize: 12, color: AppleColors.inkSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Billed: ${formatInr(c.totalBilled)} • Due: ${formatInr(c.totalDue)}',
                      style: const TextStyle(fontSize: 12, color: AppleColors.inkMuted),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.call_outlined, color: AppleColors.blue),
                onPressed: () async {
                  final uri = Uri(scheme: 'tel', path: c.phone);
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
