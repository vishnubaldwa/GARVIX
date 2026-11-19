import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/crm_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/leads_view_model.dart';

class LeadsScreen extends StatefulWidget {
  const LeadsScreen({
    super.key,
    required this.viewModel,
    required this.user,
    required this.erpRepository,
  });

  final LeadsViewModel viewModel;
  final AuthUser user;
  final ErpRepository erpRepository;

  @override
  State<LeadsScreen> createState() => _LeadsScreenState();
}

class _LeadsScreenState extends State<LeadsScreen> {
  static const _statuses = ['ALL', 'NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'WON', 'LOST'];

  @override
  void initState() {
    super.initState();
    widget.viewModel.load();
  }

  Future<void> _launch(Uri uri) async {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _pickStatus(LeadItem lead) async {
    final chosen = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Update Status — ${lead.name}',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
            for (final status in _statuses.where((s) => s != 'ALL'))
              ListTile(
                title: Text(status.replaceAll('_', ' ')),
                trailing: lead.status == status
                    ? const Icon(Icons.check_rounded, color: AppleColors.blue)
                    : null,
                onTap: () => Navigator.pop(ctx, status),
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (chosen != null && chosen != lead.status) {
      try {
        await widget.viewModel.updateStatus(lead.id, chosen);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Updated ${lead.name} to $chosen')),
        );
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Update failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leads & CRM'),
        actions: [
          IconButton(
            onPressed: () => widget.viewModel.load(),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: ListenableBuilder(
        listenable: widget.viewModel,
        builder: (context, _) {
          return Column(
            children: [
              SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  children: [
                    for (final s in _statuses) ...[
                      ChoiceChip(
                        label: Text(s.replaceAll('_', ' ')),
                        selected: widget.viewModel.statusFilter == s,
                        onSelected: (_) => widget.viewModel.load(status: s),
                      ),
                      const SizedBox(width: 8),
                    ],
                  ],
                ),
              ),
              Expanded(
                child: widget.viewModel.isLoading && widget.viewModel.leads.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : widget.viewModel.error != null && widget.viewModel.leads.isEmpty
                        ? AppleEmptyState(
                            icon: Icons.error_outline_rounded,
                            title: 'Could not load leads',
                            subtitle: widget.viewModel.error!,
                            actionLabel: 'Retry',
                            onAction: widget.viewModel.load,
                          )
                        : widget.viewModel.leads.isEmpty
                            ? const AppleEmptyState(
                                icon: Icons.inbox_outlined,
                                title: 'No leads found',
                                subtitle: 'Website enquiries from garvix.in appear here automatically.',
                              )
                            : RefreshIndicator(
                                onRefresh: widget.viewModel.load,
                                child: ListView.separated(
                                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
                                  itemCount: widget.viewModel.leads.length,
                                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                                  itemBuilder: (context, index) {
                                    final lead = widget.viewModel.leads[index];
                                    return AppleCard(
                                      padding: const EdgeInsets.all(15),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  lead.name,
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                              ),
                                              GestureDetector(
                                                onTap: () => _pickStatus(lead),
                                                child: AppleBadge(
                                                  label: lead.status.replaceAll('_', ' '),
                                                  background: lead.status == 'WON'
                                                      ? AppleColors.greenSoft
                                                      : lead.status == 'NEW'
                                                          ? AppleColors.blueSoft
                                                          : AppleColors.amberSoft,
                                                  foreground: lead.status == 'WON'
                                                      ? AppleColors.green
                                                      : lead.status == 'NEW'
                                                          ? AppleColors.blue
                                                          : AppleColors.amber,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${lead.company ?? "Individual"} • ${lead.solution}',
                                            style: const TextStyle(
                                              fontSize: 12.5,
                                              fontWeight: FontWeight.w500,
                                              color: AppleColors.inkSecondary,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            lead.message,
                                            maxLines: 3,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontSize: 12.5,
                                              color: AppleColors.inkPrimary,
                                            ),
                                          ),
                                          const SizedBox(height: 12),
                                          Row(
                                            children: [
                                              OutlinedButton.icon(
                                                onPressed: () => _launch(
                                                  Uri(scheme: 'tel', path: lead.phone),
                                                ),
                                                icon: const Icon(Icons.call_outlined, size: 15),
                                                label: const Text('Call'),
                                              ),
                                              const SizedBox(width: 8),
                                              OutlinedButton.icon(
                                                onPressed: () => _launch(
                                                  Uri(scheme: 'mailto', path: lead.email),
                                                ),
                                                icon: const Icon(Icons.mail_outline_rounded, size: 15),
                                                label: const Text('Email'),
                                              ),
                                              const Spacer(),
                                              Text(
                                                formatShortDate(lead.createdAt),
                                                style: const TextStyle(
                                                  fontSize: 11,
                                                  color: AppleColors.inkMuted,
                                                ),
                                              ),
                                              if (widget.user.isFullAdmin) ...[
                                                const SizedBox(width: 4),
                                                IconButton(
                                                  visualDensity:
                                                      VisualDensity.compact,
                                                  tooltip:
                                                      'Delete permanently',
                                                  icon: const Icon(
                                                    Icons
                                                        .delete_outline_rounded,
                                                    size: 19,
                                                    color: AppleColors.red,
                                                  ),
                                                  onPressed: () =>
                                                      confirmSuperAdminDelete(
                                                    context,
                                                    label:
                                                        'lead "${lead.name}"',
                                                    onDelete: () async {
                                                      await widget.erpRepository
                                                          .deleteRecord(
                                                        entity: 'lead',
                                                        id: lead.id,
                                                      );
                                                      await widget.viewModel
                                                          .load();
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
                                ),
                              ),
              ),
            ],
          );
        },
      ),
    );
  }
}
