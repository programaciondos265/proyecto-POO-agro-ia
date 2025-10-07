import styled from 'styled-components';
import { AnalysisResult, PestDetection } from '../services/pestAnalysisService';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
`;

const Header = styled.div`
  padding: 24px 24px 16px;
  text-align: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin: 0 0 8px;
  font-size: 24px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-size: 14px;
`;

const Content = styled.div`
  padding: 0 24px 24px;
`;

const StatusCard = styled.div<{ hasPest: boolean }>`
  background: ${({ hasPest, theme }) => 
    hasPest ? 'rgba(255, 193, 7, 0.1)' : 'rgba(40, 167, 69, 0.1)'};
  border: 1px solid ${({ hasPest, theme }) => 
    hasPest ? theme.colors.warning : theme.colors.success};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div<{ hasPest: boolean }>`
  color: ${({ hasPest, theme }) => 
    hasPest ? theme.colors.warning : theme.colors.success};
  font-size: 24px;
`;

const StatusText = styled.div`
  flex: 1;
`;

const StatusTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textOnSurface};
`;

const StatusDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin: 0 0 12px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PestCard = styled.div<{ severity: string }>`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${({ severity, theme }) => {
    switch (severity) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.primary;
    }
  }};
`;

const PestHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 8px;
`;

const PestName = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.textOnSurface};
  font-size: 16px;
`;

const Confidence = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const PestDescription = styled.p`
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const Treatment = styled.div`
  background: rgba(47, 110, 98, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
`;

const RecommendationList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const RecommendationItem = styled.li`
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin-bottom: 8px;
  font-size: 14px;
`;

const ImageAnalysis = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
`;

const AnalysisRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const AnalysisLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const AnalysisValue = styled.span<{ quality?: string }>`
  color: ${({ quality, theme }) => {
    if (!quality) return theme.colors.textOnSurface;
    switch (quality) {
      case 'good': return theme.colors.success;
      case 'fair': return theme.colors.warning;
      case 'poor': return theme.colors.error;
      default: return theme.colors.textOnSurface;
    }
  }};
  font-size: 14px;
  font-weight: 600;
`;

interface AnalysisModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

export function AnalysisModal({ result, onClose }: AnalysisModalProps) {
  return (
    <Modal>
      <ModalContent>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>
        
        <Header>
          <Title>Análisis Completado</Title>
          <Subtitle>Resultados del análisis de plagas</Subtitle>
        </Header>

        <Content>
          <StatusCard hasPest={result.hasPest}>
            <StatusIcon hasPest={result.hasPest}>
              {result.hasPest ? <FiAlertTriangle /> : <FiCheckCircle />}
            </StatusIcon>
            <StatusText>
              <StatusTitle>
                {result.hasPest ? 'Plagas Detectadas' : 'Sin Plagas Detectadas'}
              </StatusTitle>
              <StatusDescription>
                {result.hasPest 
                  ? `Se encontraron ${result.detections.length} tipo(s) de plaga(s)`
                  : 'Tu cultivo se ve saludable'
                }
              </StatusDescription>
            </StatusText>
          </StatusCard>

          {result.detections.length > 0 && (
            <Section>
              <SectionTitle>
                <FiAlertTriangle />
                Plagas Detectadas
              </SectionTitle>
              {result.detections.map((detection, index) => (
                <PestCard key={index} severity={detection.severity}>
                  <PestHeader>
                    <PestName>{detection.pestType}</PestName>
                    <Confidence>
                      {Math.round(detection.confidence * 100)}%
                    </Confidence>
                  </PestHeader>
                  <PestDescription>{detection.description}</PestDescription>
                  <Treatment>
                    <strong>Tratamiento:</strong> {detection.treatment}
                  </Treatment>
                </PestCard>
              ))}
            </Section>
          )}

          <Section>
            <SectionTitle>
              <FiInfo />
              Recomendaciones
            </SectionTitle>
            <RecommendationList>
              {result.recommendations.map((rec, index) => (
                <RecommendationItem key={index}>{rec}</RecommendationItem>
              ))}
            </RecommendationList>
          </Section>

          <Section>
            <SectionTitle>
              <FiInfo />
              Análisis de Imagen
            </SectionTitle>
            <ImageAnalysis>
              <AnalysisRow>
                <AnalysisLabel>Brillo:</AnalysisLabel>
                <AnalysisValue>{Math.round(result.imageAnalysis.brightness)}%</AnalysisValue>
              </AnalysisRow>
              <AnalysisRow>
                <AnalysisLabel>Contraste:</AnalysisLabel>
                <AnalysisValue>{Math.round(result.imageAnalysis.contrast)}%</AnalysisValue>
              </AnalysisRow>
              <AnalysisRow>
                <AnalysisLabel>Calidad:</AnalysisLabel>
                <AnalysisValue quality={result.imageAnalysis.quality}>
                  {result.imageAnalysis.quality === 'good' ? 'Buena' :
                   result.imageAnalysis.quality === 'fair' ? 'Regular' : 'Pobre'}
                </AnalysisValue>
              </AnalysisRow>
            </ImageAnalysis>
          </Section>
        </Content>
      </ModalContent>
    </Modal>
  );
}
