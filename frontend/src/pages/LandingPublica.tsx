import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

interface Tenant {
  nombre: string;
  slug: string;
  telefono: string;
  whatsapp: string;
  foto: string;
  bio: string;
  zona: string;
  configuracion: {
    colorPrimario: string;
    colorSecundario: string;
    frase: string;
  };
}

interface Propiedad {
  _id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: 'MXN' | 'USD';
  tipo: 'venta' | 'renta';
  tipoPropiedad: 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina';
  zona: string;
  recamaras: number;
  banos: number;
  metros: number;
  metrosTerreno: number;
  estacionamientos: number;
  fotos: string[];
  amenidades: string[];
  destacada: boolean;
}

const LandingPublica = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'venta' | 'renta'>('todos');

  const [propiedadInteres, setPropiedadInteres] = useState<Propiedad | null>(null);
  const [modalContacto, setModalContacto] = useState(false);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      api.get(`/auth/publico/${slug}`),
      api.get(`/propiedades/publico/${slug}`),
    ])
      .then(([tenantRes, propRes]) => {
        setTenant(tenantRes.data);
        setPropiedades(propRes.data);
      })
      .catch(() => setNoEncontrado(true))
      .finally(() => setCargando(false));
  }, [slug]);

  const formatearPrecio = (precio: number, moneda: string) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda, maximumFractionDigits: 0 }).format(precio);

  const propiedadesFiltradas = propiedades.filter(
    p => filtroTipo === 'todos' || p.tipo === filtroTipo
  );

  const abrirContacto = (propiedad?: Propiedad) => {
    setPropiedadInteres(propiedad || null);
    setForm({ nombre: '', telefono: '', email: '', mensaje: '' });
    setEnviado(false);
    setErrorForm('');
    setModalContacto(true);
  };

  const enviarContacto = async () => {
    if (!form.nombre || !form.telefono) {
      setErrorForm('Nombre y teléfono son requeridos');
      return;
    }
    setEnviando(true);
    setErrorForm('');
    try {
      await api.post(`/leads/publico/${slug}`, {
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        mensaje: form.mensaje,
        propiedadId: propiedadInteres?._id,
      });
      setEnviado(true);
    } catch {
      setErrorForm('No se pudo enviar. Intenta de nuevo o contáctanos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (noEncontrado || !tenant) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-400">No encontramos a este asesor.</p>
        </div>
      </div>
    );
  }

  const colorPrimario = tenant.configuracion?.colorPrimario || '#1a1a2e';
  const colorSecundario = tenant.configuracion?.colorSecundario || '#f5a623';
  const whatsappLink = `https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="px-6 py-12 text-center border-b border-gray-800" style={{ background: `linear-gradient(180deg, ${colorPrimario}33, transparent)` }}>
        {tenant.foto ? (
          <img src={tenant.foto} alt={tenant.nombre} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2" style={{ borderColor: colorSecundario }} />
        ) : (
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: colorSecundario, color: colorPrimario }}
          >
            {tenant.nombre.charAt(0)}
          </div>
        )}
        <h1 className="text-2xl font-bold">{tenant.nombre}</h1>
        {tenant.zona && <p className="text-gray-400 text-sm mt-1">{tenant.zona}</p>}
        {tenant.configuracion?.frase && <p className="text-gray-300 mt-3 max-w-md mx-auto">{tenant.configuracion.frase}</p>}
        {tenant.bio && <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">{tenant.bio}</p>}

        <div className="flex items-center justify-center gap-3 mt-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: colorSecundario, color: colorPrimario }}
          >
            WhatsApp directo
          </a>
          <button
            onClick={() => abrirContacto()}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-gray-700 hover:border-gray-500 transition-colors"
          >
            Dejar mis datos
          </button>
        </div>
      </div>

      {/* Catálogo */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Propiedades disponibles</h2>
          <div className="flex gap-2">
            {(['todos', 'venta', 'renta'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  filtroTipo === t
                    ? 'bg-amber-500 text-gray-950 border-amber-500 font-semibold'
                    : 'text-gray-400 border-gray-800 hover:border-gray-600'
                }`}
              >
                {t === 'todos' ? 'Todas' : t === 'venta' ? 'Venta' : 'Renta'}
              </button>
            ))}
          </div>
        </div>

        {propiedadesFiltradas.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">No hay propiedades disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedadesFiltradas.map((p) => (
              <div key={p._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-800 flex items-center justify-center text-gray-600 text-sm relative">
                  {p.fotos?.[0] ? (
                    <img src={p.fotos[0]} alt={p.titulo} className="w-full h-full object-cover" />
                  ) : (
                    'Sin foto'
                  )}
                  {p.destacada && (
                    <span className="absolute top-3 left-3 text-xs bg-amber-500 text-gray-950 font-semibold px-2 py-0.5 rounded-full">
                      Destacada
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium w-fit mb-2 ${p.tipo === 'venta' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {p.tipo}
                  </span>
                  <h3 className="font-semibold">{p.titulo}</h3>
                  <p className="text-gray-500 text-sm">{p.zona}</p>
                  <p className="text-amber-500 font-bold text-lg mt-2">{formatearPrecio(p.precio, p.moneda)}</p>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{p.descripcion}</p>
                  <p className="text-gray-500 text-xs mt-3">
                    {p.tipoPropiedad === 'terreno'
                      ? `${p.metros} m² terreno`
                      : (p.tipoPropiedad === 'local' || p.tipoPropiedad === 'oficina')
                      ? `${p.banos} baños · ${p.metros} m²`
                      : `${p.recamaras} rec · ${p.banos} baños · ${p.metros} m²`}
                  </p>
                  <button
                    onClick={() => abrirContacto(p)}
                    className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Más información
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de contacto */}
      {modalContacto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6">
            {enviado ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-lg font-bold mb-2">¡Gracias!</h2>
                <p className="text-gray-400 text-sm mb-6">{tenant.nombre} te contactará pronto.</p>
                <button
                  onClick={() => setModalContacto(false)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">
                    {propiedadInteres ? `Sobre: ${propiedadInteres.titulo}` : 'Déjanos tus datos'}
                  </h2>
                  <button onClick={() => setModalContacto(false)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                {errorForm && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 mb-4 text-sm">
                    {errorForm}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Nombre *</label>
                    <input
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Teléfono *</label>
                    <input
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                      placeholder="10 dígitos"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Email</label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Mensaje</label>
                    <textarea
                      value={form.mensaje}
                      onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 h-20"
                      placeholder="¿En qué te puedo ayudar?"
                    />
                  </div>
                </div>

                <button
                  onClick={enviarContacto}
                  disabled={enviando}
                  className="w-full mt-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPublica;