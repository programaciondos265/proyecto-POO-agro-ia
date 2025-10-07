import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface PasswordRecovery {
  id: string;
  email: string;
  token: string;
  fecha_solicitud: Date;
  expira_en: Date;
  usado: boolean;
  created_at: Date;
}

export class PasswordRecoveryModel {
  // Create a new password recovery request
  static async create(email: string, expirationHours: number = 24): Promise<PasswordRecovery> {
    const id = uuidv4();
    const token = uuidv4();
    const expira_en = new Date();
    expira_en.setHours(expira_en.getHours() + expirationHours);

    // First, mark any existing recovery requests for this email as used
    await this.markAsUsedByEmail(email);

    const query = `
      INSERT INTO password_recovery (id, email, token, expira_en)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [id, email, token, expira_en];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find recovery request by token
  static async findByToken(token: string): Promise<PasswordRecovery | null> {
    const query = `
      SELECT * FROM password_recovery 
      WHERE token = $1 AND usado = FALSE AND expira_en > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  // Mark recovery request as used
  static async markAsUsed(token: string): Promise<boolean> {
    const query = 'UPDATE password_recovery SET usado = TRUE WHERE token = $1';
    const result = await pool.query(query, [token]);
    return (result.rowCount || 0) > 0;
  }

  // Mark all recovery requests for an email as used
  static async markAsUsedByEmail(email: string): Promise<void> {
    const query = 'UPDATE password_recovery SET usado = TRUE WHERE email = $1';
    await pool.query(query, [email]);
  }

  // Clean up expired tokens (can be run as a cron job)
  static async cleanupExpiredTokens(): Promise<number> {
    const query = 'DELETE FROM password_recovery WHERE expira_en < CURRENT_TIMESTAMP';
    const result = await pool.query(query);
    return result.rowCount || 0;
  }

  // Get all recovery requests for an email (for debugging)
  static async findByEmail(email: string): Promise<PasswordRecovery[]> {
    const query = 'SELECT * FROM password_recovery WHERE email = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [email]);
    return result.rows;
  }
}
