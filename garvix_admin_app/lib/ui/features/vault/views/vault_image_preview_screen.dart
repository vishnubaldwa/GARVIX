import 'dart:typed_data';

import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../domain/models/vault_models.dart';
import '../view_models/vault_view_model.dart';

class VaultImagePreviewScreen extends StatefulWidget {
  const VaultImagePreviewScreen({
    super.key,
    required this.document,
    required this.viewModel,
  });

  final VaultDocument document;
  final VaultViewModel viewModel;

  @override
  State<VaultImagePreviewScreen> createState() =>
      _VaultImagePreviewScreenState();
}

class _VaultImagePreviewScreenState extends State<VaultImagePreviewScreen> {
  late Future<List<int>> _futureBytes;

  @override
  void initState() {
    super.initState();
    _futureBytes = widget.viewModel.fetchPreviewBytes(widget.document);
  }

  Future<void> _downloadAndShare() async {
    try {
      final file = await widget.viewModel.downloadDocument(widget.document);
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(file.path)],
          text: widget.document.title,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Share failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(
          widget.document.title,
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
        actions: [
          IconButton(
            onPressed: _downloadAndShare,
            icon: const Icon(Icons.ios_share_rounded),
            tooltip: 'Download / Share',
          ),
        ],
      ),
      body: FutureBuilder<List<int>>(
        future: _futureBytes,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Preview unavailable: ${snapshot.error}',
                  style: const TextStyle(color: Colors.white70),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }
          if (!snapshot.hasData) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.white),
            );
          }
          return InteractiveViewer(
            minScale: 0.5,
            maxScale: 4,
            child: Center(
              child: Image.memory(
                Uint8List.fromList(snapshot.data!),
                fit: BoxFit.contain,
              ),
            ),
          );
        },
      ),
    );
  }
}
