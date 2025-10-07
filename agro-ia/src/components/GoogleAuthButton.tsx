import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const GoogleButton = styled.button`
  width: 100%;
  background: #fff;
  color: #374151;
  border: 2px solid #d1d5db;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    border-color: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const GoogleIcon = styled.div`
  width: 20px;
  height: 20px;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjU2IDEyLjI1QzIyLjU2IDExLjQ3IDIyLjQ5IDEwLjcyIDIyLjM2IDEwSDEyVjE0LjI1SDE3Ljk2QzE3LjY2IDE1LjYyIDE2Ljg0IDE2Ljg0IDE1LjY4IDE3LjY4VjIwLjE0SDE5LjY4QzIxLjU2IDE4LjM0IDIyLjU2IDE1LjQ3IDIyLjU2IDEyLjI1WiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBkPSJNMTIgMjNDMTQuOTc1IDIzIDE3LjY4IDIyLjEzIDE5LjY4IDIwLjE0TDE1LjY4IDE3LjY4QzE0LjY2IDE4LjM0IDEzLjM4IDE4LjY4IDEyIDE4LjY4QzkuMTMgMTguNjggNi44MiAxNi43NSA2LjA0IDE0SDEuOTJWMTYuNjNDMS45MiAxOS4zOSAzLjY5IDIxLjY5IDYuMTIgMjIuOTlDNC4zIDI0LjQzIDIuNDcgMjUgMTIgMjNaIiBmaWxsPSIjRkJCQzA1Ii8+CjxwYXRoIGQ9Ik02LjA0IDE0QzUuNzQgMTMuMTcgNS42IDEyLjMxIDUuNiAxMS4zM0M1LjYgMTAuMzUgNS43NCA5LjQ5IDYuMDQgOC42NlY2SDEuOTJDMS4wNyA3LjgyIDAuNSA5Ljg0IDAuNSAxMkMwLjUgMTQuMTYgMS4wNyAxNi4xOCAxLjkyIDE4TDYuMDQgMTRaIiBmaWxsPSIjRUE0MzM1Ii8+CjxwYXRoIGQ9Ik0xMiA1LjMyQzEzLjM4IDUuMzIgMTQuNjYgNS43NiAxNS42OCA2LjQyTDE5LjY4IDMuOTZDMTcuNjggMS45NyAxNC45NzUgMSAxMiAxQzcuNDggMSAzLjY5IDMuNDIgMS45MiA2TDUuOTYgOC42NkM2Ljc0IDUuODggOS4zNyAzLjY4IDEyIDMuNjhaIiBmaWxsPSIjMzRBNTUzIi8+Cjwvc3ZnPgo=') no-repeat center;
  background-size: contain;
`;

interface GoogleAuthButtonProps {
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleAuthButton({ disabled = false, onSuccess, onError }: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      await loginWithGoogle();
      onSuccess?.();
    } catch (error: any) {
      console.error('Google auth error:', error);
      onError?.(error.message || 'Error al autenticar con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleButton 
      type="button" 
      onClick={handleGoogleAuth}
      disabled={disabled || isLoading}
    >
      <GoogleIcon />
      {isLoading ? 'Conectando...' : 'Continuar con Google'}
    </GoogleButton>
  );
}


