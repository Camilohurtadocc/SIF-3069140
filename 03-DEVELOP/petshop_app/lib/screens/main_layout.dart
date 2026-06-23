import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../theme/app_theme.dart';
import 'dashboard_screen.dart';
import 'statistics_screen.dart';
import 'products_screen.dart';
import 'receipts_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    ProductsScreen(),
    StatisticsScreen(),
    ReceiptsScreen(),
  ];

  final List<String> _titles = [
    'PetShop Manager',
    'Productos',
    'Estadisticas',
    'Recibos',
  ];

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final products = provider.products;

    // Calculate notifications
    int notificationCount = 0;
    for (var product in products) {
      if (product.stock == 0 || product.stock < 10) {
        notificationCount++;
      }
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFF8FAFC), Color(0xFFE0F2FE)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Top Header
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2563EB), Color(0xFF06B6D4)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Image.asset(
                            'assets/img/logos/Logo_B.png',
                            fit: BoxFit.contain,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _titles[_currentIndex],
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const Text(
                              'Sistema de Inventario',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        // Notifications
                        Stack(
                          children: [
                            IconButton(
                              icon: const Icon(
                                Icons.notifications,
                                color: Colors.white,
                              ),
                              onPressed: () {
                                _showNotifications(context, products);
                              },
                            ),
                            if (notificationCount > 0)
                              Positioned(
                                right: 8,
                                top: 8,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Text(
                                    notificationCount > 9
                                        ? '9+'
                                        : '$notificationCount',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        // Logout
                        IconButton(
                          icon: const Icon(Icons.logout, color: Colors.white),
                          onPressed: () {
                            _showLogoutDialog(context);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Main Content
              Expanded(child: _screens[_currentIndex]),

              // Bottom Navigation
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 20,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: BottomNavigationBar(
                  currentIndex: _currentIndex,
                  onTap: (index) => setState(() => _currentIndex = index),
                  type: BottomNavigationBarType.fixed,
                  backgroundColor: Colors.white,
                  selectedItemColor: AppTheme.primaryBlue,
                  unselectedItemColor: AppTheme.textLight,
                  selectedLabelStyle: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                  unselectedLabelStyle: const TextStyle(fontSize: 10),
                  items: const [
                    BottomNavigationBarItem(
                      icon: Icon(Icons.dashboard),
                      label: 'Inicio',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.inventory_2),
                      label: 'Productos',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.trending_up),
                      label: 'Estadisticas',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.receipt_long),
                      label: 'Recibos',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showNotifications(BuildContext context, List products) {
    final lowStockProducts = products.where((p) => p.stock < 10).toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF06B6D4)],
                ),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.notifications, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        'Notificaciones',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${lowStockProducts.length}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: lowStockProducts.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.check_circle,
                            size: 60,
                            color: AppTheme.success,
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Todo en orden!',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 18,
                            ),
                          ),
                          Text(
                            'No hay alertas pendientes',
                            style: TextStyle(color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: lowStockProducts.length,
                      itemBuilder: (context, index) {
                        final product = lowStockProducts[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: product.stock == 0
                                ? const Color(0xFFFEE2E2)
                                : const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: product.stock == 0
                                  ? const Color(0xFFFECACA)
                                  : const Color(0xFFFDE68A),
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: product.stock == 0
                                      ? AppTheme.error.withValues(alpha: 0.1)
                                      : AppTheme.warning.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  product.stock == 0
                                      ? Icons.error
                                      : Icons.warning,
                                  color: product.stock == 0
                                      ? AppTheme.error
                                      : AppTheme.warning,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      product.stock == 0
                                          ? 'Stock Agotado'
                                          : 'Stock Bajo',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: product.stock == 0
                                            ? AppTheme.error
                                            : AppTheme.warning,
                                        fontSize: 12,
                                      ),
                                    ),
                                    Text(
                                      product.name,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    Text(
                                      product.stock == 0
                                          ? 'Sin existencias'
                                          : '${product.stock} unidades',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.logout, color: AppTheme.primaryBlue),
            SizedBox(width: 8),
            Text('Cerrar Sesion'),
          ],
        ),
        content: const Text('Estas seguro de que deseas cerrar sesion?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              final navigator = Navigator.of(context);
              await context.read<AppProvider>().logout();
              if (!context.mounted) return;
              navigator.pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryBlue,
            ),
            child: const Text('Cerrar Sesion'),
          ),
        ],
      ),
    );
  }
}
