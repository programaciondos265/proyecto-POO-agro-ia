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

const LoadingMsg = styled.div`
  color: #6b7280; 
  background: #f3f4f6; 
  border: 1px solid #d1d5db; 
  border-radius: 10px;
  padding: 10px 12px; 
  margin-bottom: 12px; 
  font-size: 14px;
  text-align: center;
`;

// Email icon component
function EmailIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="#2F6E62" strokeWidth="2"/>
      <polyline points="22,6 12,13 2,6" stroke="#2F6E62" strokeWidth="2" fill="none"/>
    </svg>
  );
}

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de verificación no válido o faltante.');
      setIsLoading(false);
    } else {
      setToken(tokenParam);
      verifyEmailToken(tokenParam);
    }
  }, [searchParams]);

  const verifyEmailToken = async (token: string) => {
    try {
      await verifyEmail(token);
      setSuccess('¡Email verificado exitosamente! Redirigiendo al dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al verificar el email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (!token) {
    return (
      <Page>
        <Shell>
          <LogoWrap>
            <Logo>
              <LogoText>AgroIA</LogoText>
            </Logo>
          </LogoWrap>
          <Title>Error</Title>
          <Card>
            <ErrorMsg>Token de verificación no válido o faltante.</ErrorMsg>
            <PrimaryBtn onClick={handleGoToLogin}>
              Ir al inicio de sesión
            </PrimaryBtn>
          </Card>
        </Shell>
      </Page>
    );
  }

  return (
    <Page>
      <Shell>
        <LogoWrap>
          <Logo>
            <LogoText>AgroIA</LogoText>
          </Logo>
        </LogoWrap>
        <Title>Verificar Email</Title>
        <Subtitle>Verificando tu dirección de correo electrónico</Subtitle>
        
        <Card>
          {isLoading && (
            <LoadingMsg>
              <EmailIcon />
              <div style={{ marginTop: '16px' }}>
                Verificando tu email...
              </div>
            </LoadingMsg>
          )}
          
          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          {success && <SuccessMsg role="status">{success}</SuccessMsg>}

          {!isLoading && !error && !success && (
            <PrimaryBtn onClick={handleGoToLogin}>
              Ir al inicio de sesión
            </PrimaryBtn>
          )}

          {!isLoading && success && (
            <PrimaryBtn onClick={handleGoToDashboard}>
              Ir al Dashboard
            </PrimaryBtn>
          )}

          {!isLoading && error && (
            <PrimaryBtn onClick={handleGoToLogin}>
              Ir al inicio de sesión
            </PrimaryBtn>
          )}
        </Card>
      </Shell>
    </Page>
  );
}

