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

  Future<void> toggleEmployeeStatus({
    required String id,
    required bool isActive,
  }) async {
    await _apiClient.post(
      '/api/admin/employees/toggle-status',
      body: {'id': id, 'isActive': isActive},
    );
  }

  Future<List<RoleItem>> fetchRoles() async {
    final data = await _apiClient.get('/api/admin/roles');
    return ((data['roles'] as List?) ?? const [])
        .map((e) => RoleItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
