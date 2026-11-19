import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../domain/models/auth_user.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../view_models/team_view_model.dart';

class MoreAndTeamScreen extends StatefulWidget {
  const MoreAndTeamScreen({
    super.key,
    required this.user,
    required this.serverUrl,
    required this.viewModel,
    required this.onSignOut,
  });

  final AuthUser user;
  final String serverUrl;
  final TeamViewModel viewModel;
  final VoidCallback onSignOut;

  @override
  State<MoreAndTeamScreen> createState() => _MoreAndTeamScreenState();
}

class _MoreAndTeamScreenState extends State<MoreAndTeamScreen> {
  @override
  void initState() {
    super.initState();
    if (widget.user.canManageTeam) {
      widget.viewModel.load();
    }
  }

  Future<void> _openWebAdmin() async {
    final uri = Uri.parse('${widget.serverUrl}/admin');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Team & Account'),
        actions: [
          if (widget.user.canManageTeam)
            IconButton(
              onPressed: widget.viewModel.load,
              icon: const Icon(Icons.refresh_rounded),
            ),
        ],
      ),
      body: ListenableBuilder(
        listenable: widget.viewModel,
        builder: (context, _) {
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
            children: [
              // User Profile Card
              AppleCard(
                padding: const EdgeInsets.all(18),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: AppleColors.inkPrimary,
                      child: Text(
                        widget.user.initials,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.user.name,
                            style: const TextStyle(
                              fontSize: 16.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.user.email,
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: AppleColors.inkSecondary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          AppleBadge(label: widget.user.role),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Open Full Web ERP Action
              AppleCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                onTap: _openWebAdmin,
                child: const ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.open_in_browser_rounded, color: AppleColors.blue),
                  title: Text(
                    'Open Full Web ERP',
                    style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    '1-Click CA GST Return, Delivery Challans & Settings',
                    style: TextStyle(fontSize: 11.5, color: AppleColors.inkSecondary),
                  ),
                  trailing: Icon(Icons.chevron_right_rounded),
                ),
              ),

              if (widget.user.canManageTeam) ...[
                const SizedBox(height: 22),
                Text(
                  'Team & Staff (${widget.viewModel.employees.length})',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 8),
                if (widget.viewModel.isLoading && widget.viewModel.employees.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else
                  AppleCard(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Column(
                      children: [
                        for (int i = 0; i < widget.viewModel.employees.length; i++) ...[
                          if (i > 0)
                            const Divider(height: 1, indent: 16, endIndent: 16),
                          ListTile(
                            title: Text(
                              widget.viewModel.employees[i].name,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(
                              '${widget.viewModel.employees[i].email} • ${widget.viewModel.employees[i].role}',
                              style: const TextStyle(fontSize: 11.5),
                            ),
                            trailing: widget.viewModel.employees[i].email ==
                                    widget.user.email
                                ? const AppleBadge(
                                    label: 'YOU',
                                    background: AppleColors.greenSoft,
                                    foreground: AppleColors.green,
                                  )
                                : Switch.adaptive(
                                    value: widget.viewModel.employees[i].isActive,
                                    onChanged: (_) => widget.viewModel
                                        .toggleActive(widget.viewModel.employees[i]),
                                  ),
                          ),
                        ],
                      ],
                    ),
                  ),

                const SizedBox(height: 22),
                Text(
                  'Roles & Permissions (${widget.viewModel.roles.length})',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 8),
                for (final r in widget.viewModel.roles) ...[
                  AppleCard(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              r.displayName,
                              style: const TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            AppleBadge(label: '${r.permissions.length} perms'),
                          ],
                        ),
                        if (r.description != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            r.description!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppleColors.inkSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ],

              const SizedBox(height: 24),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppleColors.red,
                  side: BorderSide(color: AppleColors.red.withValues(alpha: 0.3)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: widget.onSignOut,
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: const Text('Sign Out of GARVIX ERP'),
              ),
            ],
          );
        },
      ),
    );
  }
}
