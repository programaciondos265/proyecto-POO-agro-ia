import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send email verification
  async sendVerificationEmail(email: string, nombre: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;
    
    const mailOptions = {
      from: `"AgroIA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifica tu cuenta - AgroIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2F6E62; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">AgroIA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Detección de plagas</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #2F6E62; margin-top: 0;">¡Hola ${nombre}!</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              Gracias por registrarte en AgroIA. Para completar tu registro, 
              necesitas verificar tu dirección de correo electrónico.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #2F6E62; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block;">
                Verificar mi cuenta
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <a href="${verificationUrl}" style="color: #2F6E62;">${verificationUrl}</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Este enlace expirará en 24 horas. Si no solicitaste esta cuenta, 
              puedes ignorar este correo.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; 
                      border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; 
                      border-top: none;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 AgroIA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send password recovery email
  async sendPasswordRecoveryEmail(email: string, nombre: string, token: string): Promise<void> {
    const recoveryUrl = `${process.env.FRONTEND_URL}/restablecer-contraseña?token=${token}`;
    
    const mailOptions = {
      from: `"AgroIA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recupera tu contraseña - AgroIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2F6E62; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">AgroIA</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Detección de plagas</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #2F6E62; margin-top: 0;">¡Hola ${nombre}!</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en AgroIA.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${recoveryUrl}" 
                 style="background: #2F6E62; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <a href="${recoveryUrl}" style="color: #2F6E62;">${recoveryUrl}</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Este enlace expirará en 24 horas. Si no solicitaste este cambio, 
              puedes ignorar este correo y tu contraseña permanecerá sin cambios.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; 
                      border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; 
                      border-top: none;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 AgroIA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
