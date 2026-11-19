import 'dart:io';

import 'package:flutter/foundation.dart';

import '../../../../data/repositories/vault_repository.dart';
import '../../../../domain/models/vault_models.dart';

class VaultViewModel extends ChangeNotifier {
  VaultViewModel({required this._repository});

  final VaultRepository _repository;

  VaultDataPayload? _vault;
  VaultDataPayload? get vault => _vault;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isBusy = false;
  bool get isBusy => _isBusy;

  String? _error;
  String? get error => _error;

  String _selectedFolderId = 'ALL';
  String get selectedFolderId => _selectedFolderId;

  String _searchQuery = '';
  String get searchQuery => _searchQuery;

  String _baseUrl = 'https://garvix.in';
  String get baseUrl => _baseUrl;

  void selectFolder(String folderId) {
    _selectedFolderId = folderId;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  List<VaultFolder> get folders => _vault?.folders ?? const [];
  bool get canManage => _vault?.canManage ?? false;

  VaultFolder? get selectedFolder {
    if (_selectedFolderId == 'ALL') return null;
    for (final f in folders) {
      if (f.id == _selectedFolderId) return f;
    }
    return null;
  }

  List<({VaultDocument doc, String folderName})> get filteredDocuments {
    final list = <({VaultDocument doc, String folderName})>[];
    if (_selectedFolderId == 'ALL') {
      for (final f in folders) {
        for (final d in f.documents) {
          list.add((doc: d, folderName: f.name));
        }
      }
    } else {
      final folder = selectedFolder;
      if (folder != null) {
        for (final d in folder.documents) {
          list.add((doc: d, folderName: folder.name));
        }
      }
    }

    final q = _searchQuery.trim().toLowerCase();
    if (q.isEmpty) return list;
    return list.where((entry) {
      return entry.doc.title.toLowerCase().contains(q) ||
          entry.doc.originalName.toLowerCase().contains(q) ||
          entry.folderName.toLowerCase().contains(q);
    }).toList();
  }

  Future<void> load() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _baseUrl = await _repository.getBaseUrl();
      _vault = await _repository.fetchVault();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> uploadFiles({
    required String folderId,
    required List<File> files,
    String? title,
    String? notes,
  }) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.uploadDocuments(
        folderId: folderId,
        files: files,
        title: title,
        notes: notes,
      );
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> createFolder({required String name, String? description}) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.createFolder(name: name, description: description);
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> renameFolder({
    required String folderId,
    required String name,
    String? description,
  }) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.renameFolder(
        folderId: folderId,
        name: name,
        description: description,
      );
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> deleteDocument(String docId) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.deleteDocument(docId);
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> deleteFolder(String folderId) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.deleteFolder(folderId);
      if (_selectedFolderId == folderId) {
        _selectedFolderId = 'ALL';
      }
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<File> downloadDocument(VaultDocument doc) async {
    _isBusy = true;
    notifyListeners();
    try {
      return await _repository.downloadDocument(doc);
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<List<int>> fetchPreviewBytes(VaultDocument doc) =>
      _repository.fetchDocumentPreviewBytes(doc);

  Future<File> downloadZip({String? folderId, String? folderName}) async {
    _isBusy = true;
    notifyListeners();
    try {
      return await _repository.downloadZip(
        folderId: folderId,
        folderName: folderName,
      );
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> createVaultUser({
    required String name,
    required String username,
    required String password,
    required String role,
    int? expiresInDays,
    required List<String> folderIds,
  }) async {
    _isBusy = true;
    notifyListeners();
    try {
      final result = await _repository.createVaultUser(
        name: name,
        username: username,
        password: password,
        role: role,
        expiresInDays: expiresInDays,
        folderIds: folderIds,
      );
      await load();
      return result;
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> toggleUserActive(VaultUserAccount user) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.updateUserAccess(
        userId: user.id,
        isActive: !user.isActive,
      );
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> createShareLink({
    required String label,
    String? recipient,
    String? pin,
    required int expiresInHours,
    required List<String> folderIds,
  }) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.createShareLink(
        label: label,
        recipient: recipient,
        pin: pin,
        expiresInHours: expiresInHours,
        folderIds: folderIds,
      );
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }

  Future<void> revokeShareLink(String shareId) async {
    _isBusy = true;
    notifyListeners();
    try {
      await _repository.revokeShareLink(shareId);
      await load();
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
}
