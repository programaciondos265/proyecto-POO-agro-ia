import { Router } from 'express';
import {
  register,
  login,
  requestPasswordRecovery,
  resetPassword,
  verifyEmail,
  getProfile
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/registro', register);
router.post('/login', login);
router.post('/recuperar-contraseña', requestPasswordRecovery);
router.get('/verificar-email/:token', verifyEmail);
router.post('/restablecer-contraseña/:token', resetPassword);

// Protected routes
router.get('/perfil', authenticateToken, getProfile);

export default router;
