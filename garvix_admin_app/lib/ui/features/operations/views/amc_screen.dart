import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class AmcScreen extends StatefulWidget {
  const AmcScreen({
    super.key,
    required this.erpRepository,
    required this.user,
  });

  final ErpRepository erpRepository;
  final AuthUser user;

  @override
  State<AmcScreen> createState() => _AmcScreenState();
}

class _AmcScreenState extends State<AmcScreen> {
  int _tab = 0;
  List<AmcContractItem> _contracts = const [];
  List<ServiceTicketItem> _tickets = const [];
  List<({String id, String name})> _customers = const [];
  List<String> _staffNames = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  String _isoDate(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await widget.erpRepository.fetchAmcAndTickets();
      if (mounted) {
        setState(() {
          _contracts = data.contracts;
          _tickets = data.tickets;
          _customers = data.customers;
          _staffNames = data.staffNames;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _showAmcFormSheet({AmcContractItem? existing}) async {
    final isEdit = existing != null;
    if (!isEdit && _customers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Add a Client first before creating an AMC contract.'),
        ),
      );
      return;
    }

    String customerId =
        existing?.customerId ?? (_customers.isNotEmpty ? _customers.first.id : '');
    final titleCtrl = TextEditingController(text: existing?.title ?? '');
    DateTime startDate = existing?.startDate ?? DateTime.now();
    DateTime endDate = existing?.endDate ??
        DateTime(startDate.year + 1, startDate.month, startDate.day);
    String frequency = existing?.visitFrequency ?? 'QUARTERLY';
    String status = existing?.status ?? 'ACTIVE';
    final valueCtrl = TextEditingController(
      text: existing != null ? existing.contractValue.toString() : '',
    );
    final notesCtrl = TextEditingController(text: existing?.notes ?? '');
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
                  isEdit
                      ? 'Edit AMC ${existing.contractNumber}'
                      : 'New AMC Support Contract',
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 14),
                if (!isEdit) ...[
                  DropdownButtonFormField<String>(
                    initialValue: customerId,
                    isExpanded: true,
                    decoration: const InputDecoration(labelText: 'Client *'),
                    items: _customers
                        .map(
                          (c) => DropdownMenuItem(
                            value: c.id,
                            child: Text(
                              c.name,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (v) {
                      if (v != null) setModalState(() => customerId = v);
                    },
                  ),
                  const SizedBox(height: 10),
                ],
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'SLA Scope / Contract Title *',
                    hintText: 'e.g. Annual RFID Hardware & Software AMC',
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: ctx,
                            initialDate: startDate,
                            firstDate: DateTime(2020),
                            lastDate: DateTime(2035),
                          );
                          if (picked != null) {
                            setModalState(() => startDate = picked);
                          }
                        },
                        child: InputDecorator(
                          decoration:
                              const InputDecoration(labelText: 'Start Date'),
                          child: Text(formatShortDate(startDate)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: ctx,
                            initialDate: endDate,
                            firstDate: DateTime(2020),
                            lastDate: DateTime(2035),
                          );
                          if (picked != null) {
                            setModalState(() => endDate = picked);
                          }
                        },
                        child: InputDecorator(
                          decoration:
                              const InputDecoration(labelText: 'End Date'),
                          child: Text(formatShortDate(endDate)),
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
                        initialValue: frequency,
                        isExpanded: true,
                        decoration:
                            const InputDecoration(labelText: 'Visit Frequency'),
                        items: const [
                          DropdownMenuItem(
                            value: 'MONTHLY',
                            child: Text('Monthly'),
                          ),
                          DropdownMenuItem(
                            value: 'QUARTERLY',
                            child: Text('Quarterly'),
                          ),
                          DropdownMenuItem(
                            value: 'BI_ANNUAL',
                            child: Text('Bi-Annual'),
                          ),
                          DropdownMenuItem(
                            value: 'ANNUAL',
                            child: Text('Annual'),
                          ),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => frequency = v);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: valueCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: const InputDecoration(
                          labelText: 'Annual Value (₹) *',
                        ),
                      ),
                    ),
                  ],
                ),
                if (isEdit) ...[
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: status,
                    decoration: const InputDecoration(labelText: 'Status'),
                    items: const [
                      DropdownMenuItem(value: 'ACTIVE', child: Text('ACTIVE')),
                      DropdownMenuItem(
                        value: 'EXPIRING_SOON',
                        child: Text('EXPIRING SOON'),
                      ),
                      DropdownMenuItem(
                        value: 'EXPIRED',
                        child: Text('EXPIRED'),
                      ),
                      DropdownMenuItem(
                        value: 'RENEWED',
                        child: Text('RENEWED'),
                      ),
                    ],
                    onChanged: (v) {
                      if (v != null) setModalState(() => status = v);
                    },
                  ),
                ],
                const SizedBox(height: 10),
                TextField(
                  controller: notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Notes / Coverage (Optional)',
                  ),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          if (titleCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Enter SLA Scope / Title.'),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            if (isEdit) {
                              await widget.erpRepository.updateAmcContract(
                                id: existing.id,
                                title: titleCtrl.text.trim(),
                                startDate: _isoDate(startDate),
                                endDate: _isoDate(endDate),
                                visitFrequency: frequency,
                                contractValue:
                                    double.tryParse(valueCtrl.text.trim()) ?? 0,
                                status: status,
                                notes: notesCtrl.text.trim().isEmpty
                                    ? null
                                    : notesCtrl.text.trim(),
                              );
                            } else {
                              await widget.erpRepository.createAmcContract(
                                customerId: customerId,
                                title: titleCtrl.text.trim(),
                                startDate: _isoDate(startDate),
                                endDate: _isoDate(endDate),
                                visitFrequency: frequency,
                                contractValue:
                                    double.tryParse(valueCtrl.text.trim()) ?? 0,
                                notes: notesCtrl.text.trim().isEmpty
                                    ? null
                                    : notesCtrl.text.trim(),
                              );
                            }
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isEdit
                                        ? 'AMC contract updated!'
                                        : 'AMC contract created!',
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
                      : Text(isEdit ? 'Save AMC Changes' : 'Create AMC Contract'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showCreateTicketSheet() async {
    if (_customers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Add a Client first before logging a service ticket.'),
        ),
      );
      return;
    }

    String customerId = _customers.first.id;
    String? amcId;
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String priority = 'MEDIUM';
    String? assignedTo;
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
          final customerAmcs =
              _contracts.where((c) => c.customerId == customerId).toList();
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
                    'Log Service Ticket',
                    style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    initialValue: customerId,
                    isExpanded: true,
                    decoration: const InputDecoration(labelText: 'Customer *'),
                    items: _customers
                        .map(
                          (c) => DropdownMenuItem(
                            value: c.id,
                            child: Text(
                              c.name,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (v) {
                      if (v != null) {
                        setModalState(() {
                          customerId = v;
                          amcId = null;
                        });
                      }
                    },
                  ),
                  if (customerAmcs.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String?>(
                      initialValue: amcId,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        labelText: 'Linked AMC (Optional)',
                      ),
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('None / Ad-hoc Support'),
                        ),
                        ...customerAmcs.map(
                          (a) => DropdownMenuItem<String?>(
                            value: a.id,
                            child: Text(
                              '${a.contractNumber} — ${a.title}',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                      onChanged: (v) => setModalState(() => amcId = v),
                    ),
                  ],
                  const SizedBox(height: 10),
                  TextField(
                    controller: titleCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Issue Title *',
                      hintText: 'e.g. UHF Reader not reading tags',
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Issue Description',
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: priority,
                          decoration:
                              const InputDecoration(labelText: 'Priority'),
                          items: const [
                            DropdownMenuItem(value: 'LOW', child: Text('LOW')),
                            DropdownMenuItem(
                              value: 'MEDIUM',
                              child: Text('MEDIUM'),
                            ),
                            DropdownMenuItem(
                              value: 'HIGH',
                              child: Text('HIGH'),
                            ),
                            DropdownMenuItem(
                              value: 'CRITICAL',
                              child: Text('CRITICAL'),
                            ),
                          ],
                          onChanged: (v) {
                            if (v != null) setModalState(() => priority = v);
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: DropdownButtonFormField<String?>(
                          initialValue: assignedTo,
                          isExpanded: true,
                          decoration:
                              const InputDecoration(labelText: 'Engineer'),
                          items: [
                            const DropdownMenuItem<String?>(
                              value: null,
                              child: Text('Unassigned'),
                            ),
                            ..._staffNames.map(
                              (s) => DropdownMenuItem<String?>(
                                value: s,
                                child: Text(s, overflow: TextOverflow.ellipsis),
                              ),
                            ),
                          ],
                          onChanged: (v) => setModalState(() => assignedTo = v),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  FilledButton(
                    onPressed: submitting
                        ? null
                        : () async {
                            if (titleCtrl.text.trim().isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Enter an Issue Title.'),
                                ),
                              );
                              return;
                            }
                            setModalState(() => submitting = true);
                            try {
                              await widget.erpRepository.createServiceTicket(
                                customerId: customerId,
                                amcId: amcId,
                                issueTitle: titleCtrl.text.trim(),
                                description: descCtrl.text.trim().isEmpty
                                    ? titleCtrl.text.trim()
                                    : descCtrl.text.trim(),
                                priority: priority,
                                assignedTo: assignedTo,
                              );
                              if (ctx.mounted) Navigator.pop(ctx);
                              await _load();
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Service ticket logged!'),
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
                        : const Text('Log Ticket'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _showUpdateTicketSheet(ServiceTicketItem ticket) async {
    String status = ticket.status;
    String priority = ticket.priority;
    String? assignedTo = ticket.assignedTo;
    final resCtrl = TextEditingController(text: ticket.resolutionNotes ?? '');
    bool submitting = false;

    final engineerOptions = <String>{
      ..._staffNames,
      if (assignedTo != null && assignedTo.isNotEmpty) assignedTo,
    }.toList();

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
                Text(
                  'Update ${ticket.ticketNumber}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: status,
                        decoration: const InputDecoration(labelText: 'Status'),
                        items: const [
                          DropdownMenuItem(value: 'OPEN', child: Text('OPEN')),
                          DropdownMenuItem(
                            value: 'IN_PROGRESS',
                            child: Text('IN PROGRESS'),
                          ),
                          DropdownMenuItem(
                            value: 'RESOLVED',
                            child: Text('RESOLVED'),
                          ),
                          DropdownMenuItem(
                            value: 'CLOSED',
                            child: Text('CLOSED'),
                          ),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => status = v);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: priority,
                        decoration:
                            const InputDecoration(labelText: 'Priority'),
                        items: const [
                          DropdownMenuItem(value: 'LOW', child: Text('LOW')),
                          DropdownMenuItem(
                            value: 'MEDIUM',
                            child: Text('MEDIUM'),
                          ),
                          DropdownMenuItem(value: 'HIGH', child: Text('HIGH')),
                          DropdownMenuItem(
                            value: 'CRITICAL',
                            child: Text('CRITICAL'),
                          ),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => priority = v);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String?>(
                  initialValue: assignedTo,
                  isExpanded: true,
                  decoration:
                      const InputDecoration(labelText: 'Assigned Engineer'),
                  items: [
                    const DropdownMenuItem<String?>(
                      value: null,
                      child: Text('Unassigned'),
                    ),
                    ...engineerOptions.map(
                      (s) => DropdownMenuItem<String?>(
                        value: s,
                        child: Text(s, overflow: TextOverflow.ellipsis),
                      ),
                    ),
                  ],
                  onChanged: (v) => setModalState(() => assignedTo = v),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: resCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Resolution Summary',
                    hintText: 'Fix details, replaced spares, visit notes...',
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          setModalState(() => submitting = true);
                          try {
                            await widget.erpRepository.updateServiceTicket(
                              id: ticket.id,
                              status: status,
                              priority: priority,
                              assignedTo: assignedTo,
                              resolutionNotes: resCtrl.text.trim(),
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Ticket updated!'),
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
                  child: const Text('Save Ticket Update'),
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('AMC & Service Desk'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _tab == 0 ? () => _showAmcFormSheet() : _showCreateTicketSheet,
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: Icon(_tab == 0 ? Icons.verified_user_outlined : Icons.add_rounded),
        label: Text(_tab == 0 ? 'New AMC' : 'New Ticket'),
      ),
      body: Column(
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
                    label: Text('AMC Contracts (${_contracts.length})'),
                  ),
                  ButtonSegment(
                    value: 1,
                    label: Text('Service Tickets (${_tickets.length})'),
                  ),
                ],
                selected: {_tab},
                onSelectionChanged: (s) => setState(() => _tab = s.first),
              ),
            ),
          ),
          Expanded(
            child: _loading && _contracts.isEmpty && _tickets.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : _error != null && _contracts.isEmpty && _tickets.isEmpty
                    ? AppleEmptyState(
                        icon: Icons.error_outline_rounded,
                        title: 'Failed to load AMC data',
                        subtitle: _error!,
                        actionLabel: 'Retry',
                        onAction: _load,
                      )
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: _tab == 0 ? _buildContracts() : _buildTickets(),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildContracts() {
    if (_contracts.isEmpty) {
      return AppleEmptyState(
        icon: Icons.verified_user_outlined,
        title: 'No active AMC contracts',
        subtitle: 'Annual maintenance agreements and expiry alerts appear here.',
        actionLabel: 'Create AMC',
        onAction: () => _showAmcFormSheet(),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 92),
      itemCount: _contracts.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final c = _contracts[index];
        final days = c.daysRemaining;
        final isExpiring = days <= 30;
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
                    label: days < 0
                        ? 'EXPIRED'
                        : isExpiring
                            ? '$days Days Left'
                            : c.status,
                    background: days < 0
                        ? AppleColors.redSoft
                        : isExpiring
                            ? AppleColors.amberSoft
                            : AppleColors.greenSoft,
                    foreground: days < 0
                        ? AppleColors.red
                        : isExpiring
                            ? AppleColors.amber
                            : AppleColors.green,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${c.contractNumber} • ${c.title}',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppleColors.inkSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '${formatShortDate(c.startDate)} → ${formatShortDate(c.endDate)}\n${c.visitFrequency.replaceAll('_', ' ')} • ${formatInr(c.contractValue)}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppleColors.inkMuted,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.call_outlined, color: AppleColors.blue),
                    onPressed: () async {
                      final uri = Uri(scheme: 'tel', path: c.customerPhone);
                      if (await canLaunchUrl(uri)) await launchUrl(uri);
                    },
                  ),
                  if (widget.user.isFullAdmin) ...[
                    IconButton(
                      visualDensity: VisualDensity.compact,
                      tooltip: 'Edit AMC (Super Admin)',
                      icon: const Icon(
                        Icons.edit_outlined,
                        size: 19,
                        color: AppleColors.blue,
                      ),
                      onPressed: () => _showAmcFormSheet(existing: c),
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
                        label: 'AMC "${c.contractNumber}"',
                        onDelete: () async {
                          await widget.erpRepository.deleteRecord(
                            entity: 'amc',
                            id: c.id,
                          );
                          await _load();
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTickets() {
    if (_tickets.isEmpty) {
      return AppleEmptyState(
        icon: Icons.build_circle_outlined,
        title: 'No service tickets',
        subtitle: 'On-site RFID support complaints and RMA tickets appear here.',
        actionLabel: 'Log Ticket',
        onAction: _showCreateTicketSheet,
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 92),
      itemCount: _tickets.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final t = _tickets[index];
        final isResolved = t.status == 'RESOLVED' || t.status == 'CLOSED';
        return AppleCard(
          padding: const EdgeInsets.all(15),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '${t.ticketNumber} • ${t.customerName}',
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  AppleBadge(
                    label: t.status.replaceAll('_', ' '),
                    background: isResolved
                        ? AppleColors.greenSoft
                        : t.status == 'IN_PROGRESS'
                            ? AppleColors.amberSoft
                            : AppleColors.redSoft,
                    foreground: isResolved
                        ? AppleColors.green
                        : t.status == 'IN_PROGRESS'
                            ? AppleColors.amber
                            : AppleColors.red,
                  ),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    tooltip: 'Update ticket status',
                    icon: const Icon(
                      Icons.build_outlined,
                      size: 18,
                      color: AppleColors.blue,
                    ),
                    onPressed: () => _showUpdateTicketSheet(t),
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
                        label: 'ticket "${t.ticketNumber}"',
                        onDelete: () async {
                          await widget.erpRepository.deleteRecord(
                            entity: 'ticket',
                            id: t.id,
                          );
                          await _load();
                        },
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                t.issueTitle,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                t.description,
                style: const TextStyle(
                  fontSize: 12.5,
                  color: AppleColors.inkSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  AppleBadge(
                    label: 'Priority: ${t.priority}',
                    background: AppleColors.redSoft,
                    foreground: AppleColors.red,
                  ),
                  AppleBadge(
                    label: 'Engineer: ${t.assignedTo ?? "Unassigned"}',
                    background: AppleColors.canvas,
                    foreground: AppleColors.inkSecondary,
                  ),
                ],
              ),
              if (t.resolutionNotes != null && t.resolutionNotes!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'Resolution: ${t.resolutionNotes}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppleColors.green,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
