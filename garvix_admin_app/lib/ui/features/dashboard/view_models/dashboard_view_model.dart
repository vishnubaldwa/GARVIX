import 'package:flutter/foundation.dart';

import '../../../../data/repositories/dashboard_repository.dart';
import '../../../../domain/models/dashboard_data.dart';

class DashboardViewModel extends ChangeNotifier {
  DashboardViewModel({required this._repository});

  final DashboardRepository _repository;

  DashboardPayload? _data;
  DashboardPayload? get data => _data;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> load() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _data = await _repository.fetchDashboard();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
