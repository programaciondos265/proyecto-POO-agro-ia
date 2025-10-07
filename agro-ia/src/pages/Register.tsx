import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Page = styled.main`
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 24px 16px;
`;

const Shell = styled.div`
  width: 100%;
  max-width: 480px;
`;

const LogoWrap = styled.div`
  display: grid; 
  place-items: center;
  margin: 12px 0 8px;
`;

const Logo = styled.div`
  width: 180px;
  height: 120px;
  border-radius: 20px;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  margin-bottom: 16px;
`;

const LogoText = styled.div`
  color: #2F6E62;
  font-weight: 800;
  font-size: 24px;
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.colors.textOnMint};
  margin: 8px 0 20px;
  font-size: 40px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #5B7A72;
  margin: 0 0 32px;
  font-size: 16px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textOnSurface};
  border-radius: 28px;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  padding: 22px 18px 24px;
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 700;
  color: #0b3b33;
  margin-bottom: 8px;
`;

const InputWrap = styled.div`
  display: grid; 
  grid-template-columns: 44px 1fr; 
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.2s ease;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const IconCell = styled.div`
  display: grid; 
  place-items: center; 
  color: ${({ theme }) => theme.colors.primary};
`;

const Input = styled.input`
  border: none; 
  outline: none; 
  padding: 12px 12px; 
  font-size: 16px;
  width: 100%;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const PrimaryBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; 
  border: none;
  padding: 16px 18px; 
  border-radius: 16px; 
  font-weight: 800; 
  cursor: pointer;
  transition: .2s ease; 
  margin-top: 4px;
  font-size: 16px;
  
  &:hover { 
    background: ${({ theme }) => theme.colors.primaryDark}; 
    transform: translateY(-1px); 
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const OutlineBtn = styled.button`
  width: 100%;
  background: transparent; 
  color: ${({ theme }) => theme.colors.accentOrange};
  border: 3px solid ${({ theme }) => theme.colors.accentOrange};
  padding: 14px 18px; 
  border-radius: 16px; 
  font-weight: 800; 
  cursor: pointer;
  margin-top: 14px;
  font-size: 16px;
  transition: .2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentOrange};
    color: #fff;
  }
`;

const ErrorMsg = styled.div`
  color: #b91c1c; 
  background: #fee2e2; 
  border: 1px solid #fecaca; 
  border-radius: 10px;
  padding: 10px 12px; 
  margin-bottom: 12px; 
  font-size: 14px;
`;

const SuccessMsg = styled.div`
  color: #059669; 
  background: #d1fae5; 
  border: 1px solid #a7f3d0; 
  border-radius: 10px;
  padding: 10px 12px; 
  margin-bottom: 12px; 
  font-size: 14px;
`;

// Icon components
function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="4" fill="#2F6E62" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#2F6E62" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="#2F6E62" strokeWidth="2"/>
      <polyline points="22,6 12,13 2,6" stroke="#2F6E62" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" fill="#2F6E62" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="#2F6E62" strokeWidth="2" fill="none" />
      <rect x="11" y="14" width="2" height="3" rx="1" fill="#fff" />
    </svg>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    // Check if all fields are filled
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Por favor, completa todos los campos.');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido.');
      return false;
    }

    // Validate password length
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await register(formData.name, formData.email, formData.password);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo al dashboard...');
      
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <Page>
      <Shell>
        <LogoWrap>
          <Logo>
            <LogoText>AgroIA</LogoText>
          </Logo>
        </LogoWrap>
        <Title>Bienvenido</Title>
        <Subtitle>Crea una cuenta para comenzar</Subtitle>
        
        <Card as="form" onSubmit={handleSubmit}>
          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          {success && <SuccessMsg role="status">{success}</SuccessMsg>}

          <Field>
            <Label htmlFor="name">Nombre completo</Label>
            <InputWrap>
              <IconCell><UserIcon /></IconCell>
              <Input 
                id="name" 
                name="name"
                type="text" 
                placeholder="Tu nombre completo" 
                value={formData.name} 
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </InputWrap>
          </Field>

          <Field>
            <Label htmlFor="email">Correo electrónico</Label>
            <InputWrap>
              <IconCell><EmailIcon /></IconCell>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="tu@email.com" 
                value={formData.email} 
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </InputWrap>
          </Field>

          <Field>
            <Label htmlFor="password">Contraseña</Label>
            <InputWrap>
              <IconCell><LockIcon /></IconCell>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={formData.password} 
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </InputWrap>
          </Field>

          <Field>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <InputWrap>
              <IconCell><LockIcon /></IconCell>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                placeholder="Repite tu contraseña" 
                value={formData.confirmPassword} 
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </InputWrap>
          </Field>

          <PrimaryBtn type="submit" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </PrimaryBtn>
          
          <OutlineBtn type="button" onClick={handleBackToLogin} disabled={isLoading}>
            Volver al inicio de sesión
          </OutlineBtn>
        </Card>
      </Shell>
    </Page>
  );
}
