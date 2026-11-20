import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class WebsiteClientsScreen extends StatefulWidget {
  const WebsiteClientsScreen({
    super.key,
    required this.erpRepository,
    required this.user,
  });

  final ErpRepository erpRepository;
  final AuthUser user;

  @override
  State<WebsiteClientsScreen> createState() => _WebsiteClientsScreenState();
}

class _WebsiteClientsScreenState extends State<WebsiteClientsScreen> {
  List<WebsiteClientItem> _clients = const [];
  String _baseUrl = 'https://garvix.in';
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
      final base = await widget.erpRepository.getBaseUrl();
      final list = await widget.erpRepository.fetchWebsiteClients();
      if (mounted) {
        setState(() {
          _baseUrl = base;
          _clients = list;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleVisibility(WebsiteClientItem c) async {
    final next = !c.isVisible;
    try {
      await widget.erpRepository.updateWebsiteClient(
        id: c.id,
        isVisible: next,
      );
      await _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              next
                  ? '"${c.name}" is now visible on garvix.in.'
                  : '"${c.name}" hidden from homepage.',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _showFormSheet({WebsiteClientItem? existing}) async {
    final isEdit = existing != null;
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final industryCtrl = TextEditingController(text: existing?.industry ?? '');
    final urlCtrl = TextEditingController(text: existing?.websiteUrl ?? '');
    final orderCtrl = TextEditingController(
      text: (existing?.displayOrder ?? 0).toString(),
    );
    bool isVisible = existing?.isVisible ?? true;
    File? pickedLogo;
    bool removeLogo = false;
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
                  isEdit ? 'Edit Website Client' : 'Add Website Client',
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Shown in the "Our Clients" section on garvix.in homepage.',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppleColors.inkSecondary,
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Client / Brand Name *',
                    hintText: 'e.g. Unit Nine Private Limited',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: industryCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Industry / Solution Tag (Optional)',
                    hintText: 'e.g. Retail Software, Jewellery RFID',
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: urlCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Website URL (Optional)',
                          hintText: 'https://...',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: orderCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Order'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppleColors.canvas,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppleColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (pickedLogo != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.file(
                              pickedLogo!,
                              height: 60,
                              fit: BoxFit.contain,
                            ),
                          ),
                        )
                      else if (isEdit &&
                          existing.logoUrl != null &&
                          !removeLogo)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Image.network(
                                '$_baseUrl${existing.logoUrl}',
                                height: 44,
                                width: 90,
                                fit: BoxFit.contain,
                                errorBuilder: (_, _, _) =>
                                    const Icon(Icons.image_outlined),
                              ),
                              const Spacer(),
                              TextButton(
                                onPressed: () =>
                                    setModalState(() => removeLogo = true),
                                child: const Text(
                                  'Remove',
                                  style: TextStyle(color: AppleColors.red),
                                ),
                              ),
                            ],
                          ),
                        ),
                      OutlinedButton.icon(
                        onPressed: () async {
                          final picked = await FilePicker.pickFiles(
                            type: FileType.image,
                          );
                          if (picked.isNotEmpty &&
                              picked.first.path != null &&
                              picked.first.path!.isNotEmpty) {
                            setModalState(() {
                              pickedLogo = File(picked.first.path!);
                              removeLogo = false;
                            });
                          }
                        },
                        icon: const Icon(Icons.upload_outlined, size: 17),
                        label: Text(
                          pickedLogo != null ||
                                  (isEdit && existing.hasLogo && !removeLogo)
                              ? 'Change Client Logo'
                              : 'Upload Client Logo (Optional)',
                        ),
                      ),
                    ],
                  ),
                ),
                SwitchListTile.adaptive(
                  contentPadding: EdgeInsets.zero,
                  title: const Text(
                    'Visible on garvix.in homepage',
                    style: TextStyle(fontSize: 13.5),
                  ),
                  value: isVisible,
                  onChanged: (v) => setModalState(() => isVisible = v),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          if (nameCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Enter Client / Brand Name.'),
                              ),
                            );
                            return;
                          }
                          setModalState(() => submitting = true);
                          try {
                            final order =
                                int.tryParse(orderCtrl.text.trim()) ?? 0;
                            if (isEdit) {
                              await widget.erpRepository.updateWebsiteClient(
                                id: existing.id,
                                name: nameCtrl.text.trim(),
                                industry: industryCtrl.text.trim(),
                                websiteUrl: urlCtrl.text.trim(),
                                displayOrder: order,
                                isVisible: isVisible,
                                logoFile: pickedLogo,
                                removeLogo: removeLogo,
                              );
                            } else {
                              await widget.erpRepository.createWebsiteClient(
                                name: nameCtrl.text.trim(),
                                industry: industryCtrl.text.trim().isEmpty
                                    ? null
                                    : industryCtrl.text.trim(),
                                websiteUrl: urlCtrl.text.trim().isEmpty
                                    ? null
                                    : urlCtrl.text.trim(),
                                displayOrder: order,
                                isVisible: isVisible,
                                logoFile: pickedLogo,
                              );
                            }
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isEdit
                                        ? 'Website client updated!'
                                        : 'Client published to garvix.in!',
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
                      : Text(isEdit ? 'Save Changes' : 'Add to Website'),
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
    final visibleCount = _clients.where((c) => c.isVisible).length;
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Website Clients'),
            Text(
              '$visibleCount live on garvix.in',
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w500,
                color: AppleColors.inkMuted,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showFormSheet(),
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Client'),
      ),
      body: _loading && _clients.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _clients.isEmpty
              ? AppleEmptyState(
                  icon: Icons.error_outline_rounded,
                  title: 'Failed to load website clients',
                  subtitle: _error!,
                  actionLabel: 'Retry',
                  onAction: _load,
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _clients.isEmpty
                      ? AppleEmptyState(
                          icon: Icons.language_rounded,
                          title: 'No website clients yet',
                          subtitle:
                              'Add your clients with logos to display the "Our Clients" section live on garvix.in.',
                          actionLabel: 'Add First Client',
                          onAction: () => _showFormSheet(),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 92),
                          itemCount: _clients.length,
                          separatorBuilder: (_, _) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final c = _clients[index];
                            return AppleCard(
                              padding: const EdgeInsets.all(14),
                              child: Row(
                                children: [
                                  Container(
                                    height: 48,
                                    width: 64,
                                    alignment: Alignment.center,
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: c.logoUrl != null
                                          ? Colors.white
                                          : AppleColors.inkPrimary,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: AppleColors.border,
                                      ),
                                    ),
                                    child: c.logoUrl != null
                                        ? Image.network(
                                            '$_baseUrl${c.logoUrl}',
                                            fit: BoxFit.contain,
                                            errorBuilder: (_, _, _) => Text(
                                              c.name.isNotEmpty
                                                  ? c.name[0].toUpperCase()
                                                  : 'C',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                          )
                                        : Text(
                                            c.name.length >= 2
                                                ? c.name
                                                    .substring(0, 2)
                                                    .toUpperCase()
                                                : c.name.toUpperCase(),
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          c.name,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        if (c.industry?.isNotEmpty ?? false)
                                          Text(
                                            c.industry!,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppleColors.inkSecondary,
                                            ),
                                          ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            AppleBadge(
                                              label: c.isVisible
                                                  ? 'LIVE ON SITE'
                                                  : 'HIDDEN',
                                              background: c.isVisible
                                                  ? AppleColors.greenSoft
                                                  : AppleColors.canvas,
                                              foreground: c.isVisible
                                                  ? AppleColors.green
                                                  : AppleColors.inkMuted,
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              'Order #${c.displayOrder}',
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: AppleColors.inkMuted,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    children: [
                                      Switch.adaptive(
                                        value: c.isVisible,
                                        onChanged: (_) => _toggleVisibility(c),
                                      ),
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            visualDensity:
                                                VisualDensity.compact,
                                            tooltip: 'Edit',
                                            icon: const Icon(
                                              Icons.edit_outlined,
                                              size: 18,
                                              color: AppleColors.blue,
                                            ),
                                            onPressed: () =>
                                                _showFormSheet(existing: c),
                                          ),
                                          if (widget.user.isFullAdmin)
                                            IconButton(
                                              visualDensity:
                                                  VisualDensity.compact,
                                              tooltip: 'Delete (Super Admin)',
                                              icon: const Icon(
                                                Icons.delete_outline_rounded,
                                                size: 18,
                                                color: AppleColors.red,
                                              ),
                                              onPressed: () =>
                                                  confirmSuperAdminDelete(
                                                context,
                                                label:
                                                    'website client "${c.name}"',
                                                onDelete: () async {
                                                  await widget.erpRepository
                                                      .deleteWebsiteClient(
                                                    c.id,
                                                  );
                                                  await _load();
                                                },
                                              ),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
    );
  }
}
