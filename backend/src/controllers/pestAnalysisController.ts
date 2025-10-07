import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import sharp from 'sharp';
import { UserModel } from '../models/User';

// Configuración de multer para subida de imágenes
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Tipos para el análisis de plagas
interface PestDetection {
  pestType: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
}

interface AnalysisResult {
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

// Simulación de análisis de plagas (en producción usarías un modelo real de IA)
async function analyzeImageForPests(imageBuffer: Buffer): Promise<AnalysisResult> {
  try {
    // Procesar imagen con Sharp para obtener metadatos
    const metadata = await sharp(imageBuffer).metadata();
    
    // Simular análisis con datos aleatorios pero realistas
    const random = Math.random();
    
    const pestTypes = [
      {
        name: 'Pulgón',
        description: 'Insecto pequeño que se alimenta de la savia de las plantas',
        treatment: 'Aplicar jabón insecticida o aceite de neem',
        severity: 'medium' as const
      },
      {
        name: 'Mosca blanca',
        description: 'Insecto volador que causa daño por succión',
        treatment: 'Usar trampas amarillas y control biológico',
        severity: 'high' as const
      },
      {
        name: 'Araña roja',
        description: 'Ácaro que causa manchas amarillas en las hojas',
        treatment: 'Aumentar humedad y usar acaricidas',
        severity: 'medium' as const
      },
      {
        name: 'Oídio',
        description: 'Hongo que forma una capa blanca en las hojas',
        treatment: 'Aplicar fungicida de azufre',
        severity: 'high' as const
      },
      {
        name: 'Escarabajo de la patata',
        description: 'Escarabajo que se alimenta de hojas de solanáceas',
        treatment: 'Recolección manual y uso de Bacillus thuringiensis',
        severity: 'medium' as const
      }
    ];

    const detections: PestDetection[] = [];
    
    // Simular detección de plagas (35% de probabilidad)
    if (random < 0.35) {
      const pestCount = Math.floor(Math.random() * 2) + 1; // 1-2 plagas
      
      for (let i = 0; i < pestCount; i++) {
        const pest = pestTypes[Math.floor(Math.random() * pestTypes.length)];
        detections.push({
          pestType: pest.name,
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          description: pest.description,
          treatment: pest.treatment,
          severity: pest.severity
        });
      }
    }

    // Análisis de calidad de imagen basado en metadatos
    const brightness = Math.random() * 100;
    const contrast = Math.random() * 100;
    const quality = brightness > 50 && contrast > 40 ? 'good' : 
                   brightness > 30 && contrast > 25 ? 'fair' : 'poor';

    // Generar recomendaciones
    const recommendations: string[] = [];
    
    if (detections.length > 0) {
      recommendations.push('Se detectaron plagas en tu cultivo');
      recommendations.push('Aplica el tratamiento recomendado lo antes posible');
      
      if (detections.some(d => d.severity === 'high')) {
        recommendations.push('⚠️ Plagas de alta severidad detectadas - acción inmediata requerida');
      }
      
      // Recomendaciones específicas por tipo de plaga
      const pestTypes = detections.map(d => d.pestType);
      if (pestTypes.includes('Pulgón')) {
        recommendations.push('💡 Para pulgones, considera usar mariquitas como control biológico');
      }
      if (pestTypes.includes('Mosca blanca')) {
        recommendations.push('💡 Las trampas adhesivas amarillas son muy efectivas contra moscas blancas');
      }
    } else {
      recommendations.push('✅ No se detectaron plagas en la imagen');
      recommendations.push('Tu cultivo se ve saludable');
      recommendations.push('💡 Continúa monitoreando regularmente para prevenir infestaciones');
    }

    if (quality === 'poor') {
      recommendations.push('💡 Mejora la iluminación para un mejor análisis');
    }

    if (metadata.width && metadata.height) {
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio < 0.8 || aspectRatio > 1.2) {
        recommendations.push('💡 Intenta tomar la foto más centrada en la planta');
      }
    }

    return {
      hasPest: detections.length > 0,
      detections,
      imageAnalysis: {
        brightness,
        contrast,
        quality,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        },
        fileSize: imageBuffer.length
      },
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Error al procesar la imagen');
  }
}

// Middleware para manejar la subida de archivos
export const uploadMiddleware = upload.single('image');

// Analizar imagen de plaga
export const analyzePestImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const { cropType, location, notes } = req.body;
    const userId = req.userId;

    // Verificar que el usuario existe
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Analizar la imagen
    const analysisResult = await analyzeImageForPests(req.file.buffer);

    // Aquí podrías guardar el análisis en la base de datos
    // Por ahora solo devolvemos el resultado

    res.json({
      success: true,
      message: 'Análisis completado exitosamente',
      data: {
        analysis: analysisResult,
        metadata: {
          cropType: cropType || null,
          location: location || null,
          notes: notes || null,
          analyzedAt: new Date().toISOString(),
          userId: userId
        }
      }
    });

  } catch (error) {
    console.error('Error in analyzePestImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al analizar la imagen'
    });
  }
};

// Obtener historial de análisis del usuario
export const getAnalysisHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, hasPest } = req.query;

    // Aquí implementarías la lógica para obtener el historial desde la base de datos
    // Por ahora devolvemos un array vacío
    const history = [];

    res.json({
      success: true,
      message: 'Historial obtenido exitosamente',
      data: {
        history,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: 0,
          totalPages: 0
        }
      }
    });

  } catch (error) {
    console.error('Error in getAnalysisHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el historial'
    });
  }
};

// Obtener estadísticas de análisis del usuario
export const getAnalysisStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Aquí implementarías la lógica para obtener estadísticas desde la base de datos
    // Por ahora devolvemos estadísticas simuladas
    const stats = {
      totalAnalyses: 0,
      pestDetections: 0,
      mostCommonPest: null,
      recentAnalyses: 0, // últimos 7 días
      averageConfidence: 0,
      pestTypesCount: {}
    };

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    });

  } catch (error) {
    console.error('Error in getAnalysisStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener las estadísticas'
    });
  }
};

// Eliminar análisis del historial
export const deleteAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { analysisId } = req.params;
    const userId = req.userId;

    // Aquí implementarías la lógica para eliminar el análisis desde la base de datos
    // Por ahora devolvemos éxito

    res.json({
      success: true,
      message: 'Análisis eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error in deleteAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el análisis'
    });
  }
};
