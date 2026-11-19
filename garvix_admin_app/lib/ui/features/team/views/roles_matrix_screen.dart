import 'package:material_ui/material_ui.dart';

import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/crm_models.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/team_view_model.dart';

class RolesMatrixScreen extends StatefulWidget {
  const RolesMatrixScreen({
    super.key,
    required this.viewModel,
    required this.currentUser,
  });

  final TeamViewModel viewModel;
  final AuthUser currentUser;

  @override
  State<RolesMatrixScreen> createState() => _RolesMatrixScreenState();
}

class _RolesMatrixScreenState extends State<RolesMatrixScreen> {
  @override
  void initState() {
    super.initState();
    widget.viewModel.loadAll();
  }

  Future<void> _showCreateRoleSheet() async {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final selectedPerms = <String>{'CAN_VIEW_LEADS', 'CAN_CREATE_CLIENT'};
    bool submitting = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.82,
          maxChildSize: 0.94,
          minChildSize: 0.5,
          builder: (_, scrollCtrl) => Padding(
            padding: EdgeInsets.fromLTRB(
              20,
              16,
              20,
              MediaQuery.of(ctx).viewInsets.bottom + 20,
            ),
            child: ListView(
              controller: scrollCtrl,
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
                  'Create Custom Role',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Role Display Name *',
                    hintText: 'e.g. Warehouse Manager / Field Sales',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description'),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Select Permitted Actions',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                for (final perm in kAllPermissions)
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      perm.label,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      perm.description,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppleColors.inkMuted,
                      ),
                    ),
                    value: selectedPerms.contains(perm.code),
                    onChanged: (v) {
                      setModalState(() {
                        if (v) {
                          selectedPerms.add(perm.code);
                        } else {
                          selectedPerms.remove(perm.code);
                        }
                      });
                    },
                  ),
                const SizedBox(height: 14),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          if (nameCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Enter a Role Display Name.'),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            await widget.viewModel.createRole(
                              displayName: nameCtrl.text.trim(),
                              description: descCtrl.text.trim().isEmpty
                                  ? null
                                  : descCtrl.text.trim(),
                              permissions: selectedPerms.toList(),
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Custom role created!'),
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
                  child: const Text('Create Role'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openRoleEditor(RoleItem role) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => _RolePermissionEditorScreen(
          role: role,
          viewModel: widget.viewModel,
          currentUser: widget.currentUser,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Roles & Permissions'),
        actions: [
          IconButton(
            onPressed: widget.viewModel.loadAll,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateRoleSheet,
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_moderator_outlined),
        label: const Text('New Role'),
      ),
      body: ListenableBuilder(
        listenable: widget.viewModel,
        builder: (context, _) {
          if (widget.viewModel.isLoading && widget.viewModel.roles.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          final roles = widget.viewModel.roles;
          if (roles.isEmpty) {
            return const AppleEmptyState(
              icon: Icons.admin_panel_settings_outlined,
              title: 'No roles loaded',
              subtitle: 'Tap refresh to load role permission matrix.',
            );
          }

          return RefreshIndicator(
            onRefresh: widget.viewModel.loadAll,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 92),
              itemCount: roles.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final r = roles[index];
                final isSuper = r.name.toUpperCase() == 'SUPER_ADMIN';
                return AppleCard(
                  padding: const EdgeInsets.all(15),
                  onTap: () => _openRoleEditor(r),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    r.displayName,
                                    style: const TextStyle(
                                      fontSize: 15.5,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                AppleBadge(
                                  label: isSuper
                                      ? 'ALL ACCESS'
                                      : '${r.permissions.length}/12 perms',
                                  background: isSuper
                                      ? AppleColors.greenSoft
                                      : AppleColors.blueSoft,
                                  foreground: isSuper
                                      ? AppleColors.green
                                      : AppleColors.blue,
                                ),
                              ],
                            ),
                            if (r.description != null &&
                                r.description!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                r.description!,
                                style: const TextStyle(
                                  fontSize: 12.5,
                                  color: AppleColors.inkSecondary,
                                ),
                              ),
                            ],
                            const SizedBox(height: 6),
                            Text(
                              'Code: ${r.name}${r.isSystem ? " • System Role" : " • Custom Role"}',
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: AppleColors.inkMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AppleColors.inkMuted,
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _RolePermissionEditorScreen extends StatefulWidget {
  const _RolePermissionEditorScreen({
    required this.role,
    required this.viewModel,
    required this.currentUser,
  });

  final RoleItem role;
  final TeamViewModel viewModel;
  final AuthUser currentUser;

  @override
  State<_RolePermissionEditorScreen> createState() =>
      _RolePermissionEditorScreenState();
}

class _RolePermissionEditorScreenState
    extends State<_RolePermissionEditorScreen> {
  late Set<String> _selected;
  bool _saving = false;

  bool get _isSuperAdmin => widget.role.name.toUpperCase() == 'SUPER_ADMIN';

  @override
  void initState() {
    super.initState();
    _selected = widget.role.permissions.toSet();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await widget.viewModel.updateRolePermissions(
        id: widget.role.id,
        permissions: _selected.toList(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Permissions updated for ${widget.role.displayName}!',
            ),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _deleteRole() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Custom Role?'),
        content: Text(
          'Delete "${widget.role.displayName}" permanently? No employee should be assigned to it.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppleColors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok == true) {
      try {
        await widget.viewModel.deleteRole(widget.role.id);
        if (mounted) Navigator.pop(context);
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context)
              .showSnackBar(SnackBar(content: Text(e.toString())));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = ['SALES', 'FINANCE', 'OPERATIONS', 'TEAM', 'SETTINGS'];
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.role.displayName),
        actions: [
          if (widget.currentUser.isFullAdmin && !widget.role.isSystem)
            IconButton(
              onPressed: _deleteRole,
              icon: const Icon(Icons.delete_outline_rounded, color: AppleColors.red),
            ),
        ],
      ),
      bottomNavigationBar: _isSuperAdmin
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: FilledButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text('Save Permissions (${_selected.length}/12)'),
                ),
              ),
            ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        children: [
          if (_isSuperAdmin)
            const Padding(
              padding: EdgeInsets.only(bottom: 14),
              child: AppleCard(
                child: Text(
                  'Super Admin always has unrestricted access to all 12 modules and cannot be restricted.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppleColors.inkSecondary,
                  ),
                ),
              ),
            ),
          for (final cat in categories) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 10, 4, 6),
              child: Text(
                cat,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.7,
                  color: AppleColors.inkMuted,
                ),
              ),
            ),
            AppleCard(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Column(
                children: [
                  for (final perm in kAllPermissions
                      .where((p) => p.category == cat)) ...[
                    SwitchListTile.adaptive(
                      title: Text(
                        perm.label,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        perm.description,
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: AppleColors.inkMuted,
                        ),
                      ),
                      value: _isSuperAdmin || _selected.contains(perm.code),
                      onChanged: _isSuperAdmin
                          ? null
                          : (val) {
                              setState(() {
                                if (val) {
                                  _selected.add(perm.code);
                                } else {
                                  _selected.remove(perm.code);
                                }
                              });
                            },
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
