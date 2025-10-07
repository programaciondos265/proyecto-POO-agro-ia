import styled from 'styled-components';
import { FiCamera } from 'react-icons/fi';
import { useState, useRef } from 'react';
import { pestAnalysisService, AnalysisResult } from '../services/pestAnalysisService';
import { AnalysisModal } from '../components/AnalysisModal';
import { HistoryModal } from '../components/HistoryModal';
import { DashboardStats } from '../components/DashboardStats';
import { historyService } from '../services/historyService';

const Page = styled.main`
  min-height: 100vh;
  padding: 28px 16px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const Avatar = styled.div`
  width: 140px;
  height: 140px;
  margin: 8px auto 8px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.9);
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadow.soft};
`;

const Username = styled.div`
  text-align: center;
  margin-top: 22px;
  font-weight: 600;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 36px;
  margin: 18px 0 18px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textOnSurface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  padding: 28px 22px;
`;

const CameraIcon = styled.div`
  display: grid; place-items: center;
  margin: 6px 0 16px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Actions = styled.div`
  display: grid; gap: 16px;
  margin-top: 8px;
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 14px 16px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
  width: 100%;
  transition: .2s ease;
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; transform: translateY(-1px); }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: rgba(47, 110, 98, 0.9);
`;

const CameraModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CameraContainer = styled.div`
  width: 100%;
  max-width: 500px;
  position: relative;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  border-radius: 12px;
`;

const CaptureButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

const ControlButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:disabled {
    background: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

function UserAvatarSVG() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
      <circle cx="48" cy="30" r="16" fill="#FFFFFF" />
      <path d="M16 78c0-14.36 14.33-24 32-24s32 9.64 32 24" fill="#FFFFFF" />
    </svg>
  );
}

function CameraSVG({ size = 96 }: { size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 96 96" aria-hidden>
      {/* Flash lines */}
      <path d="M48 18v10M36 22l4 8M60 22l-4 8" stroke="#2F6E62" strokeWidth="6" strokeLinecap="round" fill="none"/>
      {/* Camera body */}
      <rect x="18" y="36" width="60" height="36" rx="10" fill="#2F6E62" />
      <rect x="38" y="30" width="20" height="10" rx="3" fill="#2F6E62" />
      {/* Lens ring */}
      <circle cx="48" cy="54" r="14" stroke="#FFFFFF" strokeWidth="6" fill="none" />
      {/* Decorative stripe */}
      <path d="M18 54h18" stroke="#FFFFFF" strokeWidth="6"/>
      <path d="M60 54h18" stroke="#FFFFFF" strokeWidth="6"/>
    </svg>
  );
}

export function Dashboard() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Usar cámara trasera en móviles
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Por favor, permite el acceso a la cámara.');
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    try {
      const result = await pestAnalysisService.analyzeImage(capturedImage);
      
      // Guardar en el historial
      historyService.saveAnalysis(result, capturedImage);
      
      setAnalysisResult(result);
      setIsCameraOpen(false);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error al analizar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const closeAnalysisModal = () => {
    setAnalysisResult(null);
    setCapturedImage(null);
  };

  return (
    <Page>
      <Container>
        <Avatar>
          <UserAvatarSVG />
        </Avatar>
        <Username>Usuario</Username>
        <Title>Dashboard AgroIA</Title>
        
        <DashboardStats 
          onScanPest={openCamera}
          onViewHistory={() => setShowHistory(true)}
        />
      </Container>

      {/* Modal de cámara */}
      {isCameraOpen && (
        <CameraModal>
          <CameraContainer>
            {!capturedImage ? (
              <>
                <Video ref={videoRef} autoPlay playsInline />
                <CloseButton onClick={closeCamera}>×</CloseButton>
                <CaptureButton onClick={captureImage}>
                  <FiCamera />
                </CaptureButton>
              </>
            ) : (
              <>
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  style={{ width: '100%', borderRadius: '12px' }}
                />
                <CloseButton onClick={closeCamera}>×</CloseButton>
                <Controls>
                  <ControlButton onClick={retakePhoto}>
                    Tomar otra foto
                  </ControlButton>
                  <ControlButton onClick={analyzeImage} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analizando...' : 'Analizar imagen'}
                  </ControlButton>
                </Controls>
              </>
            )}
          </CameraContainer>
        </CameraModal>
      )}

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Modal de resultados de análisis */}
      {analysisResult && (
        <AnalysisModal 
          result={analysisResult} 
          onClose={closeAnalysisModal} 
        />
      )}

      {/* Modal de historial */}
      {showHistory && (
        <HistoryModal onClose={() => setShowHistory(false)} />
      )}
    </Page>
  );
}


