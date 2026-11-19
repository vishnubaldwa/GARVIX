import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../domain/models/auth_user.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/billing_view_model.dart';
import 'billing_forms.dart';

class BillingScreen extends StatefulWidget {
  const BillingScreen({
    super.key,
    required this.viewModel,
    required this.user,
    this.tabNotifier,
  });

  final BillingViewModel viewModel;
  final AuthUser user;
  final ValueNotifier<int>? tabNotifier;

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  int _tab = 0; // 0: Invoices, 1: Quotes, 2: Clients

  @override
  void initState() {
    super.initState();
    if (widget.tabNotifier != null) {
      _tab = widget.tabNotifier!.value;
      widget.tabNotifier!.addListener(_onExternalTabChange);
    } else if (!widget.user.canManageInvoices && !widget.user.canViewFinances) {
      _tab = widget.user.canCreateQuotation ? 1 : 2;
    }
    widget.viewModel.loadAll();
  }

  @override
  void dispose() {
    widget.tabNotifier?.removeListener(_onExternalTabChange);
    super.dispose();
  }

  void _onExternalTabChange() {
    final target = widget.tabNotifier?.value ?? 0;
    if (mounted && _tab != target) {
      setState(() => _tab = target);
    }
    widget.viewModel.loadAll();
  }

