import 'package:material_ui/material_ui.dart';

import '../../../../domain/models/crm_models.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../view_models/billing_view_model.dart';

Future<void> showCreateClientSheet(
  BuildContext context,
  BillingViewModel viewModel,
) async {
  final companyCtrl = TextEditingController();
  final contactCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final gstinCtrl = TextEditingController();
  final addressCtrl = TextEditingController();
  String selectedState = 'Haryana';
  String selectedCode = '06';
  bool submitting = false;

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setModalState) {
        return Padding(
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
                  'Add New Client / Party',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                const Text(
                  'GSTIN first 2 digits auto-select state for CGST/IGST.',
                  style: TextStyle(fontSize: 12.5, color: AppleColors.inkSecondary),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: companyCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Company / Party Name *',
                    hintText: 'e.g. Tanishq Jewellers Pvt Ltd',
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: contactCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Contact Person',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: phoneCtrl,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(
                          labelText: 'Phone *',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email Address'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: gstinCtrl,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    labelText: 'GSTIN (Optional for B2C)',
                    hintText: '06AAACG1234F1Z5',
                  ),
                  onChanged: (v) {
                    final clean = v.trim().toUpperCase();
                    if (clean.length >= 2) {
                      final code = clean.substring(0, 2);
                      final match = kIndianStates.where((s) => s['code'] == code);
                      if (match.isNotEmpty) {
                        setModalState(() {
                          selectedState = match.first['name']!;
                          selectedCode = match.first['code']!;
                        });
                      }
                    }
                  },
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: selectedCode,
                  decoration: const InputDecoration(labelText: 'State (Place of Supply)'),
                  items: kIndianStates
                      .map(
                        (s) => DropdownMenuItem(
                          value: s['code'],
                          child: Text('${s['name']} (${s['code']})'),
                        ),
                      )
                      .toList(),
                  onChanged: (val) {
                    if (val == null) return;
                    final match = kIndianStates.firstWhere((s) => s['code'] == val);
                    setModalState(() {
                      selectedCode = val;
                      selectedState = match['name']!;
                    });
                  },
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: addressCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Billing Address'),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          if (companyCtrl.text.trim().isEmpty ||
                              phoneCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Company Name and Phone are required.'),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            await viewModel.createClient(
                              companyName: companyCtrl.text.trim(),
                              contactPerson: contactCtrl.text.trim().isEmpty
                                  ? null
                                  : contactCtrl.text.trim(),
                              phone: phoneCtrl.text.trim(),
                              email: emailCtrl.text.trim().isEmpty
                                  ? null
                                  : emailCtrl.text.trim(),
                              gstin: gstinCtrl.text.trim().isEmpty
                                  ? null
                                  : gstinCtrl.text.trim().toUpperCase(),
                              state: selectedState,
                              stateCode: selectedCode,
                              billingAddress: addressCtrl.text.trim().isEmpty
                                  ? null
                                  : addressCtrl.text.trim(),
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Client added successfully.')),
                              );
                            }
                          } catch (e) {
                            setModalState(() => submitting = false);
                            if (context.mounted) {
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
                      : const Text('Save Client'),
                ),
              ],
            ),
          ),
        );
      },
    ),
  );
}

