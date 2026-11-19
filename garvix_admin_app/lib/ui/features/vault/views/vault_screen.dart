import 'dart:io';
import 'dart:math';

import 'package:file_picker/file_picker.dart';
import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/vault_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../view_models/vault_view_model.dart';
import 'vault_image_preview_screen.dart';

class VaultScreen extends StatefulWidget {
  const VaultScreen({
    super.key,
    required this.viewModel,
    required this.user,
    this.onSignOut,
  });

  final VaultViewModel viewModel;
  final AuthUser user;
  final VoidCallback? onSignOut;

  @override
  State<VaultScreen> createState() => _VaultScreenState();
}

class _VaultScreenState extends State<VaultScreen> {
  int _segment = 0; // 0: Docs, 1: Banker IDs, 2: Share Links, 3: Activity

  @override
  void initState() {
    super.initState();
    widget.viewModel.load();
  }

  void _showSnack(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppleColors.red : AppleColors.inkPrimary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }

  Future<void> _pickAndUploadFiles() async {
    final folders = widget.viewModel.folders;
    if (folders.isEmpty) return;

    final pickedFiles = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: const [
        'pdf',
        'jpg',
        'jpeg',
        'png',
        'webp',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'csv',
        'txt',
      ],
    );
    if (pickedFiles.isEmpty) return;

    final files = pickedFiles
        .where((f) => f.path != null)
        .map((f) => File(f.path!))
        .toList();
    if (files.isEmpty) return;

