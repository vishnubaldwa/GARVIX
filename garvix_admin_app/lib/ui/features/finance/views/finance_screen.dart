import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({
    super.key,
    required this.erpRepository,
    required this.user,
    this.initialTab = 0,
  });

  final ErpRepository erpRepository;
  final AuthUser user;
  final int initialTab; // 0: Expenses, 1: Purchases & ITC, 2: CA GST Returns

  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  late int _tab;
  double _totalExpenses = 0;
  List<ExpenseItem> _expenses = const [];
  double _totalPurchases = 0;
  double _totalItc = 0;
  List<PurchaseItem> _purchases = const [];
  bool _loading = true;
  bool _exporting = false;

  @override
  void initState() {
    super.initState();
    _tab = widget.initialTab;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final expFuture = widget.erpRepository.fetchExpenses().catchError(
            (_) => (totalExpenses: 0.0, expenses: <ExpenseItem>[]),
          );
      final purFuture = widget.erpRepository.fetchPurchases().catchError(
            (_) => (
              totalPurchases: 0.0,
              totalItc: 0.0,
              purchases: <PurchaseItem>[],
            ),
          );
      final exp = await expFuture;
      final pur = await purFuture;
      if (mounted) {
        setState(() {
          _totalExpenses = exp.totalExpenses;
          _expenses = exp.expenses;
          _totalPurchases = pur.totalPurchases;
          _totalItc = pur.totalItc;
          _purchases = pur.purchases;
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _showAddExpenseSheet() async {
    final amountCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String category = 'OFFICE_SUPPLIES';
    String mode = 'UPI';
    bool submitting = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            16,
            20,
            MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppleColors.border,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Log Business Expense',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  initialValue: category,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: const [
                    DropdownMenuItem(value: 'TRAVEL', child: Text('Travel & Field Visits')),
                    DropdownMenuItem(value: 'HARDWARE_RND', child: Text('Hardware R&D')),
                    DropdownMenuItem(value: 'CLOUD_SERVER', child: Text('Cloud / Hosting')),
                    DropdownMenuItem(value: 'OFFICE_SUPPLIES', child: Text('Office & Admin')),
                    DropdownMenuItem(value: 'MARKETING', child: Text('Marketing & Ads')),
                    DropdownMenuItem(value: 'MISC', child: Text('Miscellaneous')),
                  ],
                  onChanged: (v) {
                    if (v != null) setModalState(() => category = v);
                  },
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: amountCtrl,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(labelText: 'Amount (₹) *'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: mode,
                        decoration: const InputDecoration(labelText: 'Paid Via'),
                        items: const [
                          DropdownMenuItem(value: 'UPI', child: Text('UPI')),
                          DropdownMenuItem(value: 'NEFT_RTGS', child: Text('Bank / Card')),
                          DropdownMenuItem(value: 'CASH', child: Text('Cash')),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => mode = v);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: descCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Description / Vendor *',
                    hintText: 'e.g. Client visit fuel Gurugram to Noida',
                  ),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          final amt = double.tryParse(amountCtrl.text.trim()) ?? 0;
                          if (amt <= 0 || descCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Enter amount and description.'),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            await widget.erpRepository.createExpense(
                              category: category,
                              amount: amt,
                              description: descCtrl.text.trim(),
                              paymentMode: mode,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Expense logged successfully.'),
                                ),
                              );
                            }
                          } catch (e) {
                            setModalState(() => submitting = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString())),
                              );
                            }
                          }
                        },
                  child: submitting
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Save Expense'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _exportGst(String type) async {
    setState(() => _exporting = true);
    try {
      final file = await widget.erpRepository.downloadGstReturn(type: type);
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(file.path)],
          text: type == 'gstr3b'
              ? 'GARVIX GSTR-3B Summary Workbook (.xlsx)'
              : 'GARVIX GSTR-1 Sales Return Workbook (.xlsx)',
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Finance & CA GST'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      floatingActionButton: _tab == 0
          ? FloatingActionButton.extended(
              onPressed: _showAddExpenseSheet,
              backgroundColor: AppleColors.blue,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Add Expense'),
            )
          : null,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            child: SizedBox(
              width: double.infinity,
              child: SegmentedButton<int>(
                showSelectedIcon: false,
                segments: const [
                  ButtonSegment(
                    value: 0,
                    label: Text('Expenses', style: TextStyle(fontSize: 12)),
                  ),
                  ButtonSegment(
                    value: 1,
                    label: Text('Purchases', style: TextStyle(fontSize: 12)),
                  ),
                  ButtonSegment(
                    value: 2,
                    label: Text('CA Return', style: TextStyle(fontSize: 12)),
                  ),
                ],
                selected: {_tab},
                onSelectionChanged: (s) => setState(() => _tab = s.first),
              ),
            ),
          ),
          Expanded(
            child: _loading && _expenses.isEmpty && _purchases.isEmpty && _tab != 2
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _load,
                    child: _tab == 0
                        ? _buildExpenses()
                        : _tab == 1
                            ? _buildPurchases()
                            : _buildCaReturn(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpenses() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 92),
      children: [
        AppleCard(
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(11),
                decoration: BoxDecoration(
                  color: AppleColors.redSoft,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.receipt_outlined,
                  color: AppleColors.red,
                ),
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Total Operational Expenses',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppleColors.inkSecondary,
                    ),
                  ),
                  Text(
                    formatInr(_totalExpenses),
                    style: const TextStyle(
                      fontSize: 21,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        if (_expenses.isEmpty)
          const AppleEmptyState(
            icon: Icons.account_balance_wallet_outlined,
            title: 'No expenses logged yet',
            subtitle: 'Tap "+ Add Expense" to record operational costs.',
          )
        else
          for (final e in _expenses) ...[
            AppleCard(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          e.description,
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${e.category.replaceAll('_', ' ')} • ${e.paymentMode} • ${formatShortDate(e.expenseDate)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppleColors.inkMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    formatInr(e.amount),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppleColors.red,
                    ),
                  ),
                  if (widget.user.isFullAdmin)
                    IconButton(
                      visualDensity: VisualDensity.compact,
                      tooltip: 'Delete permanently',
                      icon: const Icon(
                        Icons.delete_outline_rounded,
                        size: 19,
                        color: AppleColors.red,
                      ),
                      onPressed: () => confirmSuperAdminDelete(
                        context,
                        label: 'expense "${e.description}"',
                        onDelete: () async {
                          await widget.erpRepository.deleteRecord(
                            entity: 'expense',
                            id: e.id,
                          );
                          await _load();
                        },
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
      ],
    );
  }

  Widget _buildPurchases() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      children: [
        Row(
          children: [
            Expanded(
              child: AppleCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total Procurement',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AppleColors.inkSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatInr(_totalPurchases),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppleCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Eligible GST ITC',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AppleColors.inkSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatInr(_totalItc),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppleColors.green,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        if (_purchases.isEmpty)
          const AppleEmptyState(
            icon: Icons.shopping_cart_outlined,
            title: 'No vendor purchase bills',
            subtitle: 'Hardware procurement bills & claimable ITC appear here.',
          )
        else
          for (final p in _purchases) ...[
            AppleCard(
              padding: const EdgeInsets.all(15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          p.vendorName,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      AppleBadge(
                        label: p.itcEligible ? 'ITC Eligible' : 'Ineligible',
                        background: p.itcEligible
                            ? AppleColors.greenSoft
                            : AppleColors.canvas,
                        foreground: p.itcEligible
                            ? AppleColors.green
                            : AppleColors.inkMuted,
                      ),
                      if (widget.user.isFullAdmin)
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          tooltip: 'Delete permanently',
                          icon: const Icon(
                            Icons.delete_outline_rounded,
                            size: 19,
                            color: AppleColors.red,
                          ),
                          onPressed: () => confirmSuperAdminDelete(
                            context,
                            label: 'purchase bill "#${p.billNumber}"',
                            onDelete: () async {
                              await widget.erpRepository.deleteRecord(
                                entity: 'purchase',
                                id: p.id,
                              );
                              await _load();
                            },
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Bill #${p.billNumber} • ${p.vendorGstin ?? "Unregistered"} • ${formatShortDate(p.billDate)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppleColors.inkMuted,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        'Total: ${formatInr(p.totalAmount)}',
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        'GST ITC: ${formatInr(p.totalTax)}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppleColors.green,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
      ],
    );
  }

  Widget _buildCaReturn() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
      children: [
        AppleCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppleColors.greenSoft,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.table_chart_outlined,
                      color: AppleColors.green,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'GSTR-1 Sales Return (.xlsx)',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          'B2B, B2CS, HSN summary & CGST/SGST/IGST sheets ready for CA upload.',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppleColors.inkSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _exporting ? null : () => _exportGst('gstr1'),
                  icon: _exporting
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.ios_share_rounded, size: 18),
                  label: const Text('Download & Share GSTR-1 Excel'),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppleCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppleColors.blueSoft,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.assessment_outlined,
                      color: AppleColors.blue,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'GSTR-3B Tax & ITC Summary (.xlsx)',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          'Net GST liability vs eligible Input Tax Credit calculation sheet.',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppleColors.inkSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: FilledButton.tonalIcon(
                  onPressed: _exporting ? null : () => _exportGst('gstr3b'),
                  icon: const Icon(Icons.ios_share_rounded, size: 18),
                  label: const Text('Download & Share GSTR-3B Summary'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
