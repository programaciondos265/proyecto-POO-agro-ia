import { Router } from 'express';
import {
  analyzePestImage,
  getAnalysisHistory,
  getAnalysisStats,
  deleteAnalysis,
  uploadMiddleware
} from '../controllers/pestAnalysisController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Analizar imagen de plaga
router.post('/analyze', uploadMiddleware, analyzePestImage);

// Obtener historial de análisis
router.get('/history', getAnalysisHistory);

// Obtener estadísticas de análisis
router.get('/stats', getAnalysisStats);

// Eliminar análisis específico
router.delete('/:analysisId', deleteAnalysis);

export default router;
