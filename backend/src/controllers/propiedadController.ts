import { Request, Response } from 'express';
import Propiedad from '../models/Propiedad';
import { AuthRequest } from '../middleware/auth';

// @desc    Obtener propiedades públicas de un asesor por slug
// @route   GET /api/propiedades/publico/:slug
export const getPropiedadesPublico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { tipo, zona, tipoPropiedad } = req.query;

    const Tenant = (await import('../models/Tenant')).default;
    const tenant = await Tenant.findOne({ slug, activo: true });

    if (!tenant) {
      res.status(404).json({ mensaje: 'Asesor no encontrado' });
      return;
    }

    const filtro: any = { tenant: tenant._id, activa: true };
    if (tipo) filtro.tipo = tipo;
    if (zona) filtro.zona = zona;
    if (tipoPropiedad) filtro.tipoPropiedad = tipoPropiedad;

    const propiedades = await Propiedad.find(filtro).sort({ destacada: -1, createdAt: -1 });

    res.json(propiedades);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Obtener propiedades del asesor autenticado
// @route   GET /api/propiedades
export const getMisPropiedades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propiedades = await Propiedad.find({ tenant: req.tenant._id }).sort({ createdAt: -1 });
    res.json(propiedades);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Obtener una propiedad por ID
// @route   GET /api/propiedades/:id
export const getPropiedad = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propiedad = await Propiedad.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!propiedad) {
      res.status(404).json({ mensaje: 'Propiedad no encontrada' });
      return;
    }

    res.json(propiedad);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Crear propiedad
// @route   POST /api/propiedades
export const crearPropiedad = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      titulo, descripcion, precio, moneda, tipo, tipoPropiedad,
      zona, direccion, recamaras, banos, metros, estacionamientos,
      fotos, amenidades
    } = req.body;

    if (!titulo || !descripcion || !precio || !tipo || !tipoPropiedad || !zona) {
      res.status(400).json({ mensaje: 'Faltan campos requeridos' });
      return;
    }

    const propiedad = await Propiedad.create({
      tenant: req.tenant._id,
      titulo, descripcion, precio,
      moneda: moneda || 'MXN',
      tipo, tipoPropiedad, zona,
      direccion: direccion || '',
      recamaras: recamaras || 0,
      banos: banos || 0,
      metros: metros || 0,
      estacionamientos: estacionamientos || 0,
      fotos: fotos || [],
      amenidades: amenidades || []
    });

    res.status(201).json(propiedad);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Actualizar propiedad
// @route   PUT /api/propiedades/:id
export const actualizarPropiedad = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propiedad = await Propiedad.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!propiedad) {
      res.status(404).json({ mensaje: 'Propiedad no encontrada' });
      return;
    }

    const updated = await Propiedad.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Eliminar propiedad
// @route   DELETE /api/propiedades/:id
export const eliminarPropiedad = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propiedad = await Propiedad.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!propiedad) {
      res.status(404).json({ mensaje: 'Propiedad no encontrada' });
      return;
    }

    await propiedad.deleteOne();
    res.json({ mensaje: 'Propiedad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};