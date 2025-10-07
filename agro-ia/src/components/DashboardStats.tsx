import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { historyService } from '../services/historyService';
import { FiTrendingUp, FiShield, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 20px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 32px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const QuickActions = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  margin-bottom: 24px;
`;

const QuickActionsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin: 0 0 16px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const ActionIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 32px;
  margin-bottom: 12px;
`;

const ActionTitle = styled.h4`
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin: 0 0 8px;
  font-size: 16px;
`;

const ActionDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-size: 14px;
`;

const RecentActivity = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
`;

const RecentActivityTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textOnSurface};
  margin: 0 0 16px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const ActivityIcon = styled.div<{ hasPest: boolean }>`
  color: ${({ hasPest, theme }) => 
    hasPest ? theme.colors.warning : theme.colors.success};
  font-size: 20px;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  color: ${({ theme }) => theme.colors.textOnSurface};
  font-size: 14px;
  margin-bottom: 2px;
`;

const ActivityTime = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

interface DashboardStatsProps {
  onScanPest: () => void;
  onViewHistory: () => void;
}

export function DashboardStats({ onScanPest, onViewHistory }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    pestDetections: 0,
    recentAnalyses: 0,
    mostCommonPest: null as string | null
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
  }, []);

  const loadStats = () => {
    const historyStats = historyService.getHistoryStats();
    setStats(historyStats);
  };

  const loadRecentActivity = () => {
    const history = historyService.getHistory();
    const recent = history.slice(0, 5); // Últimos 5 análisis
    setRecentActivity(recent);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  const getActivityText = (item: any) => {
    if (item.result.hasPest) {
      const pestCount = item.result.detections.length;
      return `${pestCount} plaga${pestCount > 1 ? 's' : ''} detectada${pestCount > 1 ? 's' : ''}`;
    }
    return 'Sin plagas detectadas';
  };

  return (
    <>
      <StatsContainer>
        <StatCard>
          <StatIcon color="#6EC1A9">
            <FiTrendingUp />
          </StatIcon>
          <StatValue>{stats.totalAnalyses}</StatValue>
          <StatLabel>Análisis Totales</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#F19B18">
            <FiAlertTriangle />
          </StatIcon>
          <StatValue>{stats.pestDetections}</StatValue>
          <StatLabel>Con Plagas</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#28A745">
            <FiCheckCircle />
          </StatIcon>
          <StatValue>{stats.totalAnalyses - stats.pestDetections}</StatValue>
          <StatLabel>Sin Plagas</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#DC3545">
            <FiShield />
          </StatIcon>
          <StatValue>{stats.recentAnalyses}</StatValue>
          <StatLabel>Esta Semana</StatLabel>
        </StatCard>
      </StatsContainer>

      <QuickActions>
        <QuickActionsTitle>
          <FiTrendingUp />
          Acciones Rápidas
        </QuickActionsTitle>
        <ActionsGrid>
          <ActionCard onClick={onScanPest}>
            <ActionIcon>📸</ActionIcon>
            <ActionTitle>Escanear Plaga</ActionTitle>
            <ActionDescription>Analiza una imagen para detectar plagas</ActionDescription>
          </ActionCard>
          
          <ActionCard onClick={onViewHistory}>
            <ActionIcon>📊</ActionIcon>
            <ActionTitle>Ver Historial</ActionTitle>
            <ActionDescription>Revisa todos tus análisis anteriores</ActionDescription>
          </ActionCard>
          
          <ActionCard>
            <ActionIcon>📋</ActionIcon>
            <ActionTitle>Guía de Plagas</ActionTitle>
            <ActionDescription>Información sobre plagas comunes</ActionDescription>
          </ActionCard>
          
          <ActionCard>
            <ActionIcon>⚙️</ActionIcon>
            <ActionTitle>Configuración</ActionTitle>
            <ActionDescription>Ajusta las preferencias de la app</ActionDescription>
          </ActionCard>
        </ActionsGrid>
      </QuickActions>

      <RecentActivity>
        <RecentActivityTitle>
          <FiTrendingUp />
          Actividad Reciente
        </RecentActivityTitle>
        
        {recentActivity.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📊</EmptyIcon>
            <div>No hay actividad reciente</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Realiza tu primer análisis para ver la actividad aquí
            </div>
          </EmptyState>
        ) : (
          <ActivityList>
            {recentActivity.map((item, index) => (
              <ActivityItem key={index}>
                <ActivityIcon hasPest={item.result.hasPest}>
                  {item.result.hasPest ? <FiAlertTriangle /> : <FiCheckCircle />}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityText>{getActivityText(item)}</ActivityText>
                  <ActivityTime>{formatTimeAgo(item.timestamp)}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </RecentActivity>
    </>
  );
}
