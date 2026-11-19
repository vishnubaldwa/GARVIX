import 'package:material_ui/material_ui.dart';

import '../../../../data/repositories/crm_repository.dart';
import '../../../../data/repositories/dashboard_repository.dart';
import '../../../../data/repositories/team_repository.dart';
import '../../../../data/repositories/vault_repository.dart';
import '../../../../domain/models/auth_user.dart';
import '../../billing/view_models/billing_view_model.dart';
import '../../billing/views/billing_screen.dart';
import '../../dashboard/view_models/dashboard_view_model.dart';
import '../../dashboard/views/dashboard_screen.dart';
import '../../leads/view_models/leads_view_model.dart';
import '../../leads/views/leads_screen.dart';
import '../../team/view_models/team_view_model.dart';
import '../../team/views/more_and_team_screen.dart';
import '../../vault/view_models/vault_view_model.dart';
import '../../vault/views/vault_screen.dart';

class _NavTab {
  const _NavTab({
    required this.key,
    required this.label,
    required this.icon,
    required this.selectedIcon,
    required this.page,
  });

  final String key;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final Widget page;
}

class AdminShellScreen extends StatefulWidget {
  const AdminShellScreen({
    super.key,
    required this.user,
    required this.serverUrl,
    required this.dashboardRepository,
    required this.vaultRepository,
    required this.crmRepository,
    required this.teamRepository,
    required this.onSignOut,
  });

  final AuthUser user;
  final String serverUrl;
  final DashboardRepository dashboardRepository;
  final VaultRepository vaultRepository;
  final CrmRepository crmRepository;
  final TeamRepository teamRepository;
  final VoidCallback onSignOut;

  @override
  State<AdminShellScreen> createState() => _AdminShellScreenState();
}

class _AdminShellScreenState extends State<AdminShellScreen> {
  late final DashboardViewModel _dashboardVm;
  late final VaultViewModel _vaultVm;
  late final LeadsViewModel _leadsVm;
  late final BillingViewModel _billingVm;
  late final TeamViewModel _teamVm;

  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _dashboardVm = DashboardViewModel(repository: widget.dashboardRepository);
    _vaultVm = VaultViewModel(repository: widget.vaultRepository);
    _leadsVm = LeadsViewModel(repository: widget.crmRepository);
    _billingVm = BillingViewModel(repository: widget.crmRepository);
    _teamVm = TeamViewModel(repository: widget.teamRepository);
  }

  @override
  void dispose() {
    _dashboardVm.dispose();
    _vaultVm.dispose();
    _leadsVm.dispose();
    _billingVm.dispose();
    _teamVm.dispose();
    super.dispose();
  }

  List<_NavTab> _buildTabs() {
    final tabs = <_NavTab>[];

    if (!widget.user.isDocumentViewerOnly) {
      tabs.add(
        _NavTab(
          key: 'overview',
          label: 'Overview',
          icon: Icons.grid_view_outlined,
          selectedIcon: Icons.grid_view_rounded,
          page: DashboardScreen(
            viewModel: _dashboardVm,
            user: widget.user,
            onNavigateTab: _selectTabByKey,
          ),
        ),
      );
    }

    if (widget.user.canViewVault) {
      tabs.add(
        _NavTab(
          key: 'vault',
          label: 'Vault',
          icon: Icons.folder_shared_outlined,
          selectedIcon: Icons.folder_shared_rounded,
          page: VaultScreen(
            viewModel: _vaultVm,
            user: widget.user,
            onSignOut: widget.user.isDocumentViewerOnly ? widget.onSignOut : null,
          ),
        ),
      );
    }

    if (widget.user.canViewLeads && !widget.user.isDocumentViewerOnly) {
      tabs.add(
        _NavTab(
          key: 'leads',
          label: 'Leads',
          icon: Icons.people_outline_rounded,
          selectedIcon: Icons.people_rounded,
          page: LeadsScreen(viewModel: _leadsVm),
        ),
      );
    }

    if (widget.user.canViewBilling && !widget.user.isDocumentViewerOnly) {
      tabs.add(
        _NavTab(
          key: 'billing',
          label: 'Billing',
          icon: Icons.receipt_long_outlined,
          selectedIcon: Icons.receipt_long_rounded,
          page: BillingScreen(viewModel: _billingVm),
        ),
      );
    }

    if (!widget.user.isDocumentViewerOnly) {
      tabs.add(
        _NavTab(
          key: 'more',
          label: 'Team',
          icon: Icons.person_outline_rounded,
          selectedIcon: Icons.person_rounded,
          page: MoreAndTeamScreen(
            user: widget.user,
            serverUrl: widget.serverUrl,
            viewModel: _teamVm,
            onSignOut: widget.onSignOut,
          ),
        ),
      );
    }

    return tabs;
  }

  void _selectTabByKey(String key) {
    final tabs = _buildTabs();
    final idx = tabs.indexWhere((t) => t.key == key);
    if (idx != -1) {
      setState(() => _currentIndex = idx);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tabs = _buildTabs();
    if (tabs.isEmpty) {
      return Scaffold(
        body: Center(
          child: FilledButton(
            onPressed: widget.onSignOut,
            child: const Text('No permissions assigned. Sign Out'),
          ),
        ),
      );
    }

    final safeIndex = _currentIndex.clamp(0, tabs.length - 1);

    // Banker / External Document Viewer sees ONLY the clean Vault screen (no bottom bar)
    if (tabs.length == 1) {
      return tabs.first.page;
    }

    return Scaffold(
      body: IndexedStack(
        index: safeIndex,
        children: tabs.map((t) => t.page).toList(),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0x14000000))),
        ),
        child: NavigationBar(
          selectedIndex: safeIndex,
          onDestinationSelected: (i) => setState(() => _currentIndex = i),
          destinations: tabs
              .map(
                (t) => NavigationDestination(
                  icon: Icon(t.icon),
                  selectedIcon: Icon(t.selectedIcon),
                  label: t.label,
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}
