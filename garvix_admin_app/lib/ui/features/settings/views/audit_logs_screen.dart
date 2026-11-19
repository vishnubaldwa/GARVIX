import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class AuditLogsScreen extends StatefulWidget {
  const AuditLogsScreen({super.key, required this.erpRepository});

  final ErpRepository erpRepository;

  @override
  State<AuditLogsScreen> createState() => _AuditLogsScreenState();
}

class _AuditLogsScreenState extends State<AuditLogsScreen> {
  List<AuditLogItem> _logs = const [];
  bool _loading = true;
  String? _error;
  String _query = '';

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
      final list = await widget.erpRepository.fetchAuditLogs();
      if (mounted) setState(() => _logs = list);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final filtered = _logs.where((l) {
      if (q.isEmpty) return true;
      return l.username.toLowerCase().contains(q) ||
          l.action.toLowerCase().contains(q) ||
          l.entityType.toLowerCase().contains(q) ||
          l.details.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Security Audit Logs'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Filter by user, action, invoice, vault...',
                prefixIcon: Icon(Icons.search_rounded, size: 20),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          Expanded(
            child: _loading && _logs.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : _error != null && _logs.isEmpty
                    ? AppleEmptyState(
                        icon: Icons.security_outlined,
                        title: 'Unable to load audit logs',
                        subtitle: _error!,
                        actionLabel: 'Retry',
                        onAction: _load,
                      )
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: filtered.isEmpty
                            ? const AppleEmptyState(
                                icon: Icons.history_rounded,
                                title: 'No audit events',
                                subtitle: 'Activity logs will appear here.',
                              )
                            : ListView.separated(
                                padding:
                                    const EdgeInsets.fromLTRB(16, 6, 16, 32),
                                itemCount: filtered.length,
                                separatorBuilder: (_, _) =>
                                    const SizedBox(height: 8),
                                itemBuilder: (context, index) {
                                  final log = filtered[index];
                                  return AppleCard(
                                    padding: const EdgeInsets.all(13),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            AppleBadge(
                                              label: log.action,
                                              background: log.action == 'DELETE'
                                                  ? AppleColors.redSoft
                                                  : log.action == 'CREATE'
                                                      ? AppleColors.blueSoft
                                                      : AppleColors.greenSoft,
                                              foreground: log.action == 'DELETE'
                                                  ? AppleColors.red
                                                  : log.action == 'CREATE'
                                                      ? AppleColors.blue
                                                      : AppleColors.green,
                                            ),
                                            const SizedBox(width: 6),
                                            AppleBadge(
                                              label: log.entityType,
                                              background: AppleColors.canvas,
                                              foreground:
                                                  AppleColors.inkSecondary,
                                            ),
                                            const Spacer(),
                                            Text(
                                              formatDateTime(log.createdAt),
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: AppleColors.inkMuted,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 7),
                                        Text(
                                          log.details,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            color: AppleColors.inkPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'By ${log.username}',
                                          style: const TextStyle(
                                            fontSize: 11.5,
                                            color: AppleColors.inkMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                      ),
          ),
        ],
      ),
    );
  }
}
