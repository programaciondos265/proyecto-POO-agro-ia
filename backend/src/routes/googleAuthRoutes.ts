import { Router } from 'express';
import { googleAuth, getGoogleAuthUrl } from '../controllers/googleAuthController';

const router = Router();

// Google OAuth routes
router.post('/auth/google', googleAuth);
router.get('/auth/google/url', getGoogleAuthUrl);

export default router;
