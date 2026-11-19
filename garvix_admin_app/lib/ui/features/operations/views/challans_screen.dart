import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/crm_repository.dart';
import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/crm_models.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class ChallansScreen extends StatefulWidget {
  const ChallansScreen({
    super.key,
    required this.erpRepository,
    required this.crmRepository,
    required this.user,
  });

  final ErpRepository erpRepository;
  final CrmRepository crmRepository;
  final AuthUser user;

  @override
  State<ChallansScreen> createState() => _ChallansScreenState();
}

class _ChallansScreenState extends State<ChallansScreen> {
  List<ChallanItem> _challans = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await widget.erpRepository.fetchChallans();
      if (mounted) setState(() => _challans = list);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openCreate() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => _CreateChallanScreen(
          erpRepository: widget.erpRepository,
          crmRepository: widget.crmRepository,
        ),
      ),
    );
    if (created == true) {
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Challans'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      floatingActionButton: widget.user.canViewChallans
          ? FloatingActionButton.extended(
              onPressed: _openCreate,
              backgroundColor: AppleColors.blue,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.local_shipping_outlined),
              label: const Text('New Challan'),
            )
          : null,
      body: _loading && _challans.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _challans.isEmpty
              ? AppleEmptyState(
                  icon: Icons.error_outline_rounded,
                  title: 'Failed to load challans',
                  subtitle: _error!,
                  actionLabel: 'Retry',
                  onAction: _load,
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _challans.isEmpty
                      ? AppleEmptyState(
                          icon: Icons.local_shipping_outlined,
                          title: 'No delivery challans yet',
                          subtitle:
                              'Issue returnable demo or deployment challans with serial numbers.',
                          actionLabel: 'Create Challan',
                          onAction: _openCreate,
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 92),
                          itemCount: _challans.length,
                          separatorBuilder: (_, _) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final c = _challans[index];
                            final isOpen = c.status.toUpperCase() == 'OPEN';
                            return AppleCard(
                              padding: const EdgeInsets.all(15),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          c.customerName,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                      AppleBadge(
                                        label: c.status.replaceAll('_', ' '),
                                        background: isOpen
                                            ? AppleColors.amberSoft
                                            : AppleColors.greenSoft,
                                        foreground: isOpen
                                            ? AppleColors.amber
                                            : AppleColors.green,
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
                                          onPressed: () =>
                                              confirmSuperAdminDelete(
                                            context,
                                            label:
                                                'challan "${c.challanNumber}"',
                                            onDelete: () async {
                                              await widget.erpRepository
                                                  .deleteRecord(
                                                entity: 'challan',
                                                id: c.id,
                                              );
                                              await _load();
                                            },
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${c.challanNumber} • ${formatShortDate(c.dispatchDate)}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppleColors.inkMuted,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Wrap(
                                    spacing: 6,
                                    runSpacing: 6,
                                    children: [
                                      AppleBadge(
                                        label: c.challanType.replaceAll('_', ' '),
                                      ),
                                      AppleBadge(
                                        label: c.reason.replaceAll('_', ' '),
                                        background: AppleColors.canvas,
                                        foreground: AppleColors.inkSecondary,
                                      ),
                                      AppleBadge(
                                        label:
                                            '${c.itemCount} item(s) • Qty ${c.totalQuantity.toStringAsFixed(0)}',
                                        background: AppleColors.canvas,
                                        foreground: AppleColors.inkPrimary,
                                      ),
                                    ],
                                  ),
                                  if ((c.transporterName?.isNotEmpty ?? false) ||
                                      (c.vehicleNumber?.isNotEmpty ?? false)) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      'Dispatch: ${c.transporterName ?? "Self"} ${c.vehicleNumber != null ? "• ${c.vehicleNumber}" : ""}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppleColors.inkSecondary,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            );
                          },
                        ),
                ),
    );
  }
}

class _DraftChallanItem {
  String? productId;
  final TextEditingController descCtrl = TextEditingController();
  final TextEditingController hsnCtrl = TextEditingController(text: '8471');
  final TextEditingController qtyCtrl = TextEditingController(text: '1');
  final TextEditingController serialsCtrl = TextEditingController();

  void dispose() {
    descCtrl.dispose();
    hsnCtrl.dispose();
    qtyCtrl.dispose();
    serialsCtrl.dispose();
  }
}

class _CreateChallanScreen extends StatefulWidget {
  const _CreateChallanScreen({
    required this.erpRepository,
    required this.crmRepository,
  });

  final ErpRepository erpRepository;
  final CrmRepository crmRepository;

  @override
  State<_CreateChallanScreen> createState() => _CreateChallanScreenState();
}

class _CreateChallanScreenState extends State<_CreateChallanScreen> {
  List<ClientItem> _clients = const [];
  List<ProductItem> _products = const [];
  bool _loading = true;
  bool _submitting = false;

