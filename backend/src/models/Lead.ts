import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  tenant: mongoose.Types.ObjectId;
  propiedad?: mongoose.Types.ObjectId;
  nombre: string;
  telefono: string;
  email: string;
  mensaje: string;
  canal: 'landing' | 'whatsapp' | 'portal' | 'referido';
  estado: 'nuevo' | 'contactado' | 'visita' | 'negociacion' | 'cerrado' | 'perdido';
  notas: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propiedad: { type: Schema.Types.ObjectId, ref: 'Propiedad' },
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, required: true },
    email: { type: String, default: '', lowercase: true },
    mensaje: { type: String, default: '' },
    canal: {
      type: String,
      enum: ['landing', 'whatsapp', 'portal', 'referido'],
      default: 'landing'
    },
    estado: {
      type: String,
      enum: ['nuevo', 'contactado', 'visita', 'negociacion', 'cerrado', 'perdido'],
      default: 'nuevo'
    },
    notas: { type: String, default: '' }
  },
  { timestamps: true }
);

LeadSchema.index({ tenant: 1, estado: 1 });
LeadSchema.index({ tenant: 1, createdAt: -1 });

export default mongoose.model<ILead>('Lead', LeadSchema);