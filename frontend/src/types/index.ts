export interface Tenant {
  _id: string;
  nombre: string;
  slug: string;
  email: string;
  plan: 'base' | 'pro' | 'premium';
  foto: string;
  bio: string;
  zona: string;
  telefono: string;
  whatsapp: string;
  estiloVenta: 'profesional' | 'motivacional' | 'cercano' | 'urgencia' | 'educativo' | 'exclusivo';
  tipoPropiedadPrincipal: 'playa' | 'centro' | 'familiar' | 'terreno' | 'lujo' | 'renta';
  configuracion: {
    colorPrimario: string;
    colorSecundario: string;
    frase: string;
  };
}

export interface Propiedad {
  _id: string;
  tenant: string;
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
  estacionamientos: number;
  fotos: string[];
  amenidades: string[];
  activa: boolean;
  destacada: boolean;
  createdAt: string;
}

export interface Lead {
  _id: string;
  tenant: string;
  propiedad?: {
    _id: string;
    titulo: string;
    precio: number;
    zona: string;
  };
  nombre: string;
  telefono: string;
  email: string;
  mensaje: string;
  canal: 'landing' | 'whatsapp' | 'portal' | 'referido';
  estado: 'nuevo' | 'contactado' | 'visita' | 'negociacion' | 'cerrado' | 'perdido';
  notas: string;
  createdAt: string;
}

export interface LeadStats {
  total: number;
  pipeline: {
    nuevo: number;
    contactado: number;
    visita: number;
    negociacion: number;
    cerrado: number;
    perdido: number;
  };
}