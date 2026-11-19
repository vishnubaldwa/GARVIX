import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

const _defaultExpenseCategories = <({String value, String label})>[
  (value: 'TRAVEL', label: 'Travel & Site Survey'),
  (value: 'HARDWARE_RND', label: 'Hardware R&D'),
  (value: 'CLOUD_SERVER', label: 'Cloud / Hosting'),
  (value: 'OFFICE_SUPPLIES', label: 'Office & Facility'),
  (value: 'MARKETING', label: 'Marketing & Ads'),
  (value: 'MISC', label: 'Miscellaneous'),
];

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
  double _pendingReimbursements = 0;
  List<String> _staffNames = const [];
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
            (_) => (
              totalExpenses: 0.0,
              pendingReimbursements: 0.0,
              staffNames: <String>[],
              expenses: <ExpenseItem>[],
            ),
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
          _pendingReimbursements = exp.pendingReimbursements;
          _staffNames = exp.staffNames;
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

  String _formatIsoDate(DateTime d) {
    final y = d.year.toString().padLeft(4, '0');
    final m = d.month.toString().padLeft(2, '0');
    final day = d.day.toString().padLeft(2, '0');
    return '$y-$m-$day';
  }

  Future<void> _openReceipt(ExpenseItem expense) async {
    try {
      final file = await widget.erpRepository.downloadExpenseReceipt(expense);
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(file.path)],
          text:
              'Expense Receipt — ${expense.description} (${formatInr(expense.amount)})',
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _showExpenseFormSheet({ExpenseItem? existing}) async {
    final isEdit = existing != null;

    // Build combined categories (defaults + custom categories from existing rows)
    final catMap = <String, String>{
      for (final c in _defaultExpenseCategories) c.value: c.label,
    };
    for (final e in _expenses) {
      if (e.category.isNotEmpty && !catMap.containsKey(e.category)) {
        catMap[e.category] = e.category.replaceAll('_', ' ');
      }
    }
    if (existing != null && !catMap.containsKey(existing.category)) {
      catMap[existing.category] = existing.category.replaceAll('_', ' ');
    }

    String category = existing?.category ?? 'OFFICE_SUPPLIES';
    bool useCustomCategory = false;
    final customCatCtrl = TextEditingController();

    DateTime selectedDate = existing?.expenseDate ?? DateTime.now();
    final amountCtrl = TextEditingController(
      text: existing != null ? existing.amount.toString() : '',
    );
    final descCtrl = TextEditingController(text: existing?.description ?? '');
    String mode = existing?.paymentMode ?? 'UPI';
    if (!{'UPI', 'NEFT_RTGS', 'COMPANY_CARD', 'CASH'}.contains(mode)) {
      mode = 'UPI';
    }

    final vendorCtrl = TextEditingController(text: existing?.vendorName ?? '');

    final uniqueStaff = _staffNames.toSet().toList();
    final initialPaidBy = existing?.paidBy?.trim().isNotEmpty == true
        ? existing!.paidBy!.trim()
        : 'Company Account';
    String paidBySelection;
    final customPaidByCtrl = TextEditingController();
    if (initialPaidBy == 'Company Account' ||
        uniqueStaff.contains(initialPaidBy)) {
      paidBySelection = initialPaidBy;
    } else {
      paidBySelection = '__OTHER__';
      customPaidByCtrl.text = initialPaidBy;
    }

    String reimbursementStatus =
        existing?.reimbursementStatus ?? 'COMPANY_PAID';
    if (!{'COMPANY_PAID', 'PENDING', 'REIMBURSED'}
        .contains(reimbursementStatus)) {
      reimbursementStatus = 'COMPANY_PAID';
    }

    final billNoCtrl = TextEditingController(text: existing?.billNumber ?? '');
    final refNoCtrl = TextEditingController(text: existing?.referenceNo ?? '');
    final notesCtrl = TextEditingController(text: existing?.notes ?? '');

    File? pickedReceipt;
    bool removeReceipt = false;
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
                Text(
                  isEdit ? 'Edit Expense (Super Admin)' : 'Log Business Expense',
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 14),
                if (useCustomCategory)
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: customCatCtrl,
                          decoration: const InputDecoration(
                            labelText: 'New Category Name *',
                            hintText: 'e.g. Company formation',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () =>
                            setModalState(() => useCustomCategory = false),
                        child: const Text('Cancel'),
                      ),
                    ],
                  )
                else
                  DropdownButtonFormField<String>(
                    initialValue: category,
                    isExpanded: true,
                    decoration: const InputDecoration(labelText: 'Category *'),
                    items: [
                      for (final entry in catMap.entries)
                        DropdownMenuItem(
                          value: entry.key,
                          child: Text(
                            entry.value,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      const DropdownMenuItem(
                        value: '__NEW__',
                        child: Text(
                          '+ Create New Category...',
                          style: TextStyle(
                            color: AppleColors.blue,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                    onChanged: (v) {
                      if (v == '__NEW__') {
                        setModalState(() => useCustomCategory = true);
                      } else if (v != null) {
                        setModalState(() => category = v);
                      }
                    },
                  ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: ctx,
                            initialDate: selectedDate,
                            firstDate: DateTime(2020),
                            lastDate: DateTime.now()
                                .add(const Duration(days: 365)),
                          );
                          if (picked != null) {
                            setModalState(() => selectedDate = picked);
                          }
                        },
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Expense Date *',
                            suffixIcon: Icon(
                              Icons.calendar_today_outlined,
                              size: 16,
                            ),
                          ),
                          child: Text(
                            formatShortDate(selectedDate),
                            style: const TextStyle(fontSize: 14),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: amountCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration:
                            const InputDecoration(labelText: 'Amount (₹) *'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: descCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Description *',
                    hintText: 'e.g. Razorpay Rize company registration fee',
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: mode,
                        isExpanded: true,
                        decoration:
                            const InputDecoration(labelText: 'Payment Mode'),
                        items: const [
                          DropdownMenuItem(value: 'UPI', child: Text('UPI')),
                          DropdownMenuItem(
                            value: 'NEFT_RTGS',
                            child: Text('Bank / NEFT'),
                          ),
                          DropdownMenuItem(
                            value: 'COMPANY_CARD',
                            child: Text('Corp Card'),
                          ),
                          DropdownMenuItem(
                            value: 'CASH',
                            child: Text('Petty Cash'),
                          ),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => mode = v);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: vendorCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Vendor / Paid To',
                          hintText: 'e.g. MCA / AWS',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: paidBySelection,
                        isExpanded: true,
                        decoration: const InputDecoration(labelText: 'Paid By'),
                        items: [
                          const DropdownMenuItem(
                            value: 'Company Account',
                            child: Text(
                              'Company Account',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          for (final s in uniqueStaff)
                            DropdownMenuItem(
                              value: s,
                              child: Text(s, overflow: TextOverflow.ellipsis),
                            ),
                          const DropdownMenuItem(
                            value: '__OTHER__',
                            child: Text('Other Person...'),
                          ),
                        ],
                        onChanged: (v) {
                          if (v != null) {
                            setModalState(() {
                              paidBySelection = v;
                              if (v == 'Company Account') {
                                reimbursementStatus = 'COMPANY_PAID';
                              } else if (reimbursementStatus ==
                                  'COMPANY_PAID') {
                                reimbursementStatus = 'PENDING';
                              }
                            });
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: reimbursementStatus,
                        isExpanded: true,
                        decoration:
                            const InputDecoration(labelText: 'Reimbursement'),
                        items: const [
                          DropdownMenuItem(
                            value: 'COMPANY_PAID',
                            child: Text('Company Paid'),
                          ),
                          DropdownMenuItem(
                            value: 'PENDING',
                            child: Text('Pending'),
                          ),
                          DropdownMenuItem(
                            value: 'REIMBURSED',
                            child: Text('Reimbursed'),
                          ),
                        ],
                        onChanged: (v) {
                          if (v != null) {
                            setModalState(() => reimbursementStatus = v);
                          }
                        },
                      ),
                    ),
                  ],
                ),
                if (paidBySelection == '__OTHER__') ...[
                  const SizedBox(height: 10),
                  TextField(
                    controller: customPaidByCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Paid By Name',
                      hintText: 'Enter Director / Staff name',
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: billNoCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Bill / Inv #',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: refNoCtrl,
                        decoration: const InputDecoration(
                          labelText: 'UTR / Txn Ref',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Notes / Remarks (Optional)',
                  ),
                ),
                const SizedBox(height: 12),
                // Bill / Receipt attachment controls
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppleColors.canvas,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppleColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.attach_file_rounded,
                            size: 17,
                            color: AppleColors.blue,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              pickedReceipt != null
                                  ? pickedReceipt!.path.split('/').last
                                  : (isEdit &&
                                          existing.hasReceipt &&
                                          !removeReceipt)
                                      ? (existing.receiptName ??
                                          'Bill attached')
                                      : 'Attach Bill / Receipt (PDF or Photo)',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          if (pickedReceipt != null)
                            IconButton(
                              visualDensity: VisualDensity.compact,
                              icon: const Icon(
                                Icons.close_rounded,
                                size: 17,
                                color: AppleColors.red,
                              ),
                              onPressed: () =>
                                  setModalState(() => pickedReceipt = null),
                            )
                          else if (isEdit &&
                              existing.hasReceipt &&
                              !removeReceipt)
                            TextButton(
                              onPressed: () =>
                                  setModalState(() => removeReceipt = true),
                              child: const Text(
                                'Remove',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppleColors.red,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      OutlinedButton.icon(
                        onPressed: () async {
                          final picked = await FilePicker.pickFiles(
                            type: FileType.custom,
                            allowedExtensions: const [
                              'pdf',
                              'png',
                              'jpg',
                              'jpeg',
                              'webp',
                            ],
                          );
                          if (picked.isNotEmpty &&
                              picked.first.path != null &&
                              picked.first.path!.isNotEmpty) {
                            setModalState(() {
                              pickedReceipt = File(picked.first.path!);
                              removeReceipt = false;
                            });
                          }
                        },
                        icon: const Icon(Icons.upload_file_outlined, size: 16),
                        label: Text(
                          pickedReceipt != null ||
                                  (isEdit &&
                                      existing.hasReceipt &&
                                      !removeReceipt)
                              ? 'Change Bill / Receipt'
                              : 'Pick Photo or PDF',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          final amt =
                              double.tryParse(amountCtrl.text.trim()) ?? 0;
                          final finalCategory = useCustomCategory
                              ? customCatCtrl.text.trim()
                              : category;
                          if (amt <= 0 ||
                              descCtrl.text.trim().isEmpty ||
                              finalCategory.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Enter valid Category, Amount, and Description.',
                                ),
                              ),
                            );
                            return;
                          }
                          final resolvedPaidBy = paidBySelection == '__OTHER__'
                              ? customPaidByCtrl.text.trim()
                              : paidBySelection;
                          final dateStr = _formatIsoDate(selectedDate);

                          setModalState(() => submitting = true);
                          try {
                            if (isEdit) {
                              await widget.erpRepository.updateExpense(
                                id: existing.id,
                                category: finalCategory,
                                amount: amt,
                                description: descCtrl.text.trim(),
                                paymentMode: mode,
                                expenseDate: dateStr,
                                vendorName: vendorCtrl.text.trim(),
                                paidBy: resolvedPaidBy,
                                billNumber: billNoCtrl.text.trim(),
                                referenceNo: refNoCtrl.text.trim(),
                                reimbursementStatus: reimbursementStatus,
                                notes: notesCtrl.text.trim(),
                                receiptFile: pickedReceipt,
                                removeReceipt: removeReceipt,
                              );
                            } else {
                              await widget.erpRepository.createExpense(
                                category: finalCategory,
                                amount: amt,
                                description: descCtrl.text.trim(),
                                paymentMode: mode,
                                expenseDate: dateStr,
                                vendorName: vendorCtrl.text.trim().isEmpty
                                    ? null
                                    : vendorCtrl.text.trim(),
                                paidBy: resolvedPaidBy.isEmpty
                                    ? null
                                    : resolvedPaidBy,
                                billNumber: billNoCtrl.text.trim().isEmpty
                                    ? null
                                    : billNoCtrl.text.trim(),
                                referenceNo: refNoCtrl.text.trim().isEmpty
                                    ? null
                                    : refNoCtrl.text.trim(),
                                reimbursementStatus: reimbursementStatus,
                                notes: notesCtrl.text.trim().isEmpty
                                    ? null
                                    : notesCtrl.text.trim(),
                                receiptFile: pickedReceipt,
                              );
                            }
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isEdit
                                        ? 'Expense updated successfully.'
                                        : 'Expense logged successfully.',
                                  ),
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
                      : Text(isEdit ? 'Save Changes' : 'Save Expense'),
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
              onPressed: () => _showExpenseFormSheet(),
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
              Expanded(
                child: Column(
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
                    if (_pendingReimbursements > 0) ...[
                      const SizedBox(height: 4),
                      AppleBadge(
                        label:
                            'Pending Reimb.: ${formatInr(_pendingReimbursements)}',
                        background: AppleColors.amberSoft,
                        foreground: AppleColors.amber,
                      ),
                    ],
                  ],
                ),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              e.description,
                              style: const TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${e.category.replaceAll('_', ' ')} • ${e.paymentMode.replaceAll('_', ' ')} • ${formatShortDate(e.expenseDate)}',
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: AppleColors.inkMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        formatInr(e.amount),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppleColors.red,
                        ),
                      ),
                    ],
                  ),
                  if ((e.vendorName?.isNotEmpty ?? false) ||
                      (e.paidBy?.isNotEmpty ?? false) ||
                      e.reimbursementStatus != 'COMPANY_PAID' ||
                      (e.billNumber?.isNotEmpty ?? false) ||
                      (e.referenceNo?.isNotEmpty ?? false)) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        if (e.vendorName?.isNotEmpty ?? false)
                          AppleBadge(
                            label: 'To: ${e.vendorName}',
                            background: AppleColors.canvas,
                            foreground: AppleColors.inkPrimary,
                          ),
                        if (e.paidBy?.isNotEmpty ?? false)
                          AppleBadge(
                            label: 'By: ${e.paidBy}',
                            background: AppleColors.blueSoft,
                            foreground: AppleColors.blue,
                          ),
                        if (e.reimbursementStatus == 'PENDING')
                          const AppleBadge(
                            label: 'Pending Reimb.',
                            background: AppleColors.amberSoft,
                            foreground: AppleColors.amber,
                          ),
                        if (e.reimbursementStatus == 'REIMBURSED')
                          const AppleBadge(
                            label: 'Reimbursed',
                            background: AppleColors.greenSoft,
                            foreground: AppleColors.green,
                          ),
                        if (e.billNumber?.isNotEmpty ?? false)
                          AppleBadge(
                            label: 'Bill #${e.billNumber}',
                            background: AppleColors.canvas,
                            foreground: AppleColors.inkSecondary,
                          ),
                        if (e.referenceNo?.isNotEmpty ?? false)
                          AppleBadge(
                            label: 'Ref: ${e.referenceNo}',
                            background: AppleColors.canvas,
                            foreground: AppleColors.inkSecondary,
                          ),
                      ],
                    ),
                  ],
                  if (e.notes?.isNotEmpty ?? false) ...[
                    const SizedBox(height: 6),
                    Text(
                      e.notes!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppleColors.inkSecondary,
                      ),
                    ),
                  ],
                  if (e.hasReceipt || widget.user.isFullAdmin) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (e.hasReceipt)
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              visualDensity: VisualDensity.compact,
                            ),
                            onPressed: () => _openReceipt(e),
                            icon: const Icon(
                              Icons.attach_file_rounded,
                              size: 15,
                            ),
                            label: Text(
                              e.receiptName?.isNotEmpty == true
                                  ? 'View Bill'
                                  : 'Receipt',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                        const Spacer(),
                        if (widget.user.isFullAdmin) ...[
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            tooltip: 'Edit expense (Super Admin)',
                            icon: const Icon(
                              Icons.edit_outlined,
                              size: 19,
                              color: AppleColors.blue,
                            ),
                            onPressed: () =>
                                _showExpenseFormSheet(existing: e),
                          ),
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
                      ],
                    ),
                  ],
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
