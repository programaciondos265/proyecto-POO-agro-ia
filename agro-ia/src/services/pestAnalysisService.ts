// Tipos para el análisis de plagas
export interface PestDetection {
  pestType: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  hasPest: boolean;
  detections: PestDetection[];
  imageAnalysis: {
    brightness: number;
    contrast: number;
    quality: 'good' | 'fair' | 'poor';
    dimensions: { width: number; height: number };
    fileSize: number;
  };
  recommendations: string[];
}

class PestAnalysisService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Analizar imagen usando el backend
  async analyzeImage(imageData: string, metadata?: {
    cropType?: string;
    location?: string;
    notes?: string;
  }): Promise<AnalysisResult> {
    try {
      // Convertir base64 a blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Crear FormData
      const formData = new FormData();
      formData.append('image', blob, 'pest-image.jpg');
      
      if (metadata?.cropType) {
        formData.append('cropType', metadata.cropType);
      }
      if (metadata?.location) {
        formData.append('location', metadata.location);
      }
      if (metadata?.notes) {
        formData.append('notes', metadata.notes);
      }

      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Enviar al backend
      const result = await fetch(`${this.apiUrl}/pest-analysis/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || 'Error al analizar la imagen');
      }

      const data = await result.json();
      return data.data.analysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Error al analizar la imagen');
    }
  }


  // Método para obtener estadísticas de análisis
  getAnalysisStats(analyses: AnalysisResult[]): {
    totalAnalyses: number;
    pestDetections: number;
    mostCommonPest: string | null;
    averageConfidence: number;
  } {
    const totalAnalyses = analyses.length;
    const pestDetections = analyses.filter(a => a.hasPest).length;
    
    const allPests = analyses.flatMap(a => a.detections.map(d => d.pestType));
    const pestCounts = allPests.reduce((acc, pest) => {
      acc[pest] = (acc[pest] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonPest = Object.keys(pestCounts).length > 0 
      ? Object.keys(pestCounts).reduce((a, b) => pestCounts[a] > pestCounts[b] ? a : b)
      : null;
    
    const averageConfidence = analyses.length > 0
      ? analyses.reduce((sum, a) => 
          sum + a.detections.reduce((detSum, d) => detSum + d.confidence, 0) / Math.max(a.detections.length, 1), 0
        ) / analyses.length
      : 0;

    return {
      totalAnalyses,
      pestDetections,
      mostCommonPest,
      averageConfidence
    };
  }
}

export const pestAnalysisService = new PestAnalysisService();
