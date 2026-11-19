import 'package:material_ui/material_ui.dart';

import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/crm_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/team_view_model.dart';

class TeamManagementScreen extends StatefulWidget {
  const TeamManagementScreen({
    super.key,
    required this.viewModel,
    required this.currentUser,
  });

  final TeamViewModel viewModel;
  final AuthUser currentUser;

  @override
  State<TeamManagementScreen> createState() => _TeamManagementScreenState();
}

class _TeamManagementScreenState extends State<TeamManagementScreen> {
  @override
  void initState() {
    super.initState();
    widget.viewModel.loadAll();
  }

  List<String> get _availableRoleCodes {
    if (widget.viewModel.roles.isNotEmpty) {
      return widget.viewModel.roles.map((r) => r.name).toList();
    }
    return const [
      'SUPER_ADMIN',
      'SALES',
      'ACCOUNTS',
      'SERVICE',
      'DOCUMENT_VIEWER',
    ];
  }

  String _roleLabel(String code) {
    for (final r in widget.viewModel.roles) {
      if (r.name == code) return r.displayName;
    }
    return code;
  }

  Future<void> _showAddEmployeeSheet() async {
    final nameCtrl = TextEditingController();
    final usernameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final passCtrl = TextEditingController();
    final roleOptions = _availableRoleCodes;
    String selectedRole =
        roleOptions.contains('SALES') ? 'SALES' : roleOptions.first;
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
                  'Add Staff Member',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Employee permissions are enforced live from their assigned Role.',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppleColors.inkSecondary,
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Full Name *'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: usernameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Username *',
                    hintText: 'rahul → rahul@garvix.in',
                    suffixText: '@garvix.in',
                  ),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: selectedRole,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Assigned Role *'),
                  items: roleOptions
                      .map(
                        (code) => DropdownMenuItem(
                          value: code,
                          child: Text(
                            _roleLabel(code),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setModalState(() => selectedRole = v);
                  },
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number (Optional)',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: passCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Initial Password (min 6 chars) *',
                  ),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          if (nameCtrl.text.trim().isEmpty ||
                              usernameCtrl.text.trim().isEmpty ||
                              passCtrl.text.length < 6) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Fill Name, Username and Password (min 6 chars).',
                                ),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            await widget.viewModel.createEmployee(
                              name: nameCtrl.text.trim(),
                              username: usernameCtrl.text.trim(),
                              role: selectedRole,
                              phone: phoneCtrl.text.trim().isEmpty
                                  ? null
                                  : phoneCtrl.text.trim(),
                              password: passCtrl.text,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Staff account created!'),
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
                      : const Text('Create Staff Account'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showEditEmployeeSheet(EmployeeItem emp) async {
    final nameCtrl = TextEditingController(text: emp.name);
    final phoneCtrl = TextEditingController(text: emp.phone ?? '');
    final roleOptions = {..._availableRoleCodes, emp.role}.toList();
    String selectedRole = emp.role;
    bool isActive = emp.isActive;
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
                Text(
                  'Edit ${emp.name}',
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  emp.email,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppleColors.inkMuted,
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Full Name'),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: selectedRole,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Assigned Role'),
                  items: roleOptions
                      .map(
                        (code) => DropdownMenuItem(
                          value: code,
                          child: Text(
                            _roleLabel(code),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setModalState(() => selectedRole = v);
                  },
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Phone Number'),
                ),
                const SizedBox(height: 8),
                SwitchListTile.adaptive(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Account Active'),
                  value: isActive,
                  onChanged: emp.email == widget.currentUser.email
                      ? null
                      : (v) => setModalState(() => isActive = v),
                ),
                const SizedBox(height: 14),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          setModalState(() => submitting = true);
                          try {
                            await widget.viewModel.updateEmployee(
                              id: emp.id,
                              name: nameCtrl.text.trim(),
                              role: selectedRole,
                              phone: phoneCtrl.text.trim().isEmpty
                                  ? null
                                  : phoneCtrl.text.trim(),
                              isActive: isActive,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Staff profile updated.'),
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
                  child: const Text('Save Changes'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showResetPasswordDialog(EmployeeItem emp) async {
    final passCtrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Reset Password — ${emp.name}'),
        content: TextField(
          controller: passCtrl,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'New Password (min 6 chars)',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
    if (ok == true && passCtrl.text.length >= 6) {
      try {
        await widget.viewModel.resetPassword(
          id: emp.id,
          newPassword: passCtrl.text,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Password reset for ${emp.name}.')),
          );
        }
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Team & Staff'),
        actions: [
          IconButton(
            onPressed: widget.viewModel.loadAll,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddEmployeeSheet,
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: const Text('Add Staff'),
      ),
      body: ListenableBuilder(
        listenable: widget.viewModel,
        builder: (context, _) {
          if (widget.viewModel.isLoading &&
              widget.viewModel.employees.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          final employees = widget.viewModel.employees;
          if (employees.isEmpty) {
            return AppleEmptyState(
              icon: Icons.groups_outlined,
              title: 'No staff accounts found',
              subtitle: 'Add directors, sales, accounts, or service engineers.',
              actionLabel: 'Add Staff',
              onAction: _showAddEmployeeSheet,
            );
          }

          return RefreshIndicator(
            onRefresh: widget.viewModel.loadAll,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 92),
              itemCount: employees.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final emp = employees[index];
                final isSelf = emp.email == widget.currentUser.email;
                return AppleCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: emp.isActive
                                ? AppleColors.blueSoft
                                : AppleColors.canvas,
                            child: Text(
                              emp.name.isNotEmpty
                                  ? emp.name[0].toUpperCase()
                                  : 'U',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: emp.isActive
                                    ? AppleColors.blue
                                    : AppleColors.inkMuted,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  emp.name,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  emp.email,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppleColors.inkMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Switch.adaptive(
                            value: emp.isActive,
                            onChanged: isSelf
                                ? null
                                : (_) async {
                                    try {
                                      await widget.viewModel
                                          .toggleEmployee(emp);
                                    } catch (e) {
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(content: Text(e.toString())),
                                        );
                                      }
                                    }
                                  },
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          AppleBadge(label: _roleLabel(emp.role)),
                          if (emp.phone != null && emp.phone!.isNotEmpty)
                            AppleBadge(
                              label: emp.phone!,
                              background: AppleColors.canvas,
                              foreground: AppleColors.inkSecondary,
                            ),
                          if (!emp.isActive)
                            const AppleBadge(
                              label: 'DISABLED',
                              background: AppleColors.redSoft,
                              foreground: AppleColors.red,
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                            onPressed: () => _showEditEmployeeSheet(emp),
                            icon: const Icon(Icons.edit_outlined, size: 15),
                            label: const Text('Edit Role'),
                          ),
                          const SizedBox(width: 8),
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                            onPressed: () => _showResetPasswordDialog(emp),
                            icon: const Icon(Icons.key_outlined, size: 15),
                            label: const Text('Reset Pass'),
                          ),
                        ],
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
