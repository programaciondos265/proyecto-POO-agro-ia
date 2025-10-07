import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google token and authenticate user
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de Google es requerido'
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Token de Google inválido'
      });
    }

    const { sub: google_id, email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Información de Google incompleta'
      });
    }

    // Check if user exists by Google ID
    let user = await UserModel.findByGoogleId(google_id);

    if (user) {
      // User exists, update last session
      await UserModel.updateLastSession(user.id);
    } else {
      // Check if user exists by email (for linking accounts)
      const existingUser = await UserModel.findByEmail(email);
      
      if (existingUser) {
        // Link Google account to existing user
        user = await UserModel.update(existingUser.id, {
          google_id,
          email_verificado: true // Google emails are pre-verified
        });
      } else {
        // Create new user
        const newUser = await UserModel.create({
          nombre: name,
          email,
          contraseña: '', // No password for Google users
          google_id
        });
        
        // Mark email as verified since Google emails are pre-verified
        await UserModel.update(newUser.id, {
          email_verificado: true
        });
        
        user = await UserModel.findById(newUser.id);
      }
    }

    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'Error creando/obteniendo usuario'
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user.id);

    res.json({
      success: true,
      message: 'Autenticación con Google exitosa',
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          email_verificado: user.email_verificado,
          ultima_sesion: user.ultima_sesion,
          google_id: user.google_id
        },
        token: jwtToken
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Get Google OAuth URL (for frontend redirect)
export const getGoogleAuthUrl = (req: Request, res: Response) => {
  try {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.FRONTEND_URL}/auth/google/callback&` +
      `scope=openid%20email%20profile&` +
      `response_type=code&` +
      `access_type=offline`;

    res.json({
      success: true,
      data: {
        authUrl
      }
    });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando URL de autenticación'
    });
  }
};
