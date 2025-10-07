import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  nombre: string;
  email: string;
  contraseña?: string;
  fecha_registro: Date;
  google_id?: string;
  ultima_sesion?: Date;
  email_verificado: boolean;
  token_verificacion?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  nombre: string;
  email: string;
  contraseña: string;
  google_id?: string;
}

export interface PasswordRecovery {
  id: string;
  email: string;
  token: string;
  fecha_solicitud: Date;
  expira_en: Date;
  usado: boolean;
  created_at: Date;
}

export class UserModel {
  // Create a new user
  static async create(userData: CreateUserData): Promise<User> {
    const { nombre, email, contraseña, google_id } = userData;
    const id = uuidv4();
    const hashedPassword = contraseña ? await bcrypt.hash(contraseña, 12) : null;
    const token_verificacion = uuidv4();

    const query = `
      INSERT INTO users (id, nombre, email, contraseña, google_id, token_verificacion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [id, nombre, email, hashedPassword, google_id, token_verificacion];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find user by Google ID
  static async findByGoogleId(google_id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [google_id]);
    return result.rows[0] || null;
  }

  // Verify password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update last session
  static async updateLastSession(id: string): Promise<void> {
    const query = 'UPDATE users SET ultima_sesion = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Verify email
  static async verifyEmail(token: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET email_verificado = TRUE, token_verificacion = NULL 
      WHERE token_verificacion = $1 AND email_verificado = FALSE
      RETURNING id
    `;
    const result = await pool.query(query, [token]);
    return result.rows.length > 0;
  }

  // Update password
  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const query = 'UPDATE users SET contraseña = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await pool.query(query, [hashedPassword, id]);
  }

  // Update user
  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field as keyof User]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  // Delete user
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }
}
