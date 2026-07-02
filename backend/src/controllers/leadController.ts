import { Request, Response } from 'express';
import Lead from '../models/Lead';
import Tenant from '../models/Tenant';
import { AuthRequest } from '../middleware/auth';

// @desc    Crear lead público (desde la landing del asesor)
// @route   POST /api/leads/publico/:slug
export const crearLeadPublico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { nombre, telefono, email, mensaje, propiedadId } = req.body;

    if (!nombre || !telefono) {
      res.status(400).json({ mensaje: 'Nombre y teléfono son requeridos' });
      return;
    }

    const tenant = await Tenant.findOne({ slug, activo: true });
    if (!tenant) {
      res.status(404).json({ mensaje: 'Asesor no encontrado' });
      return;
    }

    const lead = await Lead.create({
      tenant: tenant._id,
      propiedad: propiedadId || undefined,
      nombre,
      telefono,
      email: email || '',
      mensaje: mensaje || '',
      canal: 'landing',
      estado: 'nuevo'
    });

    res.status(201).json({ mensaje: 'Gracias, el asesor te contactará pronto', lead });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Obtener todos los leads del asesor
// @route   GET /api/leads
export const getMisLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { estado, canal } = req.query;

    const filtro: any = { tenant: req.tenant._id };
    if (estado) filtro.estado = estado;
    if (canal) filtro.canal = canal;

    const leads = await Lead.find(filtro)
      .populate('propiedad', 'titulo precio zona')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Obtener un lead por ID
// @route   GET /api/leads/:id
export const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    }).populate('propiedad', 'titulo precio zona fotos');

    if (!lead) {
      res.status(404).json({ mensaje: 'Lead no encontrado' });
      return;
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Actualizar estado y notas de un lead
// @route   PUT /api/leads/:id
export const actualizarLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      tenant: req.tenant._id
    });

    if (!lead) {
      res.status(404).json({ mensaje: 'Lead no encontrado' });
      return;
    }

    const { estado, notas } = req.body;

    if (estado) lead.estado = estado;
    if (notas !== undefined) lead.notas = notas;

    const updated = await lead.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Estadísticas del CRM
// @route   GET /api/leads/stats
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenant._id;

    const [total, nuevo, contactado, visita, negociacion, cerrado, perdido] = await Promise.all([
      Lead.countDocuments({ tenant: tenantId }),
      Lead.countDocuments({ tenant: tenantId, estado: 'nuevo' }),
      Lead.countDocuments({ tenant: tenantId, estado: 'contactado' }),
      Lead.countDocuments({ tenant: tenantId, estado: 'visita' }),
      Lead.countDocuments({ tenant: tenantId, estado: 'negociacion' }),
      Lead.countDocuments({ tenant: tenantId, estado: 'cerrado' }),
      Lead.countDocuments({ tenant: tenantId, estado: 'perdido' })
    ]);

    res.json({
      total,
      pipeline: { nuevo, contactado, visita, negociacion, cerrado, perdido }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};