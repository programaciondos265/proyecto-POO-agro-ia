import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

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
  display: grid; place-items: center;
  margin: 12px 0 8px;
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.colors.textOnMint};
  margin: 8px 0 20px;
  font-size: 40px;
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
  display: grid; grid-template-columns: 44px 1fr; align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
`;

const IconCell = styled.div`
  display: grid; place-items: center; color: ${({ theme }) => theme.colors.primary};
`;

const Input = styled.input`
  border: none; outline: none; padding: 12px 12px; font-size: 16px;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff; border: none;
  padding: 16px 18px; border-radius: 16px; font-weight: 800; cursor: pointer;
  transition: .2s ease; margin-top: 4px;
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; transform: translateY(-1px); }
`;

const OutlineBtn = styled.button`
  width: 100%;
  background: transparent; color: ${({ theme }) => theme.colors.accentOrange};
  border: 3px solid ${({ theme }) => theme.colors.accentOrange};
  padding: 14px 18px; border-radius: 16px; font-weight: 800; cursor: pointer;
  margin-top: 14px;
`;

const ErrorMsg = styled.div`
  color: #b91c1c; background: #fee2e2; border: 1px solid #fecaca; border-radius: 10px;
  padding: 10px 12px; margin-bottom: 12px; font-size: 14px;
`;

const LinkText = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  margin-top: 12px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  
  span {
    padding: 0 16px;
    color: #6b7280;
    font-size: 14px;
  }
`;

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="4" fill="#2F6E62" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#2F6E62" />
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

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa usuario y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }

  function handleRegister() {
    navigate('/register');
  }

  function handleForgotPassword() {
    navigate('/forgot-password');
  }

  function handleGoogleSuccess() {
    navigate('/dashboard');
  }

  function handleGoogleError(error: string) {
    setError(error);
  }

  return (
    <Page>
      <Shell>
        <LogoWrap>
          {/* Placeholder logo area to mimic the mock spacing */}
          <div style={{ width: 180, height: 120, borderRadius: 20, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
            <div style={{ color: '#2F6E62', fontWeight: 800 }}>AgroIA</div>
          </div>
        </LogoWrap>
        <Title>Bienvenido</Title>
        <Card as="form" onSubmit={handleSubmit}>
          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}

          <Field>
            <Label htmlFor="email">Nombre de usuario</Label>
            <InputWrap>
              <IconCell><UserIcon /></IconCell>
              <Input id="email" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
            </InputWrap>
          </Field>

          <Field>
            <Label htmlFor="password">Contraseña</Label>
            <InputWrap>
              <IconCell><LockIcon /></IconCell>
              <Input id="password" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            </InputWrap>
          </Field>

          <PrimaryBtn type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </PrimaryBtn>
          
          <LinkText type="button" onClick={handleForgotPassword} disabled={isLoading}>
            ¿Olvidaste tu contraseña?
          </LinkText>

          <Divider>
            <span>o</span>
          </Divider>

          <GoogleAuthButton 
            disabled={isLoading}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
          
          <OutlineBtn type="button" onClick={handleRegister} disabled={isLoading}>
            Crear cuenta
          </OutlineBtn>
        </Card>
      </Shell>
    </Page>
  );
}


