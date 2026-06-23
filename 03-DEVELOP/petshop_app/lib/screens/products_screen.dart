import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/models.dart';
import '../services/api_config.dart';
import '../theme/app_theme.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'all';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Color _parseColor(String colorString) {
    final hex = colorString.replaceAll('#', '');
    if (hex.length != 6) {
      return const Color(0xFF3B82F6);
    }
    final parsed = int.tryParse('FF$hex', radix: 16);
    if (parsed == null) {
      return const Color(0xFF3B82F6);
    }
    return Color(parsed);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final products = provider.products;
    final categories = provider.categories;
    final selectedCategoryName = _selectedCategory == 'all'
        ? ''
        : categories
            .firstWhere(
              (c) => c.id == _selectedCategory,
              orElse: () => Category(
                id: '',
                name: '',
                description: '',
                color: '#000000',
              ),
            )
            .name;

    final filteredProducts = products.where((product) {
      final matchesSearch =
          product.name.toLowerCase().contains(
            _searchController.text.toLowerCase(),
          ) ||
          product.description.toLowerCase().contains(
            _searchController.text.toLowerCase(),
          );
      final categoryId = product.categoryId;
      final matchesCategory =
          _selectedCategory == 'all' ||
          categoryId == _selectedCategory ||
          (selectedCategoryName.isNotEmpty &&
              categoryId.toLowerCase() ==
                  selectedCategoryName.toLowerCase());
      return matchesSearch && matchesCategory;
    }).toList();

    return RefreshIndicator(
      onRefresh: () => context.read<AppProvider>().refreshAll(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2563EB), Color(0xFF06B6D4)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.shopping_bag,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Productos',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      '${products.length} productos registrados',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Filters
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                // Search
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar productos...',
                    prefixIcon: const Icon(
                      Icons.search,
                      color: AppTheme.textLight,
                    ),
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.borderGray),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.borderGray),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: AppTheme.primaryBlue,
                        width: 2,
                      ),
                    ),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
                const SizedBox(height: 12),

                // Category Dropdown
                DropdownButtonFormField<String>(
                  initialValue: _selectedCategory,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    prefixIcon: const Icon(
                      Icons.folder,
                      color: AppTheme.textLight,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.borderGray),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.borderGray),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                  ),
                  items: [
                    const DropdownMenuItem(
                      value: 'all',
                      child: Text('Todas las categorias'),
                    ),
                    ...categories.map(
                      (category) => DropdownMenuItem(
                        value: category.id,
                        child: Text(category.name),
                      ),
                    ),
                  ],
                  onChanged: (value) =>
                      setState(() => _selectedCategory = value!),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Products List
          filteredProducts.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredProducts.length,
                  itemBuilder: (context, index) {
                    final product = filteredProducts[index];
                    final category = _resolveCategory(product, categories);
                    return _buildProductCard(product, category);
                  },
                ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Center(
        child: Column(
          children: [
            Icon(Icons.inventory_2, size: 60, color: AppTheme.textLight),
            SizedBox(height: 16),
            Text(
              'No se encontraron productos',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
            Text(
              'Intenta con otros filtros',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(Product product, Category category) {
    final categoryColor = _parseColor(category.color);
    final imageUrl = _resolveImageUrl(product.imageUrl);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: imageUrl == null
                      ? const Icon(
                          Icons.inventory_2,
                          color: Colors.white,
                          size: 28,
                        )
                      : Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return const Icon(
                              Icons.inventory_2,
                              color: Colors.white,
                              size: 28,
                            );
                          },
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return const Center(
                              child: SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation(
                                    Colors.white,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      product.description,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Category Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: categoryColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.label, size: 14, color: Colors.white),
                const SizedBox(width: 4),
                Text(
                  category.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Price and Stock
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.attach_money,
                            size: 14,
                            color: AppTheme.primaryBlue,
                          ),
                          Text(
                            'Precio',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '\$${product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: product.stock < 10
                        ? const Color(0xFFFEE2E2)
                        : const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.inventory_2,
                            size: 14,
                            color: product.stock < 10
                                ? AppTheme.error
                                : AppTheme.success,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Stock',
                            style: TextStyle(
                              fontSize: 11,
                              color: product.stock < 10
                                  ? AppTheme.error
                                  : AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${product.stock}',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: product.stock < 10
                              ? AppTheme.error
                              : AppTheme.success,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Category _resolveCategory(Product product, List<Category> categories) {
    final id = product.categoryId;
    if (id.isNotEmpty) {
      final byId = categories.where((c) => c.id == id);
      if (byId.isNotEmpty) return byId.first;
      final byName = categories.where(
        (c) => c.name.toLowerCase() == id.toLowerCase(),
      );
      if (byName.isNotEmpty) return byName.first;
    }
    return Category(
      id: '',
      name: id.isNotEmpty ? id : 'Sin categoria',
      description: '',
      color: '#000000',
    );
  }

  String? _resolveImageUrl(String? raw) {
    if (raw == null) return null;
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return null;
    final uri = Uri.tryParse(trimmed);
    if (uri != null && uri.hasScheme) {
      return trimmed;
    }
    final base = ApiConfig.baseUrl;
    final baseUri = Uri.tryParse(base);
    if (baseUri == null) return trimmed;

    final baseOrigin =
        '${baseUri.scheme}://${baseUri.host}${baseUri.hasPort ? ':${baseUri.port}' : ''}';
    if (trimmed.startsWith('/')) {
      return '$baseOrigin$trimmed';
    }
    return '$baseOrigin/$trimmed';
  }
}
