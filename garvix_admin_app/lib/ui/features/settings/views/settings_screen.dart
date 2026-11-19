import 'dart:io';
import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';

class CompanySettingsScreen extends StatefulWidget {
  const CompanySettingsScreen({super.key, required this.erpRepository});

  final ErpRepository erpRepository;

  @override
  State<CompanySettingsScreen> createState() => _CompanySettingsScreenState();
}

class _CompanySettingsScreenState extends State<CompanySettingsScreen> {
  final _nameCtrl = TextEditingController();
  final _taglineCtrl = TextEditingController();
  final _gstinCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _stateCodeCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _upiIdCtrl = TextEditingController();
  final _upiNameCtrl = TextEditingController();
  final _bankNameCtrl = TextEditingController();
  final _accountNoCtrl = TextEditingController();
  final _ifscCtrl = TextEditingController();

  bool _loading = true;
  bool _saving = false;
  Uint8List? _signatureBytes;
  bool _uploadingSignature = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _loadSignature() async {
    try {
      final bytes = await widget.erpRepository.fetchSignatureBytes();
      if (mounted && bytes.isNotEmpty) {
        setState(() => _signatureBytes = Uint8List.fromList(bytes));
      }
    } catch (_) {
      // Ignore if signature preview fails on offline load
    }
  }

  Future<void> _uploadSignature() async {
    final picked = await FilePicker.pickFiles(type: FileType.image);
    if (picked.isEmpty) return;
    final path = picked.first.path;
    if (path == null || path.isEmpty) return;

    setState(() => _uploadingSignature = true);
    try {
      await widget.erpRepository.uploadSignature(File(path));
      await _loadSignature();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Signature updated live on all Invoices & Quotations!',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _uploadingSignature = false);
    }
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final s = await widget.erpRepository.fetchSettings();
      _nameCtrl.text = s.name;
      _taglineCtrl.text = s.tagline;
      _gstinCtrl.text = s.gstin;
      _stateCtrl.text = s.state;
      _stateCodeCtrl.text = s.stateCode;
      _emailCtrl.text = s.email;
      _phoneCtrl.text = s.phone;
      _addressCtrl.text = s.address;
      _upiIdCtrl.text = s.upiId;
      _upiNameCtrl.text = s.upiName;
      _bankNameCtrl.text = s.bankName ?? '';
      _accountNoCtrl.text = s.accountNo ?? '';
      _ifscCtrl.text = s.ifscCode ?? '';
      await _loadSignature();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _taglineCtrl.dispose();
    _gstinCtrl.dispose();
    _stateCtrl.dispose();
    _stateCodeCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    _upiIdCtrl.dispose();
    _upiNameCtrl.dispose();
    _bankNameCtrl.dispose();
    _accountNoCtrl.dispose();
    _ifscCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await widget.erpRepository.updateSettings(
        CompanySettingsModel(
          name: _nameCtrl.text.trim(),
          tagline: _taglineCtrl.text.trim(),
          state: _stateCtrl.text.trim(),
          stateCode: _stateCodeCtrl.text.trim(),
          gstin: _gstinCtrl.text.trim().toUpperCase(),
          email: _emailCtrl.text.trim(),
          phone: _phoneCtrl.text.trim(),
          address: _addressCtrl.text.trim(),
          upiId: _upiIdCtrl.text.trim(),
          upiName: _upiNameCtrl.text.trim(),
          bankName: _bankNameCtrl.text.trim(),
          accountNo: _accountNoCtrl.text.trim(),
          ifscCode: _ifscCtrl.text.trim().toUpperCase(),
        ),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Company profile updated live!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Company Settings')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 36),
              children: [
                AppleCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Legal & GST Identity',
                        style: TextStyle(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _nameCtrl,
                        decoration:
                            const InputDecoration(labelText: 'Company Legal Name'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _taglineCtrl,
                        decoration: const InputDecoration(labelText: 'Tagline'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _gstinCtrl,
                        textCapitalization: TextCapitalization.characters,
                        decoration: const InputDecoration(labelText: 'GSTIN'),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: TextField(
                              controller: _stateCtrl,
                              decoration:
                                  const InputDecoration(labelText: 'State'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _stateCodeCtrl,
                              decoration:
                                  const InputDecoration(labelText: 'Code'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _emailCtrl,
                              decoration:
                                  const InputDecoration(labelText: 'Email'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _phoneCtrl,
                              decoration:
                                  const InputDecoration(labelText: 'Phone'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _addressCtrl,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Registered Address',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                AppleCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Dynamic UPI & Bank Details',
                        style: TextStyle(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _upiIdCtrl,
                        decoration:
                            const InputDecoration(labelText: 'Dynamic UPI ID'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _upiNameCtrl,
                        decoration:
                            const InputDecoration(labelText: 'UPI Payee Name'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _bankNameCtrl,
                        decoration:
                            const InputDecoration(labelText: 'Bank Name'),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: TextField(
                              controller: _accountNoCtrl,
                              decoration: const InputDecoration(
                                labelText: 'Account Number',
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _ifscCtrl,
                              textCapitalization: TextCapitalization.characters,
                              decoration:
                                  const InputDecoration(labelText: 'IFSC'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
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
                      : const Text('Save Company Settings'),
                ),
                const SizedBox(height: 18),
                AppleCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Authorized Signatory Signature',
                        style: TextStyle(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Appears automatically on all Invoices & Quotations. White background is removed automatically on upload.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppleColors.inkSecondary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        height: 92,
                        alignment: Alignment.center,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppleColors.border),
                        ),
                        child: _signatureBytes != null
                            ? Image.memory(
                                _signatureBytes!,
                                height: 70,
                                fit: BoxFit.contain,
                              )
                            : const Text(
                                'No signature preview loaded',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppleColors.inkMuted,
                                ),
                              ),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed:
                            _uploadingSignature ? null : _uploadSignature,
                        icon: _uploadingSignature
                            ? const SizedBox(
                                height: 16,
                                width: 16,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.draw_outlined, size: 18),
                        label: Text(
                          _uploadingSignature
                              ? 'Processing & Uploading...'
                              : 'Upload / Change Signature',
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
