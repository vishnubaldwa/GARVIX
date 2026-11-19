import '../../domain/models/dashboard_data.dart';
import '../services/api_client.dart';

class DashboardRepository {
  DashboardRepository({required this._apiClient});

  final ApiClient _apiClient;

  Future<DashboardPayload> fetchDashboard() async {
    final data = await _apiClient.get('/api/admin/dashboard');
    return DashboardPayload.fromJson(data);
  }
}
