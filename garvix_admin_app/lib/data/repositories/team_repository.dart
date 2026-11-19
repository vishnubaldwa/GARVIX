import '../../domain/models/crm_models.dart';
import '../services/api_client.dart';

class TeamRepository {
  TeamRepository({required this._apiClient});

  final ApiClient _apiClient;

  Future<List<EmployeeItem>> fetchEmployees() async {
    final data = await _apiClient.get('/api/admin/employees');
    return ((data['employees'] as List?) ?? const [])
        .map((e) => EmployeeItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createEmployee({
    required String name,
    required String username,
    required String role,
    String? phone,
    required String password,
  }) async {
    await _apiClient.post(
      '/api/admin/employees',
      body: {
        'name': name,
        'username': username,
        'role': role,
        'phone': phone,
        'password': password,
      },
    );
  }

  Future<void> updateEmployee({
    required String id,
    required String name,
    required String role,
    String? phone,
    required bool isActive,
  }) async {
    await _apiClient.patch(
      '/api/admin/employees',
      body: {
        'id': id,
        'name': name,
        'role': role,
        'phone': phone,
        'isActive': isActive,
      },
    );
  }

  Future<void> resetEmployeePassword({
    required String id,
    required String newPassword,
  }) async {
    await _apiClient.post(
      '/api/admin/employees/reset-password',
      body: {'id': id, 'newPassword': newPassword},
    );
  }

  Future<void> toggleEmployeeStatus({
    required String id,
    required bool isActive,
  }) async {
    await _apiClient.post(
      '/api/admin/employees/toggle-status',
      body: {'id': id, 'isActive': isActive},
    );
  }

  Future<void> deleteEmployee(String id) async {
    await _apiClient.delete('/api/admin/employees?id=${Uri.encodeComponent(id)}');
  }

  Future<List<RoleItem>> fetchRoles() async {
    final data = await _apiClient.get('/api/admin/roles');
    return ((data['roles'] as List?) ?? const [])
        .map((e) => RoleItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createRole({
    required String displayName,
    String? description,
    required List<String> permissions,
  }) async {
    await _apiClient.post(
      '/api/admin/roles',
      body: {
        'displayName': displayName,
        'description': description,
        'permissions': permissions,
      },
    );
  }

  Future<void> updateRolePermissions({
    required String id,
    required List<String> permissions,
    String? displayName,
    String? description,
  }) async {
    await _apiClient.patch(
      '/api/admin/roles/$id',
      body: {
        'permissions': permissions,
        'displayName': ?displayName,
        'description': ?description,
      },
    );
  }

  Future<void> deleteRole(String id) async {
    await _apiClient.delete('/api/admin/roles/$id');
  }
}
