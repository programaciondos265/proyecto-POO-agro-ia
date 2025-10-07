import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { UserModel, User } from '../models/User';
import pool from '../config/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

interface MigrationResult {
  success: number;
  failed: number;
  errors: string[];
}

export class UserMigrationService {
  static async migrateAllUsers(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get all users from PostgreSQL
      const users = await this.getAllUsersFromPostgreSQL();
      console.log(`Found ${users.length} users to migrate`);

      for (const user of users) {
        try {
          await this.migrateUser(user);
          result.success++;
          console.log(`✅ Migrated user: ${user.email}`);
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Failed to migrate ${user.email}: ${error.message}`);
          console.error(`❌ Failed to migrate user ${user.email}:`, error.message);
        }
      }

      console.log(`\n📊 Migration Summary:`);
      console.log(`✅ Successfully migrated: ${result.success}`);
      console.log(`❌ Failed migrations: ${result.failed}`);
      
      if (result.errors.length > 0) {
        console.log(`\n🚨 Errors:`);
        result.errors.forEach(error => console.log(`  - ${error}`));
      }

    } catch (error: any) {
      console.error('Migration failed:', error.message);
      result.errors.push(`Migration failed: ${error.message}`);
    }

    return result;
  }

  private static async getAllUsersFromPostgreSQL(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  private static async migrateUser(user: User): Promise<void> {
    if (!user.email) {
      throw new Error('User has no email address');
    }

    // Skip users without password (Google-only users)
    if (!user.contraseña) {
      console.log(`⚠️ Skipping user ${user.email} - no password (Google-only user)`);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        'temporary_password_123' // Temporary password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: user.nombre
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        nombre: user.nombre,
        email: user.email,
        fecha_registro: user.fecha_registro,
        google_id: user.google_id || null,
        ultima_sesion: user.ultima_sesion || null,
        email_verificado: user.email_verificado,
        created_at: user.created_at,
        updated_at: user.updated_at,
        migrated_from_postgresql: true,
        original_postgresql_id: user.id
      });

      // Mark user as migrated in PostgreSQL
      await this.markUserAsMigrated(user.id, userCredential.user.uid);

    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️ User ${user.email} already exists in Firebase`);
        return;
      }
      throw error;
    }
  }

  private static async markUserAsMigrated(postgresqlId: string, firebaseUid: string): Promise<void> {
    const query = `
      UPDATE users 
      SET firebase_uid = $1, migrated_to_firebase = TRUE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    await pool.query(query, [firebaseUid, postgresqlId]);
  }

  static async createMigrationTable(): Promise<void> {
    const query = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255),
      ADD COLUMN IF NOT EXISTS migrated_to_firebase BOOLEAN DEFAULT FALSE
    `;
    await pool.query(query);
    console.log('✅ Migration columns added to users table');
  }

  static async getMigrationStatus(): Promise<{ total: number; migrated: number; pending: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN migrated_to_firebase = TRUE THEN 1 END) as migrated,
        COUNT(CASE WHEN migrated_to_firebase = FALSE OR migrated_to_firebase IS NULL THEN 1 END) as pending
      FROM users
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 Starting user migration from PostgreSQL to Firebase...\n');
      
      // Create migration table columns
      await UserMigrationService.createMigrationTable();
      
      // Check migration status
      const status = await UserMigrationService.getMigrationStatus();
      console.log(`📊 Migration Status:`);
      console.log(`  Total users: ${status.total}`);
      console.log(`  Already migrated: ${status.migrated}`);
      console.log(`  Pending migration: ${status.pending}\n`);

      if (status.pending === 0) {
        console.log('✅ All users have been migrated!');
        process.exit(0);
      }

      // Perform migration
      const result = await UserMigrationService.migrateAllUsers();
      
      if (result.failed === 0) {
        console.log('\n🎉 Migration completed successfully!');
      } else {
        console.log('\n⚠️ Migration completed with some errors.');
      }

    } catch (error: any) {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    } finally {
      await pool.end();
    }
  })();
}
