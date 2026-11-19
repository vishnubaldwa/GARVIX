import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({
    super.key,
    required this.user,
    required this.serverUrl,
    required this.erpRepository,
    required this.onSignOut,
  });

  final AuthUser user;
  final String serverUrl;
  final ErpRepository erpRepository;
  final VoidCallback onSignOut;

  Future<void> _showChangePasswordSheet(BuildContext context) async {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();
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
                  'Change Password',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: currentCtrl,
                  obscureText: true,
                  decoration:
                      const InputDecoration(labelText: 'Current Password'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: newCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'New Password (min 6 chars)',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: confirmCtrl,
                  obscureText: true,
                  decoration:
                      const InputDecoration(labelText: 'Confirm New Password'),
                ),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          if (newCtrl.text.length < 6) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'New password must be at least 6 characters.',
                                ),
                              ),
                            );
                            return;
                          }
                          if (newCtrl.text != confirmCtrl.text) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Passwords do not match.'),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            await erpRepository.changePassword(
                              currentPassword: currentCtrl.text,
                              newPassword: newCtrl.text,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Password updated!'),
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
                      : const Text('Update Password'),
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
    final grantedDefs = kAllPermissions
        .where((p) => user.isFullAdmin || user.hasPermission(p.code))
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Account & Security')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 36),
        children: [
          AppleCard(
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppleColors.blueSoft,
                  child: Text(
                    user.initials,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppleColors.blue,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        user.email,
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: AppleColors.inkSecondary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      AppleBadge(
                        label: user.role,
                        background: user.isFullAdmin
                            ? AppleColors.greenSoft
                            : AppleColors.blueSoft,
                        foreground: user.isFullAdmin
                            ? AppleColors.green
                            : AppleColors.blue,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          AppleCard(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(
                    Icons.lock_reset_rounded,
                    color: AppleColors.blue,
                  ),
                  title: const Text(
                    'Change Password',
                    style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                  ),
                  subtitle: const Text(
                    'Update your personal ERP login password',
                    style: TextStyle(fontSize: 12, color: AppleColors.inkMuted),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => _showChangePasswordSheet(context),
                ),
                const Divider(height: 1, indent: 16, endIndent: 16),
                ListTile(
                  leading: const Icon(
                    Icons.dns_outlined,
                    color: AppleColors.inkSecondary,
                  ),
                  title: const Text(
                    'Connected Server',
                    style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    '$serverUrl • GARVIX ERP v2.6',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppleColors.inkMuted,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              'ACTIVE ROLE PERMISSIONS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.7,
                color: AppleColors.inkMuted,
              ),
            ),
          ),
          const SizedBox(height: 8),
          AppleCard(
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: grantedDefs
                  .map(
                    (p) => AppleBadge(
                      label: p.label,
                      background: AppleColors.canvas,
                      foreground: AppleColors.inkPrimary,
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppleColors.red,
              side: const BorderSide(color: Color(0x33BE123C)),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: onSignOut,
            icon: const Icon(Icons.logout_rounded, size: 18),
            label: const Text('Sign Out of GARVIX ERP'),
          ),
        ],
      ),
    );
  }
}
