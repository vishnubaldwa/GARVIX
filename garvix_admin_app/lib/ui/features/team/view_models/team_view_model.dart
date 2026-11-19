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

  bool _isMutating = false;
  bool get isMutating => _isMutating;

  String? _error;
  String? get error => _error;

  Future<void> loadAll() async {
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

  Future<void> createEmployee({
    required String name,
    required String username,
    required String role,
    String? phone,
    required String password,
  }) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _repository.createEmployee(
        name: name,
        username: username,
        role: role,
        phone: phone,
        password: password,
      );
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> updateEmployee({
    required String id,
    required String name,
    required String role,
    String? phone,
    required bool isActive,
  }) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _repository.updateEmployee(
        id: id,
        name: name,
        role: role,
        phone: phone,
        isActive: isActive,
      );
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> resetPassword({
    required String id,
    required String newPassword,
  }) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _repository.resetEmployeePassword(id: id, newPassword: newPassword);
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> toggleEmployee(EmployeeItem emp) async {
    await _repository.toggleEmployeeStatus(id: emp.id, isActive: !emp.isActive);
    await loadAll();
  }

  Future<void> deleteEmployee(String id) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _repository.deleteEmployee(id);
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> createRole({
    required String displayName,
    String? description,
    required List<String> permissions,
  }) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _repository.createRole(
        displayName: displayName,
        description: description,
        permissions: permissions,
      );
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> updateRolePermissions({
    required String id,
    required List<String> permissions,
  }) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _repository.updateRolePermissions(id: id, permissions: permissions);
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> deleteRole(String id) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _repository.deleteRole(id);
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }
}