    if (!mounted) return;
    String targetFolderId = widget.viewModel.selectedFolderId != 'ALL'
        ? widget.viewModel.selectedFolderId
        : folders.first.id;
    final titleCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Upload ${files.length} Document(s)',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 14),
              DropdownButtonFormField<String>(
                initialValue: targetFolderId,
                decoration: const InputDecoration(labelText: 'Destination Folder'),
                items: folders
                    .map(
                      (f) => DropdownMenuItem(
                        value: f.id,
                        child: Text(f.name, overflow: TextOverflow.ellipsis),
                      ),
                    )
                    .toList(),
                onChanged: (v) {
                  if (v != null) setModalState(() => targetFolderId = v);
                },
              ),
              if (files.length == 1) ...[
                const SizedBox(height: 12),
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Display Title (Optional)',
                    hintText: 'e.g. Certificate of Incorporation (COI)',
                  ),
                ),
              ],
              const SizedBox(height: 12),
              TextField(
                controller: notesCtrl,
                decoration: const InputDecoration(
                  labelText: 'Notes (Optional)',
                  hintText: 'e.g. Self-attested copy',
                ),
              ),
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: () => Navigator.pop(ctx, true),
                icon: const Icon(Icons.cloud_upload_outlined, size: 18),
                label: Text('Upload to Vault (${files.length})'),
              ),
            ],
          ),
        ),
      ),
    );

    if (confirmed == true) {
      try {
        await widget.viewModel.uploadFiles(
          folderId: targetFolderId,
          files: files,
          title: titleCtrl.text,
          notes: notesCtrl.text,
        );
        _showSnack('Uploaded ${files.length} document(s) securely.');
      } catch (e) {
        _showSnack('Upload failed: $e', isError: true);
      }
    }
    titleCtrl.dispose();
    notesCtrl.dispose();
  }

  Future<void> _downloadAndShareDoc(VaultDocument doc) async {
    try {
      _showSnack('Downloading ${doc.title}...');
      final file = await widget.viewModel.downloadDocument(doc);
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(file.path)],
          text: doc.title,
        ),
      );
    } catch (e) {
      _showSnack('Download failed: $e', isError: true);
    }
  }

  Future<void> _downloadAndShareZip() async {
    try {
      final folder = widget.viewModel.selectedFolder;
      _showSnack('Preparing ZIP archive...');
      final zipFile = await widget.viewModel.downloadZip(
        folderId: folder?.id,
        folderName: folder?.name,
      );
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(zipFile.path)],
          text: folder != null
              ? 'GARVIX Vault — ${folder.name}'
              : 'GARVIX Company Document Vault Kit',
        ),
      );
    } catch (e) {
      _showSnack('ZIP download failed: $e', isError: true);
    }
  }

  Future<void> _openFolderDialog({VaultFolder? renameTarget}) async {
    final nameCtrl = TextEditingController(text: renameTarget?.name ?? '');
    final descCtrl =
        TextEditingController(text: renameTarget?.description ?? '');

    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        title: Text(
          renameTarget == null ? 'New Folder' : 'Rename Folder',
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Folder Name',
                hintText: 'e.g. Vishnu Baldwa — Director KYC',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descCtrl,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'PAN, Aadhaar, Photo, DIN',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (saved == true && nameCtrl.text.trim().isNotEmpty) {
      try {
        if (renameTarget == null) {
          await widget.viewModel.createFolder(
            name: nameCtrl.text,
            description: descCtrl.text,
          );
          _showSnack('Folder created.');
        } else {
          await widget.viewModel.renameFolder(
            folderId: renameTarget.id,
            name: nameCtrl.text,
            description: descCtrl.text,
          );
          _showSnack('Folder renamed.');
        }
      } catch (e) {
        _showSnack('Action failed: $e', isError: true);
      }
    }
    nameCtrl.dispose();
    descCtrl.dispose();
  }

  Future<void> _openCreateBankerModal() async {
    final folders = widget.viewModel.folders;
    final nameCtrl = TextEditingController();
    final userCtrl = TextEditingController();
    final passCtrl = TextEditingController(text: _randomPass());
    String role = 'DOCUMENT_VIEWER';
    int? expiryDays = 7;
    final selectedIds = <String>{
      ...folders
          .where((f) => const {
                'incorporation',
                'office-registrations',
                'director-1',
                'director-2',
                'director-3',
                'banking',
              }.contains(f.slug))
          .map((f) => f.id),
    };

    final submitted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (ctx, scrollCtrl) => ListView(
            controller: scrollCtrl,
            padding: EdgeInsets.fromLTRB(
              20,
              20,
              20,
              MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            children: [
              const Text(
                'Create Banker / CA / Director ID',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              const Text(
                'Restricted viewers only see the folders ticked below.',
                style: TextStyle(fontSize: 12.5, color: AppleColors.inkSecondary),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Person / Bank Name *',
                  hintText: 'e.g. HDFC Bank RM / Director 2',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: userCtrl,
                autocorrect: false,
                decoration: const InputDecoration(
                  labelText: 'Login Username *',
                  hintText: 'e.g. hdfcbank',
                  suffixText: '@garvix.in',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: passCtrl,
                decoration: InputDecoration(
                  labelText: 'Password *',
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.refresh_rounded),
                    onPressed: () => setModal(() => passCtrl.text = _randomPass()),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: role,
                decoration: const InputDecoration(labelText: 'Access Level'),
                items: const [
                  DropdownMenuItem(
                    value: 'DOCUMENT_VIEWER',
                    child: Text('Banker / CA (Docs Only)'),
                  ),
                  DropdownMenuItem(
                    value: 'SUPER_ADMIN',
                    child: Text('Director (Full Admin)'),
                  ),
                ],
                onChanged: (v) {
                  if (v != null) setModal(() => role = v);
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int?>(
                initialValue: expiryDays,
                decoration: const InputDecoration(labelText: 'Auto-Expire ID'),
                items: const [
                  DropdownMenuItem(value: 3, child: Text('After 3 Days')),
                  DropdownMenuItem(value: 7, child: Text('After 7 Days (Recommended)')),
                  DropdownMenuItem(value: 15, child: Text('After 15 Days')),
                  DropdownMenuItem(value: 30, child: Text('After 30 Days')),
                  DropdownMenuItem(value: null, child: Text('Never Expire')),
                ],
                onChanged: (v) => setModal(() => expiryDays = v),
              ),
              if (role == 'DOCUMENT_VIEWER') ...[
                const SizedBox(height: 16),
                Text(
                  'Allowed Folders (${selectedIds.length})',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                for (final f in folders)
                  CheckboxListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    value: selectedIds.contains(f.id),
                    title: Text(f.name, style: const TextStyle(fontSize: 13.5)),
                    subtitle: Text(
                      '${f.documents.length} files',
                      style: const TextStyle(fontSize: 11),
                    ),
                    onChanged: (checked) {
                      setModal(() {
                        if (checked == true) {
                          selectedIds.add(f.id);
                        } else {
                          selectedIds.remove(f.id);
                        }
                      });
                    },
                  ),
              ],
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Create Login ID'),
              ),
            ],
          ),
        ),
      ),
    );

    if (submitted == true) {
      if (nameCtrl.text.trim().isEmpty || userCtrl.text.trim().isEmpty) {
        _showSnack('Name and username are required.', isError: true);
      } else {
        try {
          final res = await widget.viewModel.createVaultUser(
            name: nameCtrl.text,
            username: userCtrl.text,
            password: passCtrl.text,
            role: role,
            expiresInDays: expiryDays,
            folderIds: selectedIds.toList(),
          );
          final created = (res['user'] as Map<String, dynamic>?) ?? const {};
          final email = (created['email'] ?? userCtrl.text).toString();
          _showSnack('Login created for $email');
          await SharePlus.instance.share(
            ShareParams(
              text:
                  'GARVIX Document Vault Access\nPortal: ${widget.viewModel.baseUrl}/admin/login\nLogin ID: $email\nPassword: ${passCtrl.text}',
            ),
          );
        } catch (e) {
          _showSnack('Failed: $e', isError: true);
        }
      }
    }

    nameCtrl.dispose();
    userCtrl.dispose();
    passCtrl.dispose();
  }

  Future<void> _openCreateShareLinkModal() async {
    final folders = widget.viewModel.folders;
    final labelCtrl = TextEditingController();
    final recipientCtrl = TextEditingController();
    final pinCtrl = TextEditingController();
    int hours = 72;
    final selectedIds = <String>{
      ...folders
          .where((f) => const {
                'incorporation',
                'office-registrations',
                'director-1',
                'director-2',
                'director-3',
                'banking',
              }.contains(f.slug))
          .map((f) => f.id),
    };

    final submitted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => DraggableScrollableSheet(
          initialChildSize: 0.82,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (ctx, scrollCtrl) => ListView(
            controller: scrollCtrl,
            padding: EdgeInsets.fromLTRB(
              20,
              20,
              20,
              MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            children: [
              const Text(
                'Generate Expiring Share Link',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: labelCtrl,
                decoration: const InputDecoration(
                  labelText: 'Title *',
                  hintText: 'e.g. HDFC Bank Current Account KYC Kit',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: recipientCtrl,
                decoration: const InputDecoration(
                  labelText: 'Recipient (Optional)',
                  hintText: 'e.g. HDFC RM Sector 24',
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: pinCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'PIN (Optional)',
                        hintText: '4829',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      initialValue: hours,
                      decoration: const InputDecoration(labelText: 'Expiry'),
                      items: const [
                        DropdownMenuItem(value: 24, child: Text('24 Hours')),
                        DropdownMenuItem(value: 72, child: Text('3 Days')),
                        DropdownMenuItem(value: 168, child: Text('7 Days')),
                        DropdownMenuItem(value: 720, child: Text('30 Days')),
                      ],
                      onChanged: (v) {
                        if (v != null) setModal(() => hours = v);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Folders Included (${selectedIds.length})',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              for (final f in folders)
                CheckboxListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  value: selectedIds.contains(f.id),
                  title: Text(f.name, style: const TextStyle(fontSize: 13.5)),
                  onChanged: (checked) {
                    setModal(() {
                      if (checked == true) {
                        selectedIds.add(f.id);
                      } else {
                        selectedIds.remove(f.id);
                      }
                    });
                  },
                ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Create Share Link'),
              ),
            ],
          ),
        ),
      ),
    );

    if (submitted == true &&
        labelCtrl.text.trim().isNotEmpty &&
        selectedIds.isNotEmpty) {
      try {
        await widget.viewModel.createShareLink(
          label: labelCtrl.text,
          recipient: recipientCtrl.text,
          pin: pinCtrl.text,
          expiresInHours: hours,
          folderIds: selectedIds.toList(),
        );
        _showSnack('Secure share link created!');
      } catch (e) {
        _showSnack('Failed: $e', isError: true);
      }
    }
    labelCtrl.dispose();
    recipientCtrl.dispose();
    pinCtrl.dispose();
  }

  String _randomPass() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    final rand = Random.secure();
    return 'Gvx@${List.generate(6, (_) => chars[rand.nextInt(chars.length)]).join()}';
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.viewModel,
      builder: (context, _) {
        final canManage = widget.viewModel.canManage;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Company Vault'),
            actions: [
              if (_segment == 0 && widget.viewModel.filteredDocuments.isNotEmpty)
                IconButton(
                  onPressed: widget.viewModel.isBusy ? null : _downloadAndShareZip,
                  icon: const Icon(Icons.folder_zip_outlined),
                  tooltip: 'Download & Share ZIP',
                ),
              IconButton(
                onPressed: widget.viewModel.load,
                icon: const Icon(Icons.refresh_rounded),
                tooltip: 'Refresh',
              ),
              if (widget.onSignOut != null)
                IconButton(
                  onPressed: widget.onSignOut,
                  icon: const Icon(Icons.logout_rounded, color: AppleColors.red),
                  tooltip: 'Sign Out',
                ),
            ],
          ),
          floatingActionButton: canManage && _segment == 0
              ? FloatingActionButton.extended(
                  onPressed: widget.viewModel.isBusy ? null : _pickAndUploadFiles,
                  backgroundColor: AppleColors.blue,
                  foregroundColor: Colors.white,
                  icon: const Icon(Icons.upload_file_rounded),
                  label: const Text('Upload'),
                )
              : canManage && _segment == 1
                  ? FloatingActionButton.extended(
                      onPressed: _openCreateBankerModal,
                      backgroundColor: AppleColors.blue,
                      foregroundColor: Colors.white,
                      icon: const Icon(Icons.person_add_alt_1_rounded),
                      label: const Text('New ID'),
                    )
                  : canManage && _segment == 2
                      ? FloatingActionButton.extended(
                          onPressed: _openCreateShareLinkModal,
                          backgroundColor: AppleColors.blue,
                          foregroundColor: Colors.white,
                          icon: const Icon(Icons.add_link_rounded),
                          label: const Text('New Link'),
                        )
                      : null,
          body: widget.viewModel.isLoading && widget.viewModel.vault == null
              ? const Center(child: CircularProgressIndicator())
              : widget.viewModel.error != null && widget.viewModel.vault == null
                  ? AppleEmptyState(
                      icon: Icons.lock_outline_rounded,
                      title: 'Vault Unavailable',
                      subtitle: widget.viewModel.error!,
                      actionLabel: 'Retry',
                      onAction: widget.viewModel.load,
                    )
                  : Column(
                      children: [
                        if (widget.viewModel.isBusy)
                          const LinearProgressIndicator(
                            minHeight: 2.5,
                            color: AppleColors.blue,
                          ),
                        if (canManage)
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
                            child: SizedBox(
                              width: double.infinity,
                              child: SegmentedButton<int>(
                                showSelectedIcon: false,
                                segments: const [
                                  ButtonSegment(value: 0, label: Text('Docs', style: TextStyle(fontSize: 12))),
                                  ButtonSegment(value: 1, label: Text('IDs', style: TextStyle(fontSize: 12))),
                                  ButtonSegment(value: 2, label: Text('Links', style: TextStyle(fontSize: 12))),
                                  ButtonSegment(value: 3, label: Text('Logs', style: TextStyle(fontSize: 12))),
                                ],
                                selected: {_segment},
                                onSelectionChanged: (s) =>
                                    setState(() => _segment = s.first),
                              ),
                            ),
                          ),
                        Expanded(
                          child: _segment == 0
                              ? _buildDocsTab(canManage)
                              : _segment == 1
                                  ? _buildBankerIdsTab()
                                  : _segment == 2
                                      ? _buildShareLinksTab()
                                      : _buildActivityTab(),
                        ),
                      ],
                    ),
        );
      },
    );
  }

  Widget _buildDocsTab(bool canManage) {
    final folders = widget.viewModel.folders;
    final docs = widget.viewModel.filteredDocuments;
    final selectedFolder = widget.viewModel.selectedFolder;

    return RefreshIndicator(
      onRefresh: widget.viewModel.load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
        children: [
          // Folder Horizontal Chips
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ChoiceChip(
                  label: const Text('All'),
                  selected: widget.viewModel.selectedFolderId == 'ALL',
                  onSelected: (_) => widget.viewModel.selectFolder('ALL'),
                ),
                const SizedBox(width: 8),
                for (final f in folders) ...[
                  ChoiceChip(
                    label: Text('${f.name} (${f.documents.length})'),
                    selected: widget.viewModel.selectedFolderId == f.id,
                    onSelected: (_) => widget.viewModel.selectFolder(f.id),
                  ),
                  const SizedBox(width: 8),
                ],
                if (canManage)
                  ActionChip(
                    avatar: const Icon(Icons.create_new_folder_outlined, size: 16),
                    label: const Text('Folder'),
                    onPressed: () => _openFolderDialog(),
                  ),
              ],
            ),
          ),

          if (selectedFolder != null && canManage) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    selectedFolder.description ?? selectedFolder.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppleColors.inkSecondary,
                    ),
                  ),
                ),
                TextButton.icon(
                  onPressed: () => _openFolderDialog(renameTarget: selectedFolder),
                  icon: const Icon(Icons.edit_outlined, size: 15),
                  label: const Text('Rename', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ],

          const SizedBox(height: 10),
          // Search Bar
          TextField(
            onChanged: widget.viewModel.setSearchQuery,
            decoration: const InputDecoration(
              hintText: 'Search COI, PAN, Aadhaar, MOA, GST...',
              prefixIcon: Icon(Icons.search_rounded, size: 20, color: AppleColors.inkMuted),
            ),
          ),
          const SizedBox(height: 14),

          if (docs.isEmpty)
            AppleEmptyState(
              icon: Icons.folder_open_rounded,
              title: 'No documents here',
              subtitle: canManage
                  ? 'Tap Upload below to add company PDFs, PAN/Aadhaar scans, or MCA papers.'
                  : 'No documents are available in this folder.',
            )
          else
            for (final entry in docs) ...[
              AppleCard(
                padding: const EdgeInsets.all(14),
                onTap: () {
                  if (entry.doc.isImage) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => VaultImagePreviewScreen(
                          document: entry.doc,
                          viewModel: widget.viewModel,
                        ),
                      ),
                    );
                  } else {
                    _downloadAndShareDoc(entry.doc);
                  }
                },
                child: Row(
                  children: [
                    Container(
                      height: 44,
                      width: 44,
                      decoration: BoxDecoration(
                        color: entry.doc.isPdf
                            ? AppleColors.redSoft
                            : entry.doc.isImage
                                ? AppleColors.blueSoft
                                : AppleColors.canvas,
                        borderRadius: BorderRadius.circular(13),
                      ),
                      child: Icon(
                        entry.doc.isPdf
                            ? Icons.picture_as_pdf_rounded
                            : entry.doc.isImage
                                ? Icons.image_outlined
                                : Icons.description_outlined,
                        color: entry.doc.isPdf
                            ? AppleColors.red
                            : entry.doc.isImage
                                ? AppleColors.blue
                                : AppleColors.inkSecondary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            entry.doc.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w600,
                              color: AppleColors.inkPrimary,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${entry.folderName} • ${entry.doc.formattedSize}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: AppleColors.inkSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => _downloadAndShareDoc(entry.doc),
                      icon: const Icon(
                        Icons.ios_share_rounded,
                        size: 20,
                        color: AppleColors.blue,
                      ),
                      tooltip: 'Download & Share',
                    ),
                    if (canManage)
                      IconButton(
                        onPressed: () async {
                          final ok = await showDialog<bool>(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text('Delete Document?'),
                              content: Text('Permanently delete "${entry.doc.title}"?'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx, false),
                                  child: const Text('Cancel'),
                                ),
                                FilledButton(
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppleColors.red,
                                  ),
                                  onPressed: () => Navigator.pop(ctx, true),
                                  child: const Text('Delete'),
                                ),
                              ],
                            ),
                          );
                          if (ok == true) {
                            await widget.viewModel.deleteDocument(entry.doc.id);
                            _showSnack('Deleted "${entry.doc.title}".');
                          }
                        },
                        icon: const Icon(
                          Icons.delete_outline_rounded,
                          size: 20,
                          color: AppleColors.inkMuted,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
            ],
        ],
      ),
    );
  }

  Widget _buildBankerIdsTab() {
    final users = widget.viewModel.vault?.users ?? const [];
    return RefreshIndicator(
      onRefresh: widget.viewModel.load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
        itemCount: users.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final u = users[index];
          return AppleCard(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: u.isAdmin ? AppleColors.blueSoft : AppleColors.amberSoft,
                  child: Text(
                    u.name.isNotEmpty ? u.name[0].toUpperCase() : 'U',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: u.isAdmin ? AppleColors.blue : AppleColors.amber,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              u.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          AppleBadge(
                            label: u.role == 'DOCUMENT_VIEWER' ? 'BANKER' : u.role,
                            background: u.isActive && !u.isExpired
                                ? AppleColors.blueSoft
                                : AppleColors.redSoft,
                            foreground: u.isActive && !u.isExpired
                                ? AppleColors.blue
                                : AppleColors.red,
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        u.email,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppleColors.inkSecondary,
                        ),
                      ),
                      Text(
                        u.isAdmin
                            ? 'All folders access'
                            : '${u.folderIds.length} folder(s)${u.expiresAt != null ? ' • Exp ${formatShortDate(u.expiresAt!)}' : ''}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppleColors.inkMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!u.isAdmin)
                  TextButton(
                    onPressed: () async {
                      await widget.viewModel.toggleUserActive(u);
                      _showSnack(
                        u.isActive ? 'Access revoked for ${u.name}' : 'Reactivated ${u.name}',
                      );
                    },
                    child: Text(
                      u.isActive ? 'Revoke' : 'Enable',
                      style: TextStyle(
                        color: u.isActive ? AppleColors.red : AppleColors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildShareLinksTab() {
    final links = widget.viewModel.vault?.shareLinks ?? const [];
    if (links.isEmpty) {
      return const AppleEmptyState(
        icon: Icons.link_rounded,
        title: 'No share links yet',
        subtitle: 'Tap "New Link" to create a PIN-protected expiring document link.',
      );
    }

    return RefreshIndicator(
      onRefresh: widget.viewModel.load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
        itemCount: links.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final s = links[index];
          final url = s.shareUrl(widget.viewModel.baseUrl);
          return AppleCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        s.label,
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    AppleBadge(
                      label: s.isValid ? 'ACTIVE' : 'EXPIRED',
                      background:
                          s.isValid ? AppleColors.greenSoft : AppleColors.redSoft,
                      foreground: s.isValid ? AppleColors.green : AppleColors.red,
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${s.recipient ?? "External"} • ${s.folderIds.length} folders • ${s.accessCount} opens • Exp ${formatShortDate(s.expiresAt)}',
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppleColors.inkSecondary,
                  ),
                ),
                if (s.isValid) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: () {
                          SharePlus.instance.share(
                            ShareParams(
                              text:
                                  'GARVIX Secure Documents (${s.label}): $url',
                            ),
                          );
                        },
                        icon: const Icon(Icons.ios_share_rounded, size: 16),
                        label: const Text('Share Link'),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () async {
                          await widget.viewModel.revokeShareLink(s.id);
                          _showSnack('Share link revoked.');
                        },
                        child: const Text(
                          'Revoke',
                          style: TextStyle(color: AppleColors.red),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildActivityTab() {
    final logs = widget.viewModel.vault?.activityLogs ?? const [];
    if (logs.isEmpty) {
      return const AppleEmptyState(
        icon: Icons.history_rounded,
        title: 'No vault activity yet',
        subtitle: 'Uploads, previews, downloads, and ZIP exports appear here.',
      );
    }

    return RefreshIndicator(
      onRefresh: widget.viewModel.load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        itemCount: logs.length,
        separatorBuilder: (_, _) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final log = logs[index];
          return AppleCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppleBadge(label: log.action),
                    Text(
                      formatDateTime(log.createdAt),
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppleColors.inkMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  log.details,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppleColors.inkPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  log.username,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppleColors.inkSecondary,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
