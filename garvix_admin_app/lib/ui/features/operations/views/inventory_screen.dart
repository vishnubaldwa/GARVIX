import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({
    super.key,
    required this.erpRepository,
    required this.user,
    this.initialTab = 0,
  });

  final ErpRepository erpRepository;
  final AuthUser user;
  final int initialTab;

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  late int _tab;
  List<ProductItem> _products = const [];
  List<SerialItem> _serials = const [];
  bool _loading = true;
  String _search = '';
  String _serialStatusFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _tab = widget.initialTab;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        widget.erpRepository.fetchProducts().catchError((_) => <ProductItem>[]),
        widget.erpRepository.fetchSerials().catchError((_) => <SerialItem>[]),
      ]);
      if (mounted) {
        setState(() {
          _products = results[0] as List<ProductItem>;
          _serials = results[1] as List<SerialItem>;
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _showAddProductSheet() async {
    final nameCtrl = TextEditingController();
    final skuCtrl = TextEditingController();
    final hsnCtrl = TextEditingController(text: '8471');
    final buyCtrl = TextEditingController(text: '0');
    final sellCtrl = TextEditingController();
    final stockCtrl = TextEditingController(text: '10');
    final minStockCtrl = TextEditingController(text: '5');
    final descCtrl = TextEditingController();
    String category = 'HARDWARE_READER';
    String unit = 'PCS';
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
                  'Add Hardware / Service SKU',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Product / Service Name *',
                    hintText: 'e.g. UHF RFID Fixed 4-Port Reader',
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: skuCtrl,
                        textCapitalization: TextCapitalization.characters,
                        decoration: const InputDecoration(
                          labelText: 'SKU Code *',
                          hintText: 'GRV-UHF-01',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: hsnCtrl,
                        decoration: const InputDecoration(labelText: 'HSN/SAC *'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: DropdownButtonFormField<String>(
                        initialValue: category,
                        decoration: const InputDecoration(labelText: 'Category'),
                        items: const [
                          DropdownMenuItem(
                            value: 'HARDWARE_READER',
                            child: Text('RFID Reader'),
                          ),
                          DropdownMenuItem(
                            value: 'HARDWARE_ANTENNA',
                            child: Text('RFID Antenna'),
                          ),
                          DropdownMenuItem(
                            value: 'HARDWARE_TAG',
                            child: Text('RFID Tag'),
                          ),
                          DropdownMenuItem(
                            value: 'SOFTWARE_SERVICE',
                            child: Text('Software / SaaS'),
                          ),
                          DropdownMenuItem(
                            value: 'AMC_SUPPORT',
                            child: Text('AMC Support'),
                          ),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => category = v);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: unit,
                        decoration: const InputDecoration(labelText: 'Unit'),
                        items: const [
                          DropdownMenuItem(value: 'PCS', child: Text('PCS')),
                          DropdownMenuItem(value: 'ROLL', child: Text('ROLL')),
                          DropdownMenuItem(value: 'YEAR', child: Text('YEAR')),
                          DropdownMenuItem(value: 'HOURS', child: Text('HRS')),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => unit = v);
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
                        controller: buyCtrl,
                        keyboardType: TextInputType.number,
                        decoration:
                            const InputDecoration(labelText: 'Purchase ₹'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: sellCtrl,
                        keyboardType: TextInputType.number,
                        decoration:
                            const InputDecoration(labelText: 'Selling ₹ *'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: stockCtrl,
                        keyboardType: TextInputType.number,
                        decoration:
                            const InputDecoration(labelText: 'Opening Stock'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: minStockCtrl,
                        keyboardType: TextInputType.number,
                        decoration:
                            const InputDecoration(labelText: 'Low Stock Alert'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description'),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          if (nameCtrl.text.trim().isEmpty ||
                              skuCtrl.text.trim().isEmpty ||
                              hsnCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Name, SKU and HSN are required.'),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            await widget.erpRepository.createProduct(
                              name: nameCtrl.text.trim(),
                              sku: skuCtrl.text.trim().toUpperCase(),
                              category: category,
                              hsnCode: hsnCtrl.text.trim(),
                              description: descCtrl.text.trim().isEmpty
                                  ? null
                                  : descCtrl.text.trim(),
                              purchasePrice:
                                  double.tryParse(buyCtrl.text.trim()) ?? 0,
                              sellingPrice:
                                  double.tryParse(sellCtrl.text.trim()) ?? 0,
                              unit: unit,
                              currentStock:
                                  int.tryParse(stockCtrl.text.trim()) ?? 0,
                              minStockAlert:
                                  int.tryParse(minStockCtrl.text.trim()) ?? 5,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Product added to catalog!'),
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
                      : const Text('Save Product'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final query = _search.trim().toLowerCase();
    final filteredProducts = _products.where((p) {
      if (query.isEmpty) return true;
      return p.name.toLowerCase().contains(query) ||
          p.sku.toLowerCase().contains(query) ||
          p.hsnCode.toLowerCase().contains(query);
    }).toList();

    final filteredSerials = _serials.where((s) {
      if (_serialStatusFilter != 'ALL' && s.status != _serialStatusFilter) {
        return false;
      }
      if (query.isEmpty) return true;
      return s.serialNumber.toLowerCase().contains(query) ||
          (s.imei?.toLowerCase().contains(query) ?? false) ||
          s.productName.toLowerCase().contains(query) ||
          (s.assignedClient?.toLowerCase().contains(query) ?? false);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory & Serials'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      floatingActionButton: _tab == 0 && widget.user.canCreateProduct
          ? FloatingActionButton.extended(
              onPressed: _showAddProductSheet,
              backgroundColor: AppleColors.blue,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_box_outlined),
              label: const Text('Add Product'),
            )
          : null,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: SegmentedButton<int>(
                    showSelectedIcon: false,
                    segments: [
                      ButtonSegment(
                        value: 0,
                        label: Text('Products (${_products.length})'),
                      ),
                      ButtonSegment(
                        value: 1,
                        label: Text('Serials / IMEI (${_serials.length})'),
                      ),
                    ],
                    selected: {_tab},
                    onSelectionChanged: (s) => setState(() => _tab = s.first),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  decoration: InputDecoration(
                    hintText: _tab == 0
                        ? 'Search SKU, product name, HSN...'
                        : 'Search serial #, IMEI, client...',
                    prefixIcon: const Icon(Icons.search_rounded, size: 20),
                  ),
                  onChanged: (v) => setState(() => _search = v),
                ),
                if (_tab == 1) ...[
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final st in [
                          'ALL',
                          'IN_STOCK',
                          'DISPATCHED_CHALLAN',
                          'SOLD_INVOICE',
                          'UNDER_SERVICE',
                        ]) ...[
                          Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ChoiceChip(
                              label: Text(
                                st.replaceAll('_', ' '),
                                style: const TextStyle(fontSize: 11),
                              ),
                              selected: _serialStatusFilter == st,
                              onSelected: (_) =>
                                  setState(() => _serialStatusFilter = st),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          Expanded(
            child: _loading && _products.isEmpty && _serials.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _load,
                    child: _tab == 0
                        ? _buildProducts(filteredProducts)
                        : _buildSerials(filteredSerials),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildProducts(List<ProductItem> list) {
    if (list.isEmpty) {
      return const AppleEmptyState(
        icon: Icons.inventory_2_outlined,
        title: 'No products found',
        subtitle: 'Add RFID readers, antennas, tags or software packages.',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 92),
      itemCount: list.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final p = list[index];
        return AppleCard(
          padding: const EdgeInsets.all(15),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      p.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  AppleBadge(
                    label: 'Stock: ${p.currentStock} ${p.unit}',
                    background: p.isLowStock
                        ? AppleColors.redSoft
                        : AppleColors.greenSoft,
                    foreground:
                        p.isLowStock ? AppleColors.red : AppleColors.green,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'SKU: ${p.sku} • HSN: ${p.hsnCode} • ${p.category.replaceAll('_', ' ')}',
                style:
                    const TextStyle(fontSize: 12, color: AppleColors.inkMuted),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    'Sell: ${formatInr(p.sellingPrice)}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppleColors.blue,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    'Cost: ${formatInr(p.purchasePrice)}',
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppleColors.inkSecondary,
                    ),
                  ),
                  const Spacer(),
                  if (p.serialCount > 0)
                    Text(
                      '${p.serialCount} serials',
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppleColors.inkMuted,
                      ),
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSerials(List<SerialItem> list) {
    if (list.isEmpty) {
      return const AppleEmptyState(
        icon: Icons.qr_code_scanner_rounded,
        title: 'No matching serial numbers',
        subtitle: 'Hardware barcodes and IMEIs tracked in inventory appear here.',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 32),
      itemCount: list.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final s = list[index];
        final inStock = s.status == 'IN_STOCK';
        return AppleCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      s.serialNumber,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppleColors.blue,
                      ),
                    ),
                  ),
                  AppleBadge(
                    label: s.status.replaceAll('_', ' '),
                    background:
                        inStock ? AppleColors.greenSoft : AppleColors.blueSoft,
                    foreground: inStock ? AppleColors.green : AppleColors.blue,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                s.productName,
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (s.imei != null && s.imei!.isNotEmpty)
                Text(
                  'IMEI / Chip: ${s.imei}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppleColors.inkSecondary,
                  ),
                ),
              const SizedBox(height: 6),
              Text(
                s.assignedDoc != null
                    ? '${s.assignedDoc} • ${s.assignedClient ?? ""}'
                    : 'Available in Gurugram Warehouse',
                style:
                    const TextStyle(fontSize: 12, color: AppleColors.inkMuted),
              ),
            ],
          ),
        );
      },
    );
  }
}
