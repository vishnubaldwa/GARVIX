import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../../../domain/models/erp_models.dart';
import '../../../core/theme/apple_theme.dart';
import '../../../core/widgets/apple_card.dart';
import '../../../core/widgets/empty_state.dart';

class ImportantDatesScreen extends StatefulWidget {
  const ImportantDatesScreen({
    super.key,
    required this.erpRepository,
    required this.user,
  });

  final ErpRepository erpRepository;
  final AuthUser user;

  @override
  State<ImportantDatesScreen> createState() => _ImportantDatesScreenState();
}

class _ImportantDatesScreenState extends State<ImportantDatesScreen> {
  ImportantDatesPayload? _payload;
  String? _selectedFy;
  String _selectedCategory = 'ALL';
  String _urgencyFilter = 'ALL'; // ALL, OVERDUE, DUE_SOON, UPCOMING, FILED
  final _searchCtrl = TextEditingController();
  bool _loading = true;
  String? _error;

  static const _months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load({String? fy}) async {
    final targetFy = fy ?? _selectedFy;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await widget.erpRepository.fetchImportantDates(fy: targetFy);
      if (mounted) {
        setState(() {
          _payload = data;
          _selectedFy = data.financialYear;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _formatDate(String? iso) {
    if (iso == null || iso.length < 10) return '—';
    final parts = iso.substring(0, 10).split('-');
    if (parts.length != 3) return iso;
    final y = int.tryParse(parts[0]) ?? 2026;
    final m = (int.tryParse(parts[1]) ?? 1).clamp(1, 12);
    final d = int.tryParse(parts[2]) ?? 1;
    return '${d.toString().padLeft(2, '0')} ${_months[m - 1]} $y';
  }

  String _todayIso() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  String _countdownLabel(ImportantDateItem item) {
    if (item.status == 'FILED') {
      return item.filedDate != null
          ? 'Filed ${_formatDate(item.filedDate)}'
          : 'Filed';
    }
    if (item.status == 'NOT_APPLICABLE') return 'Not Applicable';
    if (item.daysRemaining < 0) {
      final d = item.daysRemaining.abs();
      return d == 1 ? 'Overdue 1d' : 'Overdue ${d}d';
    }
    if (item.daysRemaining == 0) return 'Due Today';
    if (item.daysRemaining == 1) return 'Due Tomorrow';
    return 'In ${item.daysRemaining}d';
  }

  String _categoryLabel(String cat) {
    switch (cat) {
      case 'POST_INCORP':
        return 'Post-Incorp';
      case 'GST':
        return 'GST';
      case 'MCA_ROC':
        return 'MCA / ROC';
      case 'INCOME_TAX':
        return 'Tax & TDS';
      case 'PF_ESIC':
        return 'PF / ESIC';
      case 'CUSTOM':
        return 'Custom';
      default:
        return 'All';
    }
  }

  Future<String?> _pickIsoDate(BuildContext ctx, String? initialIso) async {
    DateTime initial = DateTime.now();
    if (initialIso != null && initialIso.length >= 10) {
      final parsed = DateTime.tryParse(initialIso.substring(0, 10));
      if (parsed != null) initial = parsed;
    }
    final picked = await showDatePicker(
      context: ctx,
      initialDate: initial,
      firstDate: DateTime(2000),
      lastDate: DateTime(2040),
    );
    if (picked == null) return null;
    return '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
  }

  Future<void> _openPortal(String? url) async {
    if (url == null || url.trim().isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri != null) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _shareReminder(ImportantDateItem item) {
    final company = _payload?.profile.companyName ?? 'GARVIX';
    final lines = [
      '*GARVIX Statutory Compliance Reminder*',
      'Company: $company',
      'Compliance: *${item.title}*',
      'Due Date: *${_formatDate(item.dueDate)}* (${_countdownLabel(item)})',
      'Where: ${item.portalName}${item.portalUrl != null ? ' (${item.portalUrl})' : ''}',
      'What to Do: ${item.instructions}',
      if (item.penaltyNote != null && item.penaltyNote!.isNotEmpty)
        'Penalty Risk: ${item.penaltyNote}',
    ];
    SharePlus.instance.share(ShareParams(text: lines.join('\n')));
  }

  Future<void> _showSetupSheet() async {
    final profile = _payload?.profile;
    String? incorpDate = profile?.incorporationDate;
    String? gstRegDate = profile?.gstRegistrationDate;
    String companyType = profile?.companyType ?? 'PVT_LTD';
    String gstFreq = profile?.gstFilingFrequency ?? 'MONTHLY';
    bool pfEsic = profile?.pfEsicApplicable ?? false;
    bool saving = false;

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
                  'Company Compliance Setup',
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Enter Date of Incorporation & GST frequency to auto-calculate all Indian statutory deadlines.',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppleColors.inkSecondary,
                  ),
                ),
                const SizedBox(height: 14),
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 2,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppleColors.border),
                  ),
                  tileColor: AppleColors.canvas,
                  leading: const Icon(
                    Icons.event_available_rounded,
                    color: AppleColors.blue,
                  ),
                  title: const Text(
                    'Date of Incorporation (DOI)',
                    style: TextStyle(fontSize: 12, color: AppleColors.inkMuted),
                  ),
                  subtitle: Text(
                    incorpDate != null && incorpDate!.isNotEmpty
                        ? _formatDate(incorpDate)
                        : 'Tap to select from COI',
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: AppleColors.inkPrimary,
                    ),
                  ),
                  trailing: const Icon(Icons.calendar_today_rounded, size: 18),
                  onTap: () async {
                    final picked = await _pickIsoDate(ctx, incorpDate);
                    if (picked != null) {
                      setModalState(() => incorpDate = picked);
                    }
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: companyType,
                  decoration: const InputDecoration(
                    labelText: 'Entity Type',
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'PVT_LTD',
                      child: Text('Private Limited (Pvt. Ltd.)'),
                    ),
                    DropdownMenuItem(
                      value: 'OPC',
                      child: Text('One Person Company (OPC)'),
                    ),
                    DropdownMenuItem(
                      value: 'LLP',
                      child: Text('LLP'),
                    ),
                    DropdownMenuItem(
                      value: 'PROPRIETORSHIP',
                      child: Text('Proprietorship / Firm'),
                    ),
                  ],
                  onChanged: (v) {
                    if (v != null) setModalState(() => companyType = v);
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: gstFreq,
                  decoration: const InputDecoration(
                    labelText: 'GST Filing Scheme',
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'MONTHLY',
                      child: Text('Monthly (GSTR-1 11th & 3B 20th)'),
                    ),
                    DropdownMenuItem(
                      value: 'QUARTERLY',
                      child: Text('Quarterly QRMP (IFF, PMT-06 & Qtr 1/3B)'),
                    ),
                    DropdownMenuItem(
                      value: 'NONE',
                      child: Text('Not GST Registered'),
                    ),
                  ],
                  onChanged: (v) {
                    if (v != null) setModalState(() => gstFreq = v);
                  },
                ),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 2,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppleColors.border),
                  ),
                  tileColor: AppleColors.canvas,
                  leading: const Icon(
                    Icons.receipt_long_rounded,
                    color: AppleColors.green,
                  ),
                  title: const Text(
                    'GST Registration Date (Optional)',
                    style: TextStyle(fontSize: 12, color: AppleColors.inkMuted),
                  ),
                  subtitle: Text(
                    gstRegDate != null && gstRegDate!.isNotEmpty
                        ? _formatDate(gstRegDate)
                        : 'Defaults to Incorporation Date',
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: AppleColors.inkPrimary,
                    ),
                  ),
                  trailing: gstRegDate != null && gstRegDate!.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close_rounded, size: 18),
                          onPressed: () =>
                              setModalState(() => gstRegDate = null),
                        )
                      : const Icon(Icons.calendar_today_rounded, size: 18),
                  onTap: () async {
                    final picked = await _pickIsoDate(ctx, gstRegDate);
                    if (picked != null) {
                      setModalState(() => gstRegDate = picked);
                    }
                  },
                ),
                const SizedBox(height: 6),
                SwitchListTile.adaptive(
                  contentPadding: EdgeInsets.zero,
                  title: const Text(
                    'Enable Monthly PF & ESIC Reminders',
                    style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600),
                  ),
                  subtitle: const Text(
                    '15th of every month (EPFO & ESIC portals)',
                    style: TextStyle(fontSize: 11.5),
                  ),
                  value: pfEsic,
                  onChanged: (v) => setModalState(() => pfEsic = v),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: saving
                      ? null
                      : () async {
                          setModalState(() => saving = true);
                          try {
                            final updated = await widget.erpRepository
                                .saveComplianceProfile(
                              incorporationDate: incorpDate,
                              companyType: companyType,
                              gstFilingFrequency: gstFreq,
                              gstRegistrationDate: gstRegDate,
                              pfEsicApplicable: pfEsic,
                              fy: _selectedFy,
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              setState(() {
                                _payload = updated;
                                _selectedFy = updated.financialYear;
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Compliance profile saved & calendar recalculated!',
                                  ),
                                ),
                              );
                            }
                          } catch (e) {
                            setModalState(() => saving = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString())),
                              );
                            }
                          }
                        },
                  child: saving
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Save & Generate Calendar'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showStatusSheet(ImportantDateItem item) async {
    String status = item.status == 'PENDING' ? 'FILED' : item.status;
    String filedDate = item.filedDate ?? _todayIso();
    final refCtrl = TextEditingController(text: item.referenceNo ?? '');
    final notesCtrl = TextEditingController(text: item.notes ?? '');
    bool saving = false;

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
                  item.title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Due ${_formatDate(item.dueDate)} • ${item.portalName}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppleColors.inkSecondary,
                  ),
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  initialValue: status,
                  decoration: const InputDecoration(labelText: 'Filing Status'),
                  items: const [
                    DropdownMenuItem(
                      value: 'FILED',
                      child: Text('Filed / Completed'),
                    ),
                    DropdownMenuItem(
                      value: 'IN_PROGRESS',
                      child: Text('In Progress (With CA)'),
                    ),
                    DropdownMenuItem(
                      value: 'PENDING',
                      child: Text('Pending'),
                    ),
                    DropdownMenuItem(
                      value: 'NOT_APPLICABLE',
                      child: Text('Not Applicable (Exempt / Nil)'),
                    ),
                  ],
                  onChanged: (v) {
                    if (v != null) setModalState(() => status = v);
                  },
                ),
                if (status == 'FILED') ...[
                  const SizedBox(height: 12),
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: AppleColors.border),
                    ),
                    tileColor: AppleColors.canvas,
                    title: const Text(
                      'Filed Date',
                      style: TextStyle(fontSize: 11.5, color: AppleColors.inkMuted),
                    ),
                    subtitle: Text(
                      _formatDate(filedDate),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    trailing: const Icon(Icons.calendar_today_rounded, size: 18),
                    onTap: () async {
                      final picked = await _pickIsoDate(ctx, filedDate);
                      if (picked != null) {
                        setModalState(() => filedDate = picked);
                      }
                    },
                  ),
                ],
                const SizedBox(height: 12),
                TextField(
                  controller: refCtrl,
                  decoration: const InputDecoration(
                    labelText: 'SRN / ARN / Challan No. (Optional)',
                    hintText: 'e.g. SRN AB1234567',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'CA Notes / Remarks (Optional)',
                    hintText: 'e.g. Filed by CA, receipt stored in Vault',
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: saving
                      ? null
                      : () async {
                          setModalState(() => saving = true);
                          try {
                            await widget.erpRepository.updateComplianceStatus(
                              complianceKey: item.isCustom ? null : item.key,
                              customId: item.isCustom ? item.customId : null,
                              financialYear:
                                  _payload?.financialYear ?? '2026-27',
                              status: status,
                              filedDate: status == 'FILED' ? filedDate : null,
                              referenceNo: refCtrl.text.trim(),
                              notes: notesCtrl.text.trim(),
                            );
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    'Updated ${item.shortCode} to ${status.replaceAll('_', ' ')}.',
                                  ),
                                ),
                              );
                            }
                          } catch (e) {
                            setModalState(() => saving = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString())),
                              );
                            }
                          }
                        },
                  child: saving
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Save Status'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showCustomDateSheet({ImportantDateItem? existing}) async {
    final isEdit = existing != null && existing.customId != null;
    final titleCtrl = TextEditingController(text: existing?.title ?? '');
    String dueDate = existing?.dueDate ?? _todayIso();
    String category = existing?.category ?? 'CUSTOM';
    String recurrence = existing?.recurrence ?? 'NONE';
    final portalNameCtrl = TextEditingController(
      text: (existing?.portalName == 'Internal / Custom')
          ? ''
          : (existing?.portalName ?? ''),
    );
    final portalUrlCtrl =
        TextEditingController(text: existing?.portalUrl ?? '');
    final instrCtrl = TextEditingController(text: existing?.instructions ?? '');
    final penaltyCtrl =
        TextEditingController(text: existing?.penaltyNote ?? '');
    bool saving = false;

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
                  isEdit ? 'Edit Custom Date' : 'Add Custom Important Date',
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Title *',
                    hintText: 'e.g. Director DSC Renewal / Rent Renewal',
                  ),
                ),
                const SizedBox(height: 10),
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppleColors.border),
                  ),
                  tileColor: AppleColors.canvas,
                  title: const Text(
                    'Due Date *',
                    style: TextStyle(fontSize: 11.5, color: AppleColors.inkMuted),
                  ),
                  subtitle: Text(
                    _formatDate(dueDate),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  trailing: const Icon(Icons.calendar_today_rounded, size: 18),
                  onTap: () async {
                    final picked = await _pickIsoDate(ctx, dueDate);
                    if (picked != null) {
                      setModalState(() => dueDate = picked);
                    }
                  },
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: category,
                        decoration: const InputDecoration(labelText: 'Category'),
                        items: const [
                          DropdownMenuItem(value: 'CUSTOM', child: Text('Custom')),
                          DropdownMenuItem(value: 'MCA_ROC', child: Text('MCA / ROC')),
                          DropdownMenuItem(value: 'GST', child: Text('GST')),
                          DropdownMenuItem(value: 'INCOME_TAX', child: Text('Tax / TDS')),
                          DropdownMenuItem(value: 'PF_ESIC', child: Text('PF / ESIC')),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => category = v);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: recurrence,
                        decoration: const InputDecoration(labelText: 'Repeat'),
                        items: const [
                          DropdownMenuItem(value: 'NONE', child: Text('One-Time')),
                          DropdownMenuItem(value: 'MONTHLY', child: Text('Monthly')),
                          DropdownMenuItem(value: 'QUARTERLY', child: Text('Quarterly')),
                          DropdownMenuItem(value: 'YEARLY', child: Text('Yearly')),
                        ],
                        onChanged: (v) {
                          if (v != null) setModalState(() => recurrence = v);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: portalNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Where / Portal Name',
                    hintText: 'e.g. eMudhra / Haryana Portal',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: portalUrlCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Portal URL (Optional)',
                    hintText: 'https://...',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: instrCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'What to Do (Instructions)',
                    hintText: 'Steps or documents required...',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: penaltyCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Penalty / Risk Note (Optional)',
                  ),
                ),
                const SizedBox(height: 14),
                FilledButton(
                  onPressed: saving
                      ? null
                      : () async {
                          if (titleCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Title is required.')),
                            );
                            return;
                          }
                          setModalState(() => saving = true);
                          try {
                            if (isEdit) {
                              await widget.erpRepository
                                  .updateCustomImportantDate(
                                id: existing.customId!,
                                title: titleCtrl.text.trim(),
                                category: category,
                                dueDate: dueDate,
                                portalName: portalNameCtrl.text.trim(),
                                portalUrl: portalUrlCtrl.text.trim(),
                                instructions: instrCtrl.text.trim(),
                                penaltyNote: penaltyCtrl.text.trim(),
                                recurrence: recurrence,
                              );
                            } else {
                              await widget.erpRepository
                                  .createCustomImportantDate(
                                title: titleCtrl.text.trim(),
                                category: category,
                                dueDate: dueDate,
                                portalName: portalNameCtrl.text.trim().isEmpty
                                    ? null
                                    : portalNameCtrl.text.trim(),
                                portalUrl: portalUrlCtrl.text.trim().isEmpty
                                    ? null
                                    : portalUrlCtrl.text.trim(),
                                instructions: instrCtrl.text.trim().isEmpty
                                    ? null
                                    : instrCtrl.text.trim(),
                                penaltyNote: penaltyCtrl.text.trim().isEmpty
                                    ? null
                                    : penaltyCtrl.text.trim(),
                                recurrence: recurrence,
                              );
                            }
                            if (ctx.mounted) Navigator.pop(ctx);
                            await _load();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isEdit
                                        ? 'Custom date updated!'
                                        : 'Custom important date added!',
                                  ),
                                ),
                              );
                            }
                          } catch (e) {
                            setModalState(() => saving = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString())),
                              );
                            }
                          }
                        },
                  child: saving
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(isEdit ? 'Save Changes' : 'Add Date'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<ImportantDateItem> _filteredItems(ImportantDatesPayload payload) {
    final q = _searchCtrl.text.trim().toLowerCase();
    return payload.items.where((item) {
      if (_selectedCategory != 'ALL' && item.category != _selectedCategory) {
        return false;
      }
      if (_urgencyFilter != 'ALL' && item.urgency != _urgencyFilter) {
        return false;
      }
      if (q.isNotEmpty) {
        final hay =
            '${item.title} ${item.shortCode} ${item.portalName} ${item.instructions} ${item.periodLabel} ${item.referenceNo ?? ''}'
                .toLowerCase();
        if (!hay.contains(q)) return false;
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final payload = _payload;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Important Dates'),
            Text(
              payload != null
                  ? 'FY ${payload.financialYear} • ${payload.profile.gstFilingFrequency} GST'
                  : 'Statutory Compliance Calendar',
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w500,
                color: AppleColors.inkMuted,
              ),
            ),
          ],
        ),
        actions: [
          if (payload != null && payload.availableFYs.isNotEmpty)
            PopupMenuButton<String>(
              tooltip: 'Select Financial Year',
              onSelected: (fy) => _load(fy: fy),
              itemBuilder: (_) => [
                for (final fy in payload.availableFYs)
                  PopupMenuItem(
                    value: fy,
                    child: Text(
                      fy == payload.currentFinancialYear
                          ? 'FY $fy (Current)'
                          : 'FY $fy',
                      style: TextStyle(
                        fontWeight: fy == payload.financialYear
                            ? FontWeight.w700
                            : FontWeight.w500,
                      ),
                    ),
                  ),
              ],
              child: Container(
                margin: const EdgeInsets.symmetric(vertical: 10),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppleColors.blueSoft,
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'FY ${payload.financialYear}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: AppleColors.blue,
                      ),
                    ),
                    const Icon(
                      Icons.arrow_drop_down_rounded,
                      size: 18,
                      color: AppleColors.blue,
                    ),
                  ],
                ),
              ),
            ),
          IconButton(
            tooltip: 'Company Compliance Setup',
            onPressed: _showSetupSheet,
            icon: const Icon(Icons.tune_rounded),
          ),
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => _load(),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCustomDateSheet(),
        backgroundColor: AppleColors.blue,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Custom Date'),
      ),
      body: _loading && payload == null
          ? const Center(child: CircularProgressIndicator())
          : _error != null && payload == null
              ? AppleEmptyState(
                  icon: Icons.error_outline_rounded,
                  title: 'Failed to load Important Dates',
                  subtitle: _error!,
                  actionLabel: 'Retry',
                  onAction: () => _load(),
                )
              : payload == null
                  ? const SizedBox.shrink()
                  : _buildBody(payload),
    );
  }

  Widget _buildBody(ImportantDatesPayload payload) {
    final items = _filteredItems(payload);
    final profile = payload.profile;
    final summary = payload.summary;

    final categories = <String>[
      'ALL',
      'POST_INCORP',
      'GST',
      'MCA_ROC',
      'INCOME_TAX',
      if (profile.pfEsicApplicable) 'PF_ESIC',
      'CUSTOM',
    ];

    return RefreshIndicator(
      onRefresh: () => _load(),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 96),
        children: [
          // Setup Strip / Prompt
          AppleCard(
            padding: const EdgeInsets.all(14),
            onTap: _showSetupSheet,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: profile.incorporationDate == null
                        ? AppleColors.blueSoft
                        : AppleColors.greenSoft,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    profile.incorporationDate == null
                        ? Icons.event_note_rounded
                        : Icons.verified_rounded,
                    color: profile.incorporationDate == null
                        ? AppleColors.blue
                        : AppleColors.green,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profile.incorporationDate == null
                            ? 'Set Company Incorporation Date'
                            : 'DOI: ${_formatDate(profile.incorporationDate)} • ${profile.companyType.replaceAll('_', ' ')}',
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: AppleColors.inkPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        profile.incorporationDate == null
                            ? 'Tap to auto-calculate INC-20A, MCA/ROC, GST & ITR dates'
                            : 'GST: ${profile.gstFilingFrequency} • PF/ESIC: ${profile.pfEsicApplicable ? "On" : "Off"} • Tap to edit',
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: AppleColors.inkSecondary,
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
          ),
          const SizedBox(height: 12),

          // 4 Tappable KPI Mini Cards
          Row(
            children: [
              _MiniKpi(
                label: 'Overdue',
                count: summary.overdue,
                color: AppleColors.red,
                bg: AppleColors.redSoft,
                active: _urgencyFilter == 'OVERDUE',
                onTap: () => setState(() {
                  _urgencyFilter =
                      _urgencyFilter == 'OVERDUE' ? 'ALL' : 'OVERDUE';
                }),
              ),
              const SizedBox(width: 8),
              _MiniKpi(
                label: '≤15 Days',
                count: summary.dueSoon,
                color: AppleColors.amber,
                bg: AppleColors.amberSoft,
                active: _urgencyFilter == 'DUE_SOON',
                onTap: () => setState(() {
                  _urgencyFilter =
                      _urgencyFilter == 'DUE_SOON' ? 'ALL' : 'DUE_SOON';
                }),
              ),
              const SizedBox(width: 8),
              _MiniKpi(
                label: 'Upcoming',
                count: summary.upcoming,
                color: AppleColors.blue,
                bg: AppleColors.blueSoft,
                active: _urgencyFilter == 'UPCOMING',
                onTap: () => setState(() {
                  _urgencyFilter =
                      _urgencyFilter == 'UPCOMING' ? 'ALL' : 'UPCOMING';
                }),
              ),
              const SizedBox(width: 8),
              _MiniKpi(
                label: 'Filed',
                count: summary.filed,
                color: AppleColors.green,
                bg: AppleColors.greenSoft,
                active: _urgencyFilter == 'FILED',
                onTap: () => setState(() {
                  _urgencyFilter = _urgencyFilter == 'FILED' ? 'ALL' : 'FILED';
                }),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Search Box
          TextField(
            controller: _searchCtrl,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search GSTR-3B, INC-20A, DIR-3 KYC, TDS, ITR-6...',
              prefixIcon: const Icon(Icons.search_rounded, size: 19),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close_rounded, size: 18),
                      onPressed: () {
                        _searchCtrl.clear();
                        setState(() {});
                      },
                    )
                  : null,
            ),
          ),
          const SizedBox(height: 10),

          // Category Chips
          SizedBox(
            height: 38,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (_, idx) {
                final cat = categories[idx];
                final selected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(_categoryLabel(cat)),
                  selected: selected,
                  onSelected: (_) => setState(() => _selectedCategory = cat),
                  selectedColor: AppleColors.inkPrimary,
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: selected ? Colors.white : AppleColors.inkPrimary,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          if (items.isEmpty)
            const AppleEmptyState(
              icon: Icons.event_available_rounded,
              title: 'No matching compliances',
              subtitle:
                  'Try clearing your search or switching category/urgency filters.',
            )
          else
            for (final item in items) ...[
              _buildComplianceCard(item),
              const SizedBox(height: 10),
            ],
        ],
      ),
    );
  }

  Widget _buildComplianceCard(ImportantDateItem item) {
    final isOverdue = item.urgency == 'OVERDUE';
    final isDueSoon = item.urgency == 'DUE_SOON';
    final isFiled = item.urgency == 'FILED';
    final isNa = item.urgency == 'NOT_APPLICABLE';

    final Color accentColor = isOverdue
        ? AppleColors.red
        : isDueSoon
            ? AppleColors.amber
            : isFiled
                ? AppleColors.green
                : isNa
                    ? AppleColors.inkMuted
                    : AppleColors.blue;

    final Color softBg = isOverdue
        ? AppleColors.redSoft
        : isDueSoon
            ? AppleColors.amberSoft
            : isFiled
                ? AppleColors.greenSoft
                : isNa
                    ? AppleColors.canvas
                    : AppleColors.blueSoft;

    return AppleCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Due Date Badge
              Container(
                width: 54,
                padding: const EdgeInsets.symmetric(vertical: 7),
                decoration: BoxDecoration(
                  color: accentColor,
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Column(
                  children: [
                    Text(
                      item.dueDate.length >= 10
                          ? _months[(int.tryParse(item.dueDate.substring(5, 7)) ?? 1)
                                  .clamp(1, 12) -
                              1]
                              .toUpperCase()
                          : '',
                      style: const TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        color: Colors.white70,
                      ),
                    ),
                    Text(
                      item.dueDate.length >= 10
                          ? item.dueDate.substring(8, 10)
                          : '--',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.1,
                      ),
                    ),
                    Text(
                      item.dueDate.length >= 4
                          ? item.dueDate.substring(0, 4)
                          : '',
                      style: const TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w600,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        AppleBadge(
                          label: _countdownLabel(item),
                          background: softBg,
                          foreground: accentColor,
                        ),
                        AppleBadge(
                          label: item.shortCode,
                          background: AppleColors.canvas,
                          foreground: AppleColors.inkPrimary,
                        ),
                        if (item.priority == 'CRITICAL' && !isFiled && !isNa)
                          const AppleBadge(
                            label: 'CRITICAL',
                            background: AppleColors.redSoft,
                            foreground: AppleColors.red,
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.title,
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: AppleColors.inkPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.periodLabel,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppleColors.inkMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // What to Do (KYA)
          Text(
            item.instructions,
            style: const TextStyle(
              fontSize: 12.5,
              height: 1.4,
              color: AppleColors.inkSecondary,
            ),
          ),
          const SizedBox(height: 10),

          // Where / Portal Pill (KAHA)
          InkWell(
            borderRadius: BorderRadius.circular(10),
            onTap: item.portalUrl != null ? () => _openPortal(item.portalUrl) : null,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: AppleColors.canvas,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppleColors.border),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.public_rounded,
                    size: 15,
                    color: AppleColors.blue,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Where: ${item.portalName}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: item.portalUrl != null
                            ? AppleColors.blue
                            : AppleColors.inkPrimary,
                      ),
                    ),
                  ),
                  if (item.portalUrl != null)
                    const Icon(
                      Icons.open_in_new_rounded,
                      size: 14,
                      color: AppleColors.blue,
                    ),
                ],
              ),
            ),
          ),

          // Penalty Note
          if (item.penaltyNote != null &&
              item.penaltyNote!.isNotEmpty &&
              !isFiled &&
              !isNa) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: AppleColors.amberSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    size: 15,
                    color: AppleColors.amber,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      item.penaltyNote!,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppleColors.amber,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Reference No. / Notes
          if ((item.referenceNo != null && item.referenceNo!.isNotEmpty) ||
              (item.notes != null && item.notes!.isNotEmpty)) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: AppleColors.greenSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                [
                  if (item.referenceNo != null && item.referenceNo!.isNotEmpty)
                    'Ref/SRN: ${item.referenceNo}',
                  if (item.notes != null && item.notes!.isNotEmpty)
                    'Note: ${item.notes}',
                ].join(' • '),
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: AppleColors.green,
                ),
              ),
            ),
          ],

          const SizedBox(height: 10),
          const Divider(height: 1),
          const SizedBox(height: 8),

          // Action Buttons Row
          Row(
            children: [
              Expanded(
                child: FilledButton.tonalIcon(
                  style: FilledButton.styleFrom(
                    backgroundColor:
                        isFiled ? AppleColors.greenSoft : AppleColors.blueSoft,
                    foregroundColor:
                        isFiled ? AppleColors.green : AppleColors.blue,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  onPressed: () => _showStatusSheet(item),
                  icon: const Icon(Icons.check_circle_outline_rounded, size: 17),
                  label: Text(
                    isFiled ? 'Update Filing' : 'Mark Filed',
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                tooltip: 'Share / WhatsApp CA Reminder',
                style: IconButton.styleFrom(
                  backgroundColor: AppleColors.greenSoft,
                  foregroundColor: AppleColors.green,
                ),
                onPressed: () => _shareReminder(item),
                icon: const Icon(Icons.share_rounded, size: 18),
              ),
              if (item.isCustom) ...[
                const SizedBox(width: 4),
                IconButton(
                  tooltip: 'Edit Custom Date',
                  style: IconButton.styleFrom(
                    backgroundColor: AppleColors.canvas,
                    foregroundColor: AppleColors.inkPrimary,
                  ),
                  onPressed: () => _showCustomDateSheet(existing: item),
                  icon: const Icon(Icons.edit_outlined, size: 18),
                ),
                if (widget.user.isFullAdmin && item.customId != null) ...[
                  const SizedBox(width: 4),
                  IconButton(
                    tooltip: 'Permanent Delete (Super Admin)',
                    style: IconButton.styleFrom(
                      backgroundColor: AppleColors.redSoft,
                      foregroundColor: AppleColors.red,
                    ),
                    onPressed: () => confirmSuperAdminDelete(
                      context,
                      label: 'custom date "${item.title}"',
                      onDelete: () async {
                        await widget.erpRepository
                            .deleteCustomImportantDate(item.customId!);
                        await _load();
                      },
                    ),
                    icon: const Icon(Icons.delete_outline_rounded, size: 18),
                  ),
                ],
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniKpi extends StatelessWidget {
  const _MiniKpi({
    required this.label,
    required this.count,
    required this.color,
    required this.bg,
    required this.active,
    required this.onTap,
  });

  final String label;
  final int count;
  final Color color;
  final Color bg;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
          decoration: BoxDecoration(
            color: active ? bg : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: active ? color : AppleColors.border,
              width: active ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Text(
                '$count',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: AppleColors.inkSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
