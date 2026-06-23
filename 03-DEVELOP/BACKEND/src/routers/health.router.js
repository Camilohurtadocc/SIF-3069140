import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

// Ruta raíz GET /
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente 🚀' 
  });
});

// Ruta de chequeo GET /health
router.get('/health', HealthController.check);

export default router;

