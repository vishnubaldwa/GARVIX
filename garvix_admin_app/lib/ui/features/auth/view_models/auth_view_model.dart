import 'package:flutter/foundation.dart';

import '../../../../data/repositories/auth_repository.dart';
import '../../../../domain/models/auth_user.dart';

class AuthViewModel extends ChangeNotifier {
  AuthViewModel({required this._authRepository});

  final AuthRepository _authRepository;

  AuthUser? _user;
  AuthUser? get user => _user;

  bool _isInitializing = true;
  bool get isInitializing => _isInitializing;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  String _serverUrl = 'https://garvix.in';
  String get serverUrl => _serverUrl;

  Future<void> initialize() async {
    _isInitializing = true;
    notifyListeners();
    try {
      _serverUrl = await _authRepository.getBaseUrl();
      _user = await _authRepository.restoreSession();
    } finally {
      _isInitializing = false;
      notifyListeners();
    }
  }

  Future<bool> signIn({
    required String username,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _user = await _authRepository.login(
        username: username,
        password: password,
      );
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateServerUrl(String url) async {
    await _authRepository.saveBaseUrl(url);
    _serverUrl = await _authRepository.getBaseUrl();
    notifyListeners();
  }

  Future<void> signOut() async {
    await _authRepository.logout();
    _user = null;
    _error = null;
    notifyListeners();
  }
}