  Future<void> _openPortalUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    final launched = await launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
    );
    if (!launched && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open document link.')),
      );
    }
  }

  Future<void> _openCreateDocument({required bool isInvoice}) async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => CreateBillingDocumentScreen(
          viewModel: widget.viewModel,
          isInvoice: isInvoice,
        ),
      ),
    );
    if (created == true) {
      await widget.viewModel.loadAll();
      if (mounted) {
        setState(() => _tab = isInvoice ? 0 : 1);
      }
    }
  }

  Widget? _buildFab() {
    if (_tab == 0 && widget.user.canManageInvoices) {
      return FloatingActionButton.extended(
        onPressed: () => _openCreateDocument(isInvoice: true),
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Invoice'),
      );
    }
    if (_tab == 1 && widget.user.canCreateQuotation) {
      return FloatingActionButton.extended(
        onPressed: () => _openCreateDocument(isInvoice: false),
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Quote'),
      );
    }
    if (_tab == 2 && widget.user.canCreateClient) {
      return FloatingActionButton.extended(
        onPressed: () => showCreateClientSheet(context, widget.viewModel),
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: const Text('Add Client'),
      );
    }
    return null;
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
      floatingActionButton: _buildFab(),
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
                        label: Text(
                          'Invoices (${widget.viewModel.invoices.length})',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                      ButtonSegment(
                        value: 1,
                        label: Text(
                          'Quotes (${widget.viewModel.quotations.length})',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                      ButtonSegment(
                        value: 2,
                        label: Text(
                          'Clients (${widget.viewModel.clients.length})',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                    selected: {_tab},
                    onSelectionChanged: (s) {
                      setState(() => _tab = s.first);
                      widget.tabNotifier?.value = s.first;
                    },
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
    if (!widget.user.canManageInvoices && !widget.user.canViewFinances) {
      return const AppleEmptyState(
        icon: Icons.lock_outline_rounded,
        title: 'Invoice access restricted',
        subtitle: 'Your role does not include invoice permissions.',
      );
    }

    final items = widget.viewModel.invoices;
    if (items.isEmpty && widget.viewModel.invoicesError != null) {
      return AppleEmptyState(
        icon: Icons.error_outline_rounded,
        title: 'Could not load invoices',
        subtitle: widget.viewModel.invoicesError!,
        actionLabel: 'Retry',
        onAction: widget.viewModel.loadAll,
      );
    }
    if (items.isEmpty) {
      return AppleEmptyState(
        icon: Icons.receipt_long_outlined,
        title: 'No invoices yet',
        subtitle: 'Issue GST Tax Invoices or Proforma Invoices right from mobile.',
        actionLabel: widget.user.canManageInvoices ? 'Create Invoice' : null,
        onAction: widget.user.canManageInvoices
            ? () => _openCreateDocument(isInvoice: true)
            : null,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 92),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final inv = items[index];
        final isPaid = inv.paymentStatus.toUpperCase() == 'PAID';
        return AppleCard(
          padding: const EdgeInsets.all(15),
          onTap: () => _openPortalUrl(inv.portalUrl),
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
                    background:
                        isPaid ? AppleColors.greenSoft : AppleColors.amberSoft,
                    foreground: isPaid ? AppleColors.green : AppleColors.amber,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${inv.invoiceNumber} • ${formatShortDate(inv.createdAt)}',
                style:
                    const TextStyle(fontSize: 12, color: AppleColors.inkMuted),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Total',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppleColors.inkMuted,
                        ),
                      ),
                      Text(
                        formatInr(inv.totalAmount),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 22),
                  if (inv.balanceDue > 0)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Due',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppleColors.inkMuted,
                          ),
                        ),
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
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (!isPaid && widget.user.canManageInvoices)
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
                      icon: const Icon(Icons.payments_outlined, size: 16),
                      label: const Text('Record Payment'),
                    ),
                  OutlinedButton.icon(
                    onPressed: () => _openPortalUrl(inv.portalUrl),
                    icon: const Icon(Icons.open_in_new_rounded, size: 15),
                    label: const Text('View'),
                  ),
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
                    label: const Text('Share'),
                  ),
                  if (widget.user.isFullAdmin)
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppleColors.red,
                        side: const BorderSide(color: Color(0x33BE123C)),
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
                      icon: const Icon(Icons.delete_outline_rounded, size: 16),
                      label: const Text('Delete'),
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
    if (!widget.user.canCreateQuotation &&
        !widget.user.canManageInvoices &&
        !widget.user.canViewFinances) {
      return const AppleEmptyState(
        icon: Icons.lock_outline_rounded,
        title: 'Quotation access restricted',
        subtitle: 'Your role does not include quotation permissions.',
      );
    }

    final items = widget.viewModel.quotations;
    if (items.isEmpty && widget.viewModel.quotationsError != null) {
      return AppleEmptyState(
        icon: Icons.error_outline_rounded,
        title: 'Could not load quotations',
        subtitle: widget.viewModel.quotationsError!,
        actionLabel: 'Retry',
        onAction: widget.viewModel.loadAll,
      );
    }
    if (items.isEmpty) {
      return AppleEmptyState(
        icon: Icons.description_outlined,
        title: 'No quotations yet',
        subtitle: 'Create professional proposals with automatic Haryana/IGST calculation.',
        actionLabel:
            widget.user.canCreateQuotation ? 'Create Quotation' : null,
        onAction: widget.user.canCreateQuotation
            ? () => _openCreateDocument(isInvoice: false)
            : null,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 92),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final q = items[index];
        final isConverted = q.status.toUpperCase() == 'CONVERTED';
        return AppleCard(
          padding: const EdgeInsets.all(15),
          onTap: () => _openPortalUrl(q.portalUrl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      q.customerName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  AppleBadge(
                    label: q.status,
                    background: isConverted
                        ? AppleColors.greenSoft
                        : AppleColors.blueSoft,
                    foreground:
                        isConverted ? AppleColors.green : AppleColors.blue,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${q.quoteNumber} • ${formatInr(q.totalAmount)} • ${formatShortDate(q.createdAt)}',
                style: const TextStyle(
                  fontSize: 12.5,
                  color: AppleColors.inkSecondary,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (!isConverted && widget.user.canManageInvoices)
                    FilledButton.icon(
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 9,
                        ),
                      ),
                      onPressed: widget.viewModel.isMutating
                          ? null
                          : () async {
                              try {
                                await widget.viewModel.convertQuotation(q.id);
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Converted to Tax Invoice with UPI QR!',
                                      ),
                                    ),
                                  );
                                  setState(() => _tab = 0);
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(e.toString())),
                                  );
                                }
                              }
                            },
                      icon: const Icon(Icons.swap_horiz_rounded, size: 17),
                      label: const Text('Convert to Invoice'),
                    ),
                  OutlinedButton.icon(
                    onPressed: () => _openPortalUrl(q.portalUrl),
                    icon: const Icon(Icons.open_in_new_rounded, size: 15),
                    label: const Text('View'),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: () {
                      SharePlus.instance.share(
                        ShareParams(
                          text:
                              'GARVIX Quotation ${q.quoteNumber} (${formatInr(q.totalAmount)}): ${q.portalUrl}',
                        ),
                      );
                    },
                    icon: const Icon(Icons.ios_share_rounded, size: 16),
                    label: const Text('Share'),
                  ),
                  if (widget.user.isFullAdmin)
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppleColors.red,
                        side: const BorderSide(color: Color(0x33BE123C)),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 9,
                        ),
                      ),
                      onPressed: () => confirmSuperAdminDelete(
                        context,
                        label: 'quotation ${q.quoteNumber}',
                        onDelete: () => widget.viewModel.deleteRecord(
                          entity: 'quotation',
                          id: q.id,
                        ),
                      ),
                      icon: const Icon(Icons.delete_outline_rounded, size: 16),
                      label: const Text('Delete'),
                    ),
                ],
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
      return AppleEmptyState(
        icon: Icons.business_outlined,
        title: 'No clients yet',
        subtitle: 'Add B2B & corporate parties with GSTIN details.',
        actionLabel: widget.user.canCreateClient ? 'Add Client' : null,
        onAction: widget.user.canCreateClient
            ? () => showCreateClientSheet(context, widget.viewModel)
            : null,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 92),
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
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${c.state} (${c.stateCode})${c.gstin != null && c.gstin!.isNotEmpty ? " • ${c.gstin}" : ""}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppleColors.inkSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Billed: ${formatInr(c.totalBilled)} • Due: ${formatInr(c.totalDue)}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppleColors.inkMuted,
                      ),
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
              if (widget.user.isFullAdmin)
                IconButton(
                  icon: const Icon(
                    Icons.delete_outline_rounded,
                    color: AppleColors.red,
                  ),
                  tooltip: 'Delete Client (Super Admin)',
                  onPressed: () => confirmSuperAdminDelete(
                    context,
                    label: 'client "${c.companyName}"',
                    onDelete: () => widget.viewModel.deleteRecord(
                      entity: 'client',
                      id: c.id,
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
