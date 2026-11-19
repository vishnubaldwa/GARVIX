import 'package:flutter/foundation.dart';

import '../../../../data/repositories/crm_repository.dart';
import '../../../../domain/models/crm_models.dart';

class LeadsViewModel extends ChangeNotifier {
  LeadsViewModel({required this._repository});

  final CrmRepository _repository;

  List<LeadItem> _leads = const [];
  List<LeadItem> get leads => _leads;

  String _statusFilter = 'ALL';
  String get statusFilter => _statusFilter;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> load({String? status}) async {
    if (status != null) _statusFilter = status;
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _leads = await _repository.fetchLeads(status: _statusFilter);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateStatus(String leadId, String status) async {
    await _repository.updateLeadStatus(leadId: leadId, status: status);
    await load();
  }
}
