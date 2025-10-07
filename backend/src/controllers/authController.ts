import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel, CreateUserData } from '../models/User';
import { PasswordRecoveryModel } from '../models/PasswordRecovery';
import { generateToken } from '../middleware/auth';
import { emailService } from '../utils/emailService';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, email, contraseña } = req.body;

    // Validate required fields
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Validate password length
    if (contraseña.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una cuenta con este email'
      });
    }

    // Create new user
    const userData: CreateUserData = {
      nombre,
      email,
      contraseña
    };

    const newUser = await UserModel.create(userData);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        newUser.email,
        newUser.nombre,
        newUser.token_verificacion!
      );
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
      data: {
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          email: newUser.email,
          email_verificado: newUser.email_verificado
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, contraseña } = req.body;

    // Validate required fields
    if (!email || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Check if user has password (not Google-only user)
    if (!user.contraseña) {
      return res.status(401).json({
        success: false,
        message: 'Esta cuenta está asociada con Google. Usa el botón "Iniciar sesión con Google"'
      });
    }

    // Verify password
    const isPasswordValid = await UserModel.verifyPassword(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Update last session
    await UserModel.updateLastSession(user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          email_verificado: user.email_verificado,
          ultima_sesion: user.ultima_sesion
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Request password recovery
export const requestPasswordRecovery = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
      });
    }

    // Create password recovery request
    const recovery = await PasswordRecoveryModel.create(email, 24); // 24 hours expiration

    // Send recovery email
    try {
      await emailService.sendPasswordRecoveryEmail(
        user.email,
        user.nombre,
        recovery.token
      );
    } catch (emailError) {
      console.error('Error sending recovery email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error enviando el email de recuperación'
      });
    }

    res.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
    });

  } catch (error) {
    console.error('Password recovery request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { nueva_contraseña } = req.body;

    if (!nueva_contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Nueva contraseña es requerida'
      });
    }

    if (nueva_contraseña.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Find valid recovery request
    const recovery = await PasswordRecoveryModel.findByToken(token);
    if (!recovery) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Find user by email
    const user = await UserModel.findByEmail(recovery.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Update password
    await UserModel.updatePassword(user.id, nueva_contraseña);

    // Mark recovery token as used
    await PasswordRecoveryModel.markAsUsed(token);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verify email with token
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const isVerified = await UserModel.verifyEmail(token);
    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o ya utilizado'
      });
    }

    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Get current user profile
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          email_verificado: user.email_verificado,
          fecha_registro: user.fecha_registro,
          ultima_sesion: user.ultima_sesion
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
