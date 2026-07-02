import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  nombre: string;
  slug: string;
  email: string;
  password: string;
  telefono: string;
  whatsapp: string;
  foto: string;
  bio: string;
  zona: string;
  plan: 'base' | 'pro' | 'premium';
  activo: boolean;
  estiloVenta: 'profesional' | 'motivacional' | 'cercano' | 'urgencia' | 'educativo' | 'exclusivo';
  tipoPropiedadPrincipal: 'playa' | 'centro' | 'familiar' | 'terreno' | 'lujo' | 'renta';
  configuracion: {
    colorPrimario: string;
    colorSecundario: string;
    frase: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    nombre: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    telefono: { type: String, required: true },
    whatsapp: { type: String, required: true },
    foto: { type: String, default: '' },
    bio: { type: String, default: '' },
    zona: { type: String, default: '' },
    plan: { type: String, enum: ['base', 'pro', 'premium'], default: 'base' },
    activo: { type: Boolean, default: true },
    estiloVenta: {
      type: String,
      enum: ['profesional', 'motivacional', 'cercano', 'urgencia', 'educativo', 'exclusivo'],
      default: 'profesional'
    },
    tipoPropiedadPrincipal: {
      type: String,
      enum: ['playa', 'centro', 'familiar', 'terreno', 'lujo', 'renta'],
      default: 'familiar'
    },
    configuracion: {
      colorPrimario: { type: String, default: '#1a1a2e' },
      colorSecundario: { type: String, default: '#f5a623' },
      frase: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);