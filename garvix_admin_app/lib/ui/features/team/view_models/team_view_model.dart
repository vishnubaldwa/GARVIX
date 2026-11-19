import 'package:flutter/foundation.dart';

import '../../../../data/repositories/team_repository.dart';
import '../../../../domain/models/crm_models.dart';

class TeamViewModel extends ChangeNotifier {
  TeamViewModel({required this._repository});

  final TeamRepository _repository;

  List<EmployeeItem> _employees = const [];
  List<EmployeeItem> get employees => _employees;

  List<RoleItem> _roles = const [];
  List<RoleItem> get roles => _roles;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> load() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _repository.fetchEmployees().catchError((_) => <EmployeeItem>[]),
        _repository.fetchRoles().catchError((_) => <RoleItem>[]),
      ]);
      _employees = results[0] as List<EmployeeItem>;
      _roles = results[1] as List<RoleItem>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleActive(EmployeeItem emp) async {
    await _repository.toggleEmployeeStatus(
      id: emp.id,
      isActive: !emp.isActive,
    );
    await load();
  }
}
