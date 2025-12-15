import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

// Ruta raíz GET /
// Sirve para confirmar que el backend está vivo
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente 🚀' 
  });
});

// Ruta de chequeo GET /health
router.get('/health', HealthController.check);

export default router;
