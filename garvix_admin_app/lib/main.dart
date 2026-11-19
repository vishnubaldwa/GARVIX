import 'package:material_ui/material_ui.dart';

import 'data/repositories/auth_repository.dart';
import 'data/repositories/crm_repository.dart';
import 'data/repositories/dashboard_repository.dart';
import 'data/repositories/erp_repository.dart';
import 'data/repositories/team_repository.dart';
import 'data/repositories/vault_repository.dart';
import 'data/services/api_client.dart';
import 'data/services/token_storage.dart';
import 'ui/core/theme/apple_theme.dart';
import 'ui/features/auth/view_models/auth_view_model.dart';
import 'ui/features/auth/views/login_screen.dart';
import 'ui/features/shell/views/admin_shell_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GarvixAdminApp());
}

class GarvixAdminApp extends StatefulWidget {
  const GarvixAdminApp({super.key});

  @override
  State<GarvixAdminApp> createState() => _GarvixAdminAppState();
}

class _GarvixAdminAppState extends State<GarvixAdminApp> {
  late final TokenStorage _tokenStorage;
  late final ApiClient _apiClient;
  late final AuthRepository _authRepository;
  late final DashboardRepository _dashboardRepository;
  late final VaultRepository _vaultRepository;
  late final CrmRepository _crmRepository;
  late final ErpRepository _erpRepository;
  late final TeamRepository _teamRepository;
  late final AuthViewModel _authViewModel;

  @override
  void initState() {
    super.initState();
    _tokenStorage = TokenStorage();
    _apiClient = ApiClient(tokenStorage: _tokenStorage);
    _authRepository = AuthRepository(
      apiClient: _apiClient,
      tokenStorage: _tokenStorage,
    );
    _dashboardRepository = DashboardRepository(apiClient: _apiClient);
    _vaultRepository = VaultRepository(apiClient: _apiClient);
    _crmRepository = CrmRepository(apiClient: _apiClient);
    _erpRepository = ErpRepository(apiClient: _apiClient);
    _teamRepository = TeamRepository(apiClient: _apiClient);
    _authViewModel = AuthViewModel(authRepository: _authRepository)..initialize();
  }

  @override
  void dispose() {
    _authViewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GARVIX ERP',
      debugShowCheckedModeBanner: false,
      theme: buildAppleTheme(),
      home: ListenableBuilder(
        listenable: _authViewModel,
        builder: (context, _) {
          if (_authViewModel.isInitializing) {
            return const Scaffold(
              backgroundColor: AppleColors.canvas,
              body: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: AppleColors.blue),
                    SizedBox(height: 16),
                    Text(
                      'GARVIX ERP',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppleColors.inkPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final user = _authViewModel.user;
          if (user == null) {
            return LoginScreen(viewModel: _authViewModel);
          }

          return AdminShellScreen(
            user: user,
            serverUrl: _authViewModel.serverUrl,
            dashboardRepository: _dashboardRepository,
            vaultRepository: _vaultRepository,
            crmRepository: _crmRepository,
            erpRepository: _erpRepository,
            teamRepository: _teamRepository,
            onSignOut: _authViewModel.signOut,
          );
        },
      ),
    );
  }
}
