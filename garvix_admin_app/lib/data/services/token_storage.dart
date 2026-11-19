import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _tokenKey = 'garvix_jwt_token';
  static const _baseUrlKey = 'garvix_base_url';
  static const defaultBaseUrl = 'https://garvix.in';

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  Future<void> clearToken() => _storage.delete(key: _tokenKey);

  Future<String> readBaseUrl() async {
    final stored = await _storage.read(key: _baseUrlKey);
    if (stored == null || stored.trim().isEmpty) return defaultBaseUrl;
    return stored.trim().replaceAll(RegExp(r'/+$'), '');
  }

  Future<void> saveBaseUrl(String url) => _storage.write(
        key: _baseUrlKey,
        value: url.trim().replaceAll(RegExp(r'/+$'), ''),
      );
}
