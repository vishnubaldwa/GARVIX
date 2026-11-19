import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class AmcScreen extends StatefulWidget {
  const AmcScreen({super.key, required this.erpRepository});

  final ErpRepository erpRepository;

  @override
  State<AmcScreen> createState() => _AmcScreenState();
}

class _AmcScreenState extends State<AmcScreen> {
  int _tab = 0;
  List<AmcContractItem> _contracts = const [];
  List<ServiceTicketItem> _tickets = const [];
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
      final data = await widget.erpRepository.fetchAmcAndTickets();
      if (mounted) {
        setState(() {
          _contracts = data.contracts;
          _tickets = data.tickets;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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
      return const AppleEmptyState(
        icon: Icons.verified_user_outlined,
        title: 'No active AMC contracts',
        subtitle: 'Annual maintenance agreements and expiry alerts appear here.',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
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
                            : 'ACTIVE',
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
                      '${formatShortDate(c.startDate)} → ${formatShortDate(c.endDate)}\n${c.visitFrequency} • ${formatInr(c.contractValue)}',
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
      return const AppleEmptyState(
        icon: Icons.build_circle_outlined,
        title: 'No service tickets',
        subtitle: 'On-site RFID support complaints and RMA tickets appear here.',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
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
                        : AppleColors.amberSoft,
                    foreground:
                        isResolved ? AppleColors.green : AppleColors.amber,
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