  String? _customerId;
  String _challanType = 'RETURNABLE';
  String _reason = 'DEMO_TESTING';
  final _transporterCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final List<_DraftChallanItem> _items = [_DraftChallanItem()];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        widget.crmRepository.fetchClients().catchError((_) => <ClientItem>[]),
        widget.erpRepository.fetchProducts().catchError((_) => <ProductItem>[]),
      ]);
      if (mounted) {
        setState(() {
          _clients = results[0] as List<ClientItem>;
          _products = results[1] as List<ProductItem>;
          if (_clients.isNotEmpty) _customerId = _clients.first.id;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _transporterCtrl.dispose();
    _vehicleCtrl.dispose();
    _notesCtrl.dispose();
    for (final i in _items) {
      i.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (_customerId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a Client.')),
      );
      return;
    }

    final payloadItems = <Map<String, dynamic>>[];
    for (final it in _items) {
      if (it.descCtrl.text.trim().isEmpty) continue;
      payloadItems.add({
        'productId': it.productId,
        'description': it.descCtrl.text.trim(),
        'hsnCode': it.hsnCtrl.text.trim().isEmpty ? '8471' : it.hsnCtrl.text.trim(),
        'quantity': double.tryParse(it.qtyCtrl.text.trim()) ?? 1,
        'serialNumbersList': it.serialsCtrl.text.trim().isEmpty
            ? null
            : it.serialsCtrl.text.trim(),
      });
    }

    if (payloadItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one item description.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await widget.erpRepository.createChallan(
        customerId: _customerId!,
        challanType: _challanType,
        reason: _reason,
        transporterName: _transporterCtrl.text.trim().isEmpty
            ? null
            : _transporterCtrl.text.trim(),
        vehicleNumber: _vehicleCtrl.text.trim().isEmpty
            ? null
            : _vehicleCtrl.text.trim(),
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
        items: payloadItems,
      );
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Delivery Challan issued!')),
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
    return Scaffold(
      appBar: AppBar(title: const Text('New Delivery Challan')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 36),
              children: [
                AppleCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      DropdownButtonFormField<String>(
                        initialValue: _customerId,
                        isExpanded: true,
                        decoration:
                            const InputDecoration(labelText: 'Select Party / Client *'),
                        items: _clients
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
                        onChanged: (v) => setState(() => _customerId = v),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              initialValue: _challanType,
                              decoration:
                                  const InputDecoration(labelText: 'Challan Type'),
                              items: const [
                                DropdownMenuItem(
                                  value: 'RETURNABLE',
                                  child: Text('Returnable'),
                                ),
                                DropdownMenuItem(
                                  value: 'NON_RETURNABLE',
                                  child: Text('Non-Returnable'),
                                ),
                              ],
                              onChanged: (v) {
                                if (v != null) setState(() => _challanType = v);
                              },
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              initialValue: _reason,
                              decoration: const InputDecoration(labelText: 'Reason'),
                              items: const [
                                DropdownMenuItem(
                                  value: 'DEMO_TESTING',
                                  child: Text('Demo / Testing'),
                                ),
                                DropdownMenuItem(
                                  value: 'DEPLOYMENT_INSTALLATION',
                                  child: Text('Deployment'),
                                ),
                                DropdownMenuItem(
                                  value: 'REPAIR_REPLACEMENT',
                                  child: Text('Repair / RMA'),
                                ),
                              ],
                              onChanged: (v) {
                                if (v != null) setState(() => _reason = v);
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _transporterCtrl,
                              decoration:
                                  const InputDecoration(labelText: 'Transporter / Courier'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _vehicleCtrl,
                              decoration:
                                  const InputDecoration(labelText: 'Vehicle / AWB #'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Dispatched Hardware / Items',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    TextButton.icon(
                      onPressed: () =>
                          setState(() => _items.add(_DraftChallanItem())),
                      icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                      label: const Text('Add Item'),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                for (int i = 0; i < _items.length; i++) ...[
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
                            if (_items.length > 1)
                              IconButton(
                                visualDensity: VisualDensity.compact,
                                onPressed: () => setState(() {
                                  _items[i].dispose();
                                  _items.removeAt(i);
                                }),
                                icon: const Icon(
                                  Icons.delete_outline_rounded,
                                  color: AppleColors.red,
                                  size: 19,
                                ),
                              ),
                          ],
                        ),
                        if (_products.isNotEmpty) ...[
                          DropdownButtonFormField<String?>(
                            initialValue: _items[i].productId,
                            isExpanded: true,
                            decoration: const InputDecoration(
                              labelText: 'Pick Hardware / Product (Optional)',
                            ),
                            items: [
                              const DropdownMenuItem<String?>(
                                value: null,
                                child: Text('Manual Entry'),
                              ),
                              ..._products.map(
                                (p) => DropdownMenuItem<String?>(
                                  value: p.id,
                                  child: Text(
                                    '${p.name} (Stock: ${p.currentStock})',
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ),
                            ],
                            onChanged: (pid) {
                              setState(() {
                                _items[i].productId = pid;
                                if (pid != null) {
                                  final prod = _products.firstWhere((p) => p.id == pid);
                                  _items[i].descCtrl.text = prod.name;
                                  _items[i].hsnCtrl.text = prod.hsnCode;
                                }
                              });
                            },
                          ),
                          const SizedBox(height: 10),
                        ],
                        TextField(
                          controller: _items[i].descCtrl,
                          decoration:
                              const InputDecoration(labelText: 'Item Description *'),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _items[i].hsnCtrl,
                                decoration: const InputDecoration(labelText: 'HSN'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: _items[i].qtyCtrl,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Qty *'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _items[i].serialsCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Serial Numbers / IMEI (Optional)',
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                AppleCard(
                  child: TextField(
                    controller: _notesCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Dispatch Notes'),
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
                      : const Text('Issue Delivery Challan'),
                ),
              ],
            ),
    );
  }
}
