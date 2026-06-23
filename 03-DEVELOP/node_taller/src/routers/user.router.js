import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas específicas primero (antes de rutas con parámetros)
// GET /api/v1/user/profile/:id - Get user profile (Admin only)
router.get('/user/profile/:id', authenticate, requireAdmin, UserController.getProfile);

// GET /api/v1/user/profile - Get current user profile (placeholder)
router.get('/user/profile', (req, res) => {
  res.status(400).json({ error: 'ID de usuario requerido' });
});

// POST /api/v1/user/register - Create user with role (Admin only)
router.post('/user/register', authenticate, requireAdmin, UserController.createWithRole);

// Rutas generales
// GET /api/v1/user - Get all users (Admin only)
router.get('/user', authenticate, requireAdmin, UserController.getAll);

// Rutas con parámetros al final
// GET /api/v1/user/:id - Get user by ID (Admin only)
router.get('/user/:id', authenticate, requireAdmin, UserController.getById);

// POST /api/v1/user - Create a new user (Admin only)
router.post('/user', authenticate, requireAdmin, UserController.create);

// PUT /api/v1/user/:id - Update user (Admin only)
router.put('/user/:id', authenticate, requireAdmin, UserController.update);

// PUT /api/v1/user/:id/role - Update user with role and optional password (Admin only)
router.put('/user/:id/role', authenticate, requireAdmin, UserController.updateWithRole);

// PUT /api/v1/user/:id/toggle - Toggle user active/inactive (Admin only)
router.put('/user/:id/toggle', authenticate, requireAdmin, UserController.toggleStatus);

// GET /api/v1/user/:id/dependencies - Check user dependencies (Admin only)
router.get('/user/:id/dependencies', authenticate, requireAdmin, UserController.checkDependencies);

export default router;
