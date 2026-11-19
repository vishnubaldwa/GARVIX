import '../../domain/models/auth_user.dart';
import '../services/api_client.dart';
import '../services/token_storage.dart';

class AuthRepository {
  AuthRepository({
    required this._apiClient,
    required this._tokenStorage,
  });

  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;

  Future<AuthUser> login({
    required String username,
    required String password,
  }) async {
    final data = await _apiClient.post(
      '/api/admin/auth/login',
      body: {
        'username': username.trim(),
        'password': password,
      },
    );

    final token = (data['token'] ?? '').toString();
    if (token.isEmpty) {
      throw const ApiException('Authentication token missing from server response.');
    }

    await _tokenStorage.saveToken(token);
    return AuthUser.fromJson(
      (data['user'] as Map<String, dynamic>?) ?? const {},
    );
  }

  Future<AuthUser?> restoreSession() async {
    final token = await _tokenStorage.readToken();
    if (token == null || token.isEmpty) return null;

    try {
      final data = await _apiClient.get('/api/admin/auth/me');
      return AuthUser.fromJson(
        (data['user'] as Map<String, dynamic>?) ?? const {},
      );
    } catch (_) {
      await _tokenStorage.clearToken();
      return null;
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/api/admin/auth/logout');
    } catch (_) {
      // Clear local credentials even if offline
    }
    await _tokenStorage.clearToken();
  }

  Future<String> getBaseUrl() => _tokenStorage.readBaseUrl();

  Future<void> saveBaseUrl(String url) => _tokenStorage.saveBaseUrl(url);
}
