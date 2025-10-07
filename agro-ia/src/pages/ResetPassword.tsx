import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

// Lock icon component
function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" fill="#2F6E62" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="#2F6E62" strokeWidth="2" fill="none" />
      <rect x="11" y="14" width="2" height="3" rx="1" fill="#fff" />
    </svg>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de recuperación no válido o faltante.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

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
        <Title>Recuperación de Contraseña</Title>
        <Subtitle>Firebase maneja automáticamente el reset de contraseña</Subtitle>
        
        <Card>
          {error ? (
            <ErrorMsg>{error}</ErrorMsg>
          ) : (
            <SuccessMsg>
              Si recibiste un enlace de recuperación por email, haz click en él para restablecer tu contraseña.
              Firebase manejará el proceso automáticamente.
            </SuccessMsg>
          )}
          
          <OutlineBtn onClick={handleBackToLogin}>
            Volver al inicio de sesión
          </OutlineBtn>
        </Card>
      </Shell>
    </Page>
  );
}

