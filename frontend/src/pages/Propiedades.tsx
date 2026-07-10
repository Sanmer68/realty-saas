import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface Propiedad {
  _id: string;
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
}

interface FormState {
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
  fotosTexto: string;
  amenidadesTexto: string;
  activa: boolean;
  destacada: boolean;
}

const vacio: FormState = {
  titulo: '',
  descripcion: '',
  precio: 0,
  moneda: 'MXN',
  tipo: 'venta',
  tipoPropiedad: 'casa',
  zona: '',
  direccion: '',
  recamaras: 0,
  banos: 0,
  metros: 0,
  metrosTerreno: 0,
  estacionamientos: 0,
  fotosTexto: '',
  amenidadesTexto: '',
  activa: true,
  destacada: false,
};

const numInputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const seleccionarTodo = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

const Propiedades = () => {
  const { tenant, logout } = useAuth();
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(vacio);
  const [guardando, setGuardando] = useState(false);

  const cargarPropiedades = () => {
    setCargando(true);
    api.get('/propiedades')
      .then(r => setPropiedades(r.data))
      .catch(() => setError('No se pudieron cargar las propiedades'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarPropiedades();
  }, []);

  const abrirNuevo = () => {
    setForm(vacio);
    setEditandoId(null);
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (p: Propiedad) => {
    setForm({
      titulo: p.titulo,
      descripcion: p.descripcion,
      precio: p.precio,
      moneda: p.moneda,
      tipo: p.tipo,
      tipoPropiedad: p.tipoPropiedad,
      zona: p.zona,
      direccion: p.direccion,
      recamaras: p.recamaras,
      banos: p.banos,
      metros: p.metros,
      metrosTerreno: p.metrosTerreno,
      estacionamientos: p.estacionamientos,
      fotosTexto: (p.fotos || []).join('\n'),
      amenidadesTexto: (p.amenidades || []).join(', '),
      activa: p.activa,
      destacada: p.destacada,
    });
    setEditandoId(p._id);
    setError('');
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!form.titulo || !form.descripcion || !form.precio || !form.zona) {
      setError('Faltan campos obligatorios: revisa los marcados con *');
      return;
    }
    setGuardando(true);
    setError('');

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      moneda: form.moneda,
      tipo: form.tipo,
      tipoPropiedad: form.tipoPropiedad,
      zona: form.zona,
      direccion: form.direccion,
      recamaras: Number(form.recamaras),
      banos: Number(form.banos),
      metros: Number(form.metros),
      metrosTerreno: Number(form.metrosTerreno),
      estacionamientos: Number(form.estacionamientos),
      fotos: form.fotosTexto.split('\n').map(f => f.trim()).filter(Boolean),
      amenidades: form.amenidadesTexto.split(',').map(a => a.trim()).filter(Boolean),
      activa: form.activa,
      destacada: form.destacada,
    };

    try {
      if (editandoId) {
        await api.put(`/propiedades/${editandoId}`, payload);
      } else {
        await api.post('/propiedades', payload);
      }
      setModalAbierto(false);
      cargarPropiedades();
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al guardar la propiedad');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta propiedad? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/propiedades/${id}`);
      cargarPropiedades();
    } catch {
      setError('No se pudo eliminar la propiedad');
    }
  };

  const esComercial = form.tipoPropiedad === 'terreno';
  const sinRecamaras = form.tipoPropiedad === 'terreno' || form.tipoPropiedad === 'local' || form.tipoPropiedad === 'oficina';
  const tieneTerrenoPropio = form.tipoPropiedad === 'casa' || form.tipoPropiedad === 'departamento';

  const formatearPrecio = (precio: number, moneda: string) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(precio);

  const precioTexto = form.precio === 0 ? '' : form.precio.toLocaleString('es-MX');
  const onCambiaPrecio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, precio: soloDigitos ? Number(soloDigitos) : 0 });
  };

  const numVal = (v: number) => (v === 0 ? '' : v);
  const onCambiaNum = (campo: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, [campo]: soloDigitos ? Number(soloDigitos) : 0 });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-amber-500 text-xl font-bold">Realty IA</a>
          <span className="text-gray-500 text-sm">Mis propiedades</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{tenant?.nombre}</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition-colors">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Mis propiedades</h1>
            <p className="text-gray-400 mt-1">{propiedades.length} propiedades en tu portafolio</p>
          </div>
          <button
            onClick={abrirNuevo}
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            + Agregar propiedad
          </button>
        </div>

        {error && !modalAbierto && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="text-gray-500 text-center py-16">Cargando propiedades...</div>
        ) : propiedades.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-gray-400 mb-4">Todavía no tienes propiedades cargadas</p>
            <button onClick={abrirNuevo} className="text-amber-500 hover:text-amber-400 font-medium">
              Agrega tu primera propiedad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propiedades.map((p) => (
              <div key={p._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="h-40 bg-gray-800 flex items-center justify-center text-gray-600 text-sm">
                  {p.fotos?.[0] ? (
                    <img src={p.fotos[0]} alt={p.titulo} className="w-full h-full object-cover" />
                  ) : (
                    'Sin foto'
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium ${p.tipo === 'venta' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {p.tipo}
                    </span>
                    {p.destacada && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 uppercase font-medium">
                        Destacada
                      </span>
                    )}
                    {!p.activa && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 uppercase font-medium">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold truncate">{p.titulo}</h3>
                  <p className="text-gray-500 text-sm truncate">{p.zona}</p>
                  <p className="text-amber-500 font-bold mt-2">{formatearPrecio(p.precio, p.moneda)}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {p.tipoPropiedad === 'terreno'
                      ? `${p.metros} m² terreno`
                      : (p.tipoPropiedad === 'local' || p.tipoPropiedad === 'oficina')
                      ? `${p.banos} baños · ${p.metros} m²`
                      : `${p.recamaras} rec · ${p.banos} baños · ${p.metros} m² const.${p.metrosTerreno ? ` · ${p.metrosTerreno} m² terreno` : ''}`}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminar(p._id)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm py-2 rounded-lg transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 pb-4 border-b border-gray-800 flex-shrink-0">
              <h2 className="text-xl font-bold">
                {editandoId ? 'Editar propiedad' : 'Nueva propiedad'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">Los campos con * son obligatorios</p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 mt-3 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400 mb-1 block">Título *</label>
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="Casa en Cancún centro"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400 mb-1 block">Descripción *</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 h-24"
                    placeholder="Describe la propiedad..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Precio *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={precioTexto}
                    onChange={onCambiaPrecio}
                    onFocus={seleccionarTodo}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Moneda</label>
                  <select
                    value={form.moneda}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="venta">Venta</option>
                    <option value="renta">Renta</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Tipo de propiedad</label>
                  <select
                    value={form.tipoPropiedad}
                    onChange={(e) => setForm({ ...form, tipoPropiedad: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="local">Local</option>
                    <option value="oficina">Oficina</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Zona *</label>
                  <input
                    value={form.zona}
                    onChange={(e) => setForm({ ...form, zona: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="Región 15"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Dirección</label>
                  <input
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {!sinRecamaras && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Recámaras</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={numVal(form.recamaras)}
                      onChange={onCambiaNum('recamaras')}
                      onFocus={seleccionarTodo}
                      className={numInputClass}
                      placeholder="0"
                    />
                  </div>
                )}

                {!esComercial && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Baños</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={numVal(form.banos)}
                      onChange={onCambiaNum('banos')}
                      onFocus={seleccionarTodo}
                      className={numInputClass}
                      placeholder="0"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    {esComercial ? 'Metros² del terreno' : 'Metros² de construcción'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={numVal(form.metros)}
                    onChange={onCambiaNum('metros')}
                    onFocus={seleccionarTodo}
                    className={numInputClass}
                    placeholder="0"
                  />
                </div>

                {tieneTerrenoPropio && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Metros² del terreno</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={numVal(form.metrosTerreno)}
                      onChange={onCambiaNum('metrosTerreno')}
                      onFocus={seleccionarTodo}
                      className={numInputClass}
                      placeholder="0"
                    />
                  </div>
                )}

                {!esComercial && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Estacionamientos</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={numVal(form.estacionamientos)}
                      onChange={onCambiaNum('estacionamientos')}
                      onFocus={seleccionarTodo}
                      className={numInputClass}
                      placeholder="0"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400 mb-1 block">Fotos (una URL por línea)</label>
                  <textarea
                    value={form.fotosTexto}
                    onChange={(e) => setForm({ ...form, fotosTexto: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 h-16"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400 mb-1 block">Amenidades (separadas por coma)</label>
                  <input
                    value={form.amenidadesTexto}
                    onChange={(e) => setForm({ ...form, amenidadesTexto: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    placeholder="Alberca, Jardín, Seguridad 24h"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.activa}
                    onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                    className="accent-amber-500"
                    id="activa"
                  />
                  <label htmlFor="activa" className="text-sm text-gray-400">Activa (visible en tu landing)</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.destacada}
                    onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
                    className="accent-amber-500"
                    id="destacada"
                  />
                  <label htmlFor="destacada" className="text-sm text-gray-400">Destacada</label>
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-800 flex gap-3 flex-shrink-0">
              <button
                onClick={() => { setModalAbierto(false); setError(''); }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors"
              >
                {guardando ? 'Guardando...' : 'Guardar propiedad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Propiedades;