Future<void> showRecordPaymentSheet(
  BuildContext context,
  BillingViewModel viewModel,
  InvoiceItem invoice,
) async {
  final amountCtrl = TextEditingController(
    text: invoice.balanceDue > 0
        ? invoice.balanceDue.toStringAsFixed(0)
        : invoice.totalAmount.toStringAsFixed(0),
  );
  final refCtrl = TextEditingController();
  final notesCtrl = TextEditingController();
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
                'Record Payment',
                style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(
                '${invoice.invoiceNumber} • ${invoice.customerName}\nBalance Due: ${formatInr(invoice.balanceDue)}',
                style: const TextStyle(fontSize: 13, color: AppleColors.inkSecondary),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: amountCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Amount Received (₹) *',
                ),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                initialValue: mode,
                decoration: const InputDecoration(labelText: 'Payment Mode'),
                items: const [
                  DropdownMenuItem(value: 'UPI', child: Text('UPI / QR')),
                  DropdownMenuItem(value: 'NEFT_RTGS', child: Text('NEFT / RTGS / IMPS')),
                  DropdownMenuItem(value: 'CASH', child: Text('Cash')),
                  DropdownMenuItem(value: 'CHEQUE', child: Text('Cheque')),
                ],
                onChanged: (v) {
                  if (v != null) setModalState(() => mode = v);
                },
              ),
              const SizedBox(height: 10),
              TextField(
                controller: refCtrl,
                decoration: const InputDecoration(
                  labelText: 'UTR / Transaction Reference #',
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: notesCtrl,
                decoration: const InputDecoration(labelText: 'Notes (Optional)'),
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: submitting
                    ? null
                    : () async {
                        final amt = double.tryParse(amountCtrl.text.trim()) ?? 0;
                        if (amt <= 0) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Enter a valid amount.')),
                          );
                          return;
                        }
                        setModalState(() => submitting = true);
                        try {
                          await viewModel.recordPayment(
                            invoiceId: invoice.id,
                            amount: amt,
                            paymentMode: mode,
                            referenceNumber: refCtrl.text.trim().isEmpty
                                ? null
                                : refCtrl.text.trim(),
                            notes: notesCtrl.text.trim().isEmpty
                                ? null
                                : notesCtrl.text.trim(),
                          );
                          if (ctx.mounted) Navigator.pop(ctx);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Payment recorded & invoice updated.'),
                              ),
                            );
                          }
                        } catch (e) {
                          setModalState(() => submitting = false);
                          if (context.mounted) {
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
                    : const Text('Confirm Payment'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class _DraftLineItem {
  String? productId;
  final TextEditingController descriptionCtrl;
  final TextEditingController hsnCtrl;
  final TextEditingController qtyCtrl;
  final TextEditingController priceCtrl;
  final TextEditingController serialsCtrl;

  _DraftLineItem({
    String description = '',
    String hsn = '8471',
    String qty = '1',
    String price = '',
  })  : productId = null, descriptionCtrl = TextEditingController(text: description),
        hsnCtrl = TextEditingController(text: hsn),
        qtyCtrl = TextEditingController(text: qty),
        priceCtrl = TextEditingController(text: price),
        serialsCtrl = TextEditingController();

  double get quantity => double.tryParse(qtyCtrl.text.trim()) ?? 0;
  double get unitPrice => double.tryParse(priceCtrl.text.trim()) ?? 0;
  double get taxable => quantity * unitPrice;

  void dispose() {
    descriptionCtrl.dispose();
    hsnCtrl.dispose();
    qtyCtrl.dispose();
    priceCtrl.dispose();
    serialsCtrl.dispose();
  }
}

class CreateBillingDocumentScreen extends StatefulWidget {
  const CreateBillingDocumentScreen({
    super.key,
    required this.viewModel,
    required this.isInvoice,
  });

  final BillingViewModel viewModel;
  final bool isInvoice;

  @override
  State<CreateBillingDocumentScreen> createState() =>
      _CreateBillingDocumentScreenState();
}

class _CreateBillingDocumentScreenState
    extends State<CreateBillingDocumentScreen> {
  String? _selectedClientId;
  String _invoiceType = 'TAX_INVOICE';
  final _validDaysCtrl = TextEditingController(text: '15');
  final _ewayCtrl = TextEditingController();
  final _transporterCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();
  final _termsCtrl = TextEditingController(
    text: '50% advance, 50% on delivery. 1 Year standard hardware warranty.',
  );

  final List<_DraftLineItem> _lines = [_DraftLineItem()];
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.viewModel.clients.isNotEmpty) {
      _selectedClientId = widget.viewModel.clients.first.id;
    } else {
      widget.viewModel.loadAll().then((_) {
        if (mounted && widget.viewModel.clients.isNotEmpty) {
          setState(() => _selectedClientId = widget.viewModel.clients.first.id);
        }
      });
    }
  }

  @override
  void dispose() {
    _validDaysCtrl.dispose();
    _ewayCtrl.dispose();
    _transporterCtrl.dispose();
    _vehicleCtrl.dispose();
    _termsCtrl.dispose();
    for (final line in _lines) {
      line.dispose();
    }
    super.dispose();
  }

  ClientItem? get _selectedClient {
    if (_selectedClientId == null) return null;
    for (final c in widget.viewModel.clients) {
      if (c.id == _selectedClientId) return c;
    }
    return null;
  }

  double get _subtotal => _lines.fold<double>(0, (s, l) => s + l.taxable);
  bool get _isHaryana => (_selectedClient?.stateCode ?? '06') == '06';
  double get _totalTax => _subtotal * 0.18;
  double get _grandTotal => _subtotal + _totalTax;

  Future<void> _submit() async {
    if (_selectedClientId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a Client first.')),
      );
      return;
    }
    final validItems = <Map<String, dynamic>>[];
    for (final l in _lines) {
      if (l.descriptionCtrl.text.trim().isEmpty ||
          l.quantity <= 0 ||
          l.unitPrice <= 0) {
        continue;
      }
      validItems.add({
        'productId': l.productId,
        'description': l.descriptionCtrl.text.trim(),
        'hsnCode': l.hsnCtrl.text.trim().isEmpty ? '8471' : l.hsnCtrl.text.trim(),
        'quantity': l.quantity,
        'unitPrice': l.unitPrice,
        if (widget.isInvoice && l.serialsCtrl.text.trim().isNotEmpty)
          'serialNumbersList': l.serialsCtrl.text.trim(),
      });
    }

    if (validItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Add at least one line item with description, qty & rate.'),
        ),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      if (widget.isInvoice) {
        await widget.viewModel.createInvoice(
          customerId: _selectedClientId!,
          invoiceType: _invoiceType,
          ewayBillNo: _ewayCtrl.text.trim().isEmpty ? null : _ewayCtrl.text.trim(),
          transporterName: _transporterCtrl.text.trim().isEmpty
              ? null
              : _transporterCtrl.text.trim(),
          vehicleNo:
              _vehicleCtrl.text.trim().isEmpty ? null : _vehicleCtrl.text.trim(),
          terms: _termsCtrl.text.trim().isEmpty ? null : _termsCtrl.text.trim(),
          items: validItems,
        );
      } else {
        await widget.viewModel.createQuotation(
          customerId: _selectedClientId!,
          validUntilDays: int.tryParse(_validDaysCtrl.text.trim()) ?? 15,
          terms: _termsCtrl.text.trim().isEmpty ? null : _termsCtrl.text.trim(),
          items: validItems,
        );
      }
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.isInvoice
                  ? 'Invoice generated with UPI & GST!'
                  : 'Quotation generated successfully!',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final clients = widget.viewModel.clients;
    final products = widget.viewModel.products;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isInvoice ? 'New GST Invoice' : 'New Quotation'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 36),
        children: [
          AppleCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Client & Tax Mode',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                if (clients.isEmpty)
                  const Text(
                    'No clients found. Add a client first from the Clients tab.',
                    style: TextStyle(color: AppleColors.red, fontSize: 13),
                  )
                else
                  DropdownButtonFormField<String>(
                    initialValue: _selectedClientId,
                    isExpanded: true,
                    decoration: const InputDecoration(labelText: 'Select Party / Client *'),
                    items: clients
                        .map(
                          (c) => DropdownMenuItem(
                            value: c.id,
                            child: Text(
                              '${c.companyName} (${c.state})',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (v) => setState(() => _selectedClientId = v),
                  ),
                const SizedBox(height: 10),
                if (widget.isInvoice)
                  DropdownButtonFormField<String>(
                    initialValue: _invoiceType,
                    decoration: const InputDecoration(labelText: 'Invoice Type'),
                    items: const [
                      DropdownMenuItem(
                        value: 'TAX_INVOICE',
                        child: Text('GST Tax Invoice'),
                      ),
                      DropdownMenuItem(
                        value: 'PROFORMA_INVOICE',
                        child: Text('Proforma Invoice (PI)'),
                      ),
                    ],
                    onChanged: (v) {
                      if (v != null) setState(() => _invoiceType = v);
                    },
                  )
                else
                  TextField(
                    controller: _validDaysCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Valid For (Days)',
                    ),
                  ),
                if (_selectedClient != null) ...[
                  const SizedBox(height: 10),
                  AppleBadge(
                    label: _isHaryana
                        ? 'Intra-State Haryana (06) → 9% CGST + 9% SGST'
                        : 'Inter-State (${_selectedClient!.state} - ${_selectedClient!.stateCode}) → 18% IGST',
                    background: AppleColors.blueSoft,
                    foreground: AppleColors.blue,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Line Items
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Line Items (18% GST)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
              TextButton.icon(
                onPressed: () => setState(() => _lines.add(_DraftLineItem())),
                icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                label: const Text('Add Item'),
              ),
            ],
          ),
          const SizedBox(height: 6),
          for (int i = 0; i < _lines.length; i++) ...[
            AppleCard(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Text(
                        'Item #${i + 1}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppleColors.inkSecondary,
                        ),
                      ),
                      const Spacer(),
                      if (_lines.length > 1)
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          onPressed: () {
                            setState(() {
                              _lines[i].dispose();
                              _lines.removeAt(i);
                            });
                          },
                          icon: const Icon(
                            Icons.delete_outline_rounded,
                            size: 19,
                            color: AppleColors.red,
                          ),
                        ),
                    ],
                  ),
                  if (products.isNotEmpty) ...[
                    DropdownButtonFormField<String?>(
                      initialValue: _lines[i].productId,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        labelText: 'Quick-pick from Catalog (Optional)',
                      ),
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Custom Manual Entry'),
                        ),
                        ...products.map(
                          (p) => DropdownMenuItem<String?>(
                            value: p.id,
                            child: Text(
                              '${p.name} — ${formatInr(p.sellingPrice)}',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                      onChanged: (pid) {
                        setState(() {
                          _lines[i].productId = pid;
                          if (pid != null) {
                            final prod = products.firstWhere((p) => p.id == pid);
                            _lines[i].descriptionCtrl.text = prod.name;
                            _lines[i].hsnCtrl.text = prod.hsnCode;
                            _lines[i].priceCtrl.text =
                                prod.sellingPrice.toStringAsFixed(0);
                          }
                        });
                      },
                    ),
                    const SizedBox(height: 10),
                  ],
                  TextField(
                    controller: _lines[i].descriptionCtrl,
                    decoration: const InputDecoration(labelText: 'Item Description *'),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _lines[i].hsnCtrl,
                          decoration: const InputDecoration(labelText: 'HSN/SAC'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _lines[i].qtyCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'Qty *'),
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: _lines[i].priceCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'Unit Rate (₹) *'),
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                    ],
                  ),
                  if (widget.isInvoice) ...[
                    const SizedBox(height: 10),
                    TextField(
                      controller: _lines[i].serialsCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Hardware Serials / IMEI (Optional)',
                        hintText: 'Comma separated serial numbers',
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],

          if (widget.isInvoice) ...[
            AppleCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'E-Way Bill & Dispatch (Optional)',
                    style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _ewayCtrl,
                    decoration: const InputDecoration(labelText: 'E-Way Bill Number'),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _transporterCtrl,
                          decoration: const InputDecoration(labelText: 'Transporter'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _vehicleCtrl,
                          decoration: const InputDecoration(labelText: 'Vehicle No.'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],

          AppleCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: _termsCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Terms & Conditions'),
                ),
                const SizedBox(height: 14),
                const Divider(height: 1),
                const SizedBox(height: 12),
                _SummaryRow(label: 'Taxable Subtotal', value: formatInr(_subtotal)),
                if (_isHaryana) ...[
                  _SummaryRow(label: 'CGST (9%)', value: formatInr(_totalTax / 2)),
                  _SummaryRow(label: 'SGST (9%)', value: formatInr(_totalTax / 2)),
                ] else
                  _SummaryRow(label: 'IGST (18%)', value: formatInr(_totalTax)),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Grand Total',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    Text(
                      formatInr(_grandTotal),
                      style: const TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.w800,
                        color: AppleColors.blue,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: _submitting
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    widget.isInvoice
                        ? 'Generate GST Invoice'
                        : 'Generate Quotation',
                  ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppleColors.inkSecondary),
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
