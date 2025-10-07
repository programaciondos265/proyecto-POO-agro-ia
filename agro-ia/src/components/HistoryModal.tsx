import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { AnalysisHistoryItem, historyService } from '../services/historyService';
import { FiCalendar, FiFilter, FiTrash2, FiEye, FiDownload, FiX } from 'react-icons/fi';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin: 0;
  font-size: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Filters = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  background: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.background};
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.textOnSurface};
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => 
      active ? theme.colors.primaryDark : theme.colors.border};
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HistoryItem = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ImagePreview = styled.div<{ imageData: string }>`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-image: url(${({ imageData }) => imageData});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ItemDate = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textOnSurface};
  }
`;

const ItemTitle = styled.h3`
  margin: 0 0 4px;
  color: ${({ theme }) => theme.colors.textOnSurface};
  font-size: 16px;
`;

const ItemSummary = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const PestBadge = styled.span<{ severity: string }>`
  background: ${({ severity, theme }) => {
    switch (severity) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.primary;
    }
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

interface HistoryModalProps {
  onClose: () => void;
}

export function HistoryModal({ onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AnalysisHistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [stats, setStats] = useState(historyService.getHistoryStats());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = historyService.getHistory();
    setHistory(historyData);
    setFilteredHistory(historyData);
    setStats(historyService.getHistoryStats());
  };

  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    
    let filtered = history;
    
    switch (filter) {
      case 'withPests':
        filtered = history.filter(item => item.result.hasPest);
        break;
      case 'withoutPests':
        filtered = history.filter(item => !item.result.hasPest);
        break;
      case 'recent':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = history.filter(item => item.timestamp >= weekAgo);
        break;
      default:
        filtered = history;
    }
    
    setFilteredHistory(filtered);
  };

  const deleteAnalysis = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este análisis?')) {
      historyService.deleteAnalysis(id);
      loadHistory();
    }
  };

  const viewAnalysis = (item: AnalysisHistoryItem) => {
    // Aquí podrías abrir un modal con los detalles del análisis
    console.log('Viewing analysis:', item);
    alert('Funcionalidad de vista detallada en desarrollo...');
  };

  const exportHistory = () => {
    const data = historyService.exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agro-ia-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSummaryText = (item: AnalysisHistoryItem) => {
    if (item.result.hasPest) {
      const pestCount = item.result.detections.length;
      return `${pestCount} plaga${pestCount > 1 ? 's' : ''} detectada${pestCount > 1 ? 's' : ''}`;
    }
    return 'Sin plagas detectadas';
  };

  return (
    <Modal>
      <Header>
        <Title>Historial de Análisis</Title>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>
      </Header>

      <Content>
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalAnalyses}</StatValue>
            <StatLabel>Total Análisis</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pestDetections}</StatValue>
            <StatLabel>Con Plagas</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.recentAnalyses}</StatValue>
            <StatLabel>Últimos 7 días</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.mostCommonPest || 'N/A'}</StatValue>
            <StatLabel>Plaga Común</StatLabel>
          </StatCard>
        </StatsGrid>

        <Filters>
          <FilterButton 
            active={activeFilter === 'all'} 
            onClick={() => applyFilter('all')}
          >
            <FiFilter />
            Todos
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'withPests'} 
            onClick={() => applyFilter('withPests')}
          >
            Con Plagas
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'withoutPests'} 
            onClick={() => applyFilter('withoutPests')}
          >
            Sin Plagas
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'recent'} 
            onClick={() => applyFilter('recent')}
          >
            <FiCalendar />
            Recientes
          </FilterButton>
          <FilterButton onClick={exportHistory}>
            <FiDownload />
            Exportar
          </FilterButton>
        </Filters>

        <HistoryList>
          {filteredHistory.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📊</EmptyIcon>
              <div>No hay análisis en el historial</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Realiza tu primer análisis de plagas para ver el historial aquí
              </div>
            </EmptyState>
          ) : (
            filteredHistory.map((item) => (
              <HistoryItem key={item.id}>
                <ImagePreview imageData={item.imageData} />
                <ItemContent>
                  <ItemHeader>
                    <ItemDate>{formatDate(item.timestamp)}</ItemDate>
                    <ItemActions>
                      <ActionButton onClick={() => viewAnalysis(item)}>
                        <FiEye />
                      </ActionButton>
                      <ActionButton onClick={() => deleteAnalysis(item.id)}>
                        <FiTrash2 />
                      </ActionButton>
                    </ItemActions>
                  </ItemHeader>
                  <ItemTitle>{getSummaryText(item)}</ItemTitle>
                  <ItemSummary>
                    {item.result.hasPest && item.result.detections.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {item.result.detections.map((detection, index) => (
                          <PestBadge key={index} severity={detection.severity}>
                            {detection.pestType}
                          </PestBadge>
                        ))}
                      </div>
                    )}
                  </ItemSummary>
                </ItemContent>
              </HistoryItem>
            ))
          )}
        </HistoryList>
      </Content>
    </Modal>
  );
}
