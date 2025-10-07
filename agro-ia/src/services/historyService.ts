import { AnalysisResult } from './pestAnalysisService';

export interface AnalysisHistoryItem {
  id: string;
  timestamp: Date;
  imageData: string;
  result: AnalysisResult;
  cropType?: string;
  location?: string;
  notes?: string;
}

class HistoryService {
  private readonly STORAGE_KEY = 'agro_ia_analysis_history';

  // Guardar análisis en el historial
  saveAnalysis(analysis: AnalysisResult, imageData: string, metadata?: {
    cropType?: string;
    location?: string;
    notes?: string;
  }): AnalysisHistoryItem {
    const historyItem: AnalysisHistoryItem = {
      id: this.generateId(),
      timestamp: new Date(),
      imageData,
      result: analysis,
      cropType: metadata?.cropType,
      location: metadata?.location,
      notes: metadata?.notes
    };

    const history = this.getHistory();
    history.unshift(historyItem); // Añadir al inicio
    
    // Mantener solo los últimos 50 análisis
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    return historyItem;
  }

  // Obtener historial completo
  getHistory(): AnalysisHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const history = JSON.parse(stored);
      // Convertir timestamps de string a Date
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error loading analysis history:', error);
      return [];
    }
  }

  // Obtener análisis por ID
  getAnalysisById(id: string): AnalysisHistoryItem | null {
    const history = this.getHistory();
    return history.find(item => item.id === id) || null;
  }

  // Eliminar análisis del historial
  deleteAnalysis(id: string): boolean {
    const history = this.getHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    
    if (filteredHistory.length === history.length) {
      return false; // No se encontró el análisis
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
    return true;
  }

  // Obtener estadísticas del historial
  getHistoryStats(): {
    totalAnalyses: number;
    pestDetections: number;
    mostCommonPest: string | null;
    recentAnalyses: number; // últimos 7 días
    averageConfidence: number;
  } {
    const history = this.getHistory();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalAnalyses = history.length;
    const pestDetections = history.filter(item => item.result.hasPest).length;
    
    // Contar plagas más comunes
    const allPests = history.flatMap(item => 
      item.result.detections.map(d => d.pestType)
    );
    const pestCounts = allPests.reduce((acc, pest) => {
      acc[pest] = (acc[pest] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonPest = Object.keys(pestCounts).length > 0 
      ? Object.keys(pestCounts).reduce((a, b) => pestCounts[a] > pestCounts[b] ? a : b)
      : null;

    const recentAnalyses = history.filter(item => 
      item.timestamp >= weekAgo
    ).length;

    const averageConfidence = history.length > 0
      ? history.reduce((sum, item) => 
          sum + item.result.detections.reduce((detSum, d) => detSum + d.confidence, 0) / Math.max(item.result.detections.length, 1), 0
        ) / history.length
      : 0;

    return {
      totalAnalyses,
      pestDetections,
      mostCommonPest,
      recentAnalyses,
      averageConfidence
    };
  }

  // Filtrar historial por criterios
  filterHistory(filters: {
    hasPest?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    cropType?: string;
    pestType?: string;
  }): AnalysisHistoryItem[] {
    let history = this.getHistory();

    if (filters.hasPest !== undefined) {
      history = history.filter(item => item.result.hasPest === filters.hasPest);
    }

    if (filters.dateFrom) {
      history = history.filter(item => item.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      history = history.filter(item => item.timestamp <= filters.dateTo!);
    }

    if (filters.cropType) {
      history = history.filter(item => 
        item.cropType?.toLowerCase().includes(filters.cropType!.toLowerCase())
      );
    }

    if (filters.pestType) {
      history = history.filter(item => 
        item.result.detections.some(d => 
          d.pestType.toLowerCase().includes(filters.pestType!.toLowerCase())
        )
      );
    }

    return history;
  }

  // Exportar historial como JSON
  exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  // Importar historial desde JSON
  importHistory(jsonData: string): boolean {
    try {
      const importedHistory = JSON.parse(jsonData);
      
      // Validar formato
      if (!Array.isArray(importedHistory)) {
        throw new Error('Invalid format');
      }

      // Validar cada elemento
      for (const item of importedHistory) {
        if (!item.id || !item.timestamp || !item.result) {
          throw new Error('Invalid item format');
        }
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(importedHistory));
      return true;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }

  // Limpiar historial completo
  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const historyService = new HistoryService();
