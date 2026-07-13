import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant';
import { AuthRequest } from '../middleware/auth';

const generarToken = (id: string): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// @desc    Registro de nuevo asesor
// @route   POST /api/auth/registro
export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, telefono, whatsapp, zona, slug } = req.body;

    if (!nombre || !email || !password || !telefono || !whatsapp || !slug) {
      res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
      return;
    }

    const tenantExiste = await Tenant.findOne({ $or: [{ email }, { slug }] });
    if (tenantExiste) {
      res.status(400).json({ mensaje: 'Email o slug ya registrado' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const tenant = await Tenant.create({
      nombre,
      slug,
      email,
      password: passwordHash,
      telefono,
      whatsapp,
      zona: zona || ''
    });

    res.status(201).json({
      _id: tenant._id,
      nombre: tenant.nombre,
      slug: tenant.slug,
      email: tenant.email,
      plan: tenant.plan,
      token: generarToken(tenant._id.toString())
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Login de asesor
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ mensaje: 'Email y password son requeridos' });
      return;
    }

    const tenant = await Tenant.findOne({ email });
    if (!tenant) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    const passwordValido = await bcrypt.compare(password, tenant.password);
    if (!passwordValido) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    if (!tenant.activo) {
      res.status(401).json({ mensaje: 'Cuenta inactiva, contacta al administrador' });
      return;
    }

    res.json({
      _id: tenant._id,
      nombre: tenant.nombre,
      slug: tenant.slug,
      email: tenant.email,
      plan: tenant.plan,
      foto: tenant.foto,
      token: generarToken(tenant._id.toString())
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Obtener perfil del asesor autenticado
// @route   GET /api/auth/perfil
export const getPerfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

// @desc    Actualizar perfil del asesor
// @route   PUT /api/auth/perfil
export const updatePerfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenant = await Tenant.findById(req.tenant._id);
    if (!tenant) {
      res.status(404).json({ mensaje: 'Asesor no encontrado' });
      return;
    }

    const { nombre, telefono, whatsapp, bio, zona, estiloVenta, tipoPropiedadPrincipal, configuracion } = req.body;

    if (nombre) tenant.nombre = nombre;
    if (telefono) tenant.telefono = telefono;
    if (whatsapp) tenant.whatsapp = whatsapp;
    if (bio) tenant.bio = bio;
    if (zona) tenant.zona = zona;
    if (estiloVenta) tenant.estiloVenta = estiloVenta;
    if (tipoPropiedadPrincipal) tenant.tipoPropiedadPrincipal = tipoPropiedadPrincipal;
    if (configuracion) tenant.configuracion = { ...tenant.configuracion, ...configuracion };

    const updated = await tenant.save();

    res.json({
      _id: updated._id,
      nombre: updated.nombre,
      slug: updated.slug,
      email: updated.email,
      plan: updated.plan,
      foto: updated.foto,
      bio: updated.bio,
      zona: updated.zona,
      estiloVenta: updated.estiloVenta,
      tipoPropiedadPrincipal: updated.tipoPropiedadPrincipal,
      configuracion: updated.configuracion
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};
// @desc    Obtener datos públicos del asesor (para su landing)
// @route   GET /api/auth/publico/:slug
export const getPerfilPublico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug, activo: true });

    if (!tenant) {
      res.status(404).json({ mensaje: 'Asesor no encontrado' });
      return;
    }

    res.json({
      nombre: tenant.nombre,
      slug: tenant.slug,
      telefono: tenant.telefono,
      whatsapp: tenant.whatsapp,
      foto: tenant.foto,
      bio: tenant.bio,
      zona: tenant.zona,
      configuracion: tenant.configuracion
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};