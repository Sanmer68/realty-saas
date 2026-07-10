import mongoose, { Document, Schema } from 'mongoose';

export interface IPropiedad extends Document {
  tenant: mongoose.Types.ObjectId;
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: 'MXN' | 'USD';
  tipo: 'venta' | 'renta';
  tipoPropiedad: 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina';
  zona: string;
  direccion: string;
  recamaras: number;
  banos: number;
  metros: number;
   metrosTerreno: number;
  estacionamientos: number;
  fotos: string[];
  amenidades: string[];
  activa: boolean;
  destacada: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropiedadSchema = new Schema<IPropiedad>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    moneda: { type: String, enum: ['MXN', 'USD'], default: 'MXN' },
    tipo: { type: String, enum: ['venta', 'renta'], required: true },
    tipoPropiedad: {
      type: String,
      enum: ['casa', 'departamento', 'terreno', 'local', 'oficina'],
      required: true
    },
    zona: { type: String, required: true },
    direccion: { type: String, default: '' },
    recamaras: { type: Number, default: 0 },
    banos: { type: Number, default: 0 },
    metros: { type: Number, default: 0 },
    metrosTerreno: { type: Number, default: 0 },
    estacionamientos: { type: Number, default: 0 },
    fotos: [{ type: String }],
    amenidades: [{ type: String }],
    activa: { type: Boolean, default: true },
    destacada: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Índice para búsquedas rápidas por tenant
PropiedadSchema.index({ tenant: 1, activa: 1 });
PropiedadSchema.index({ tenant: 1, tipo: 1 });
PropiedadSchema.index({ tenant: 1, zona: 1 });

export default mongoose.model<IPropiedad>('Propiedad', PropiedadSchema);