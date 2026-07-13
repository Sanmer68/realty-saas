import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface Lead {
  _id: string;
  nombre: string;
  telefono: string;
  email: string;
  mensaje: string;
  canal: 'landing' | 'whatsapp' | 'portal' | 'referido';
  estado: 'nuevo' | 'contactado' | 'visita' | 'negociacion' | 'cerrado' | 'perdido';
  notas: string;
  propiedad?: { _id: string; titulo: string; precio: number; zona: string } | null;
  createdAt: string;
}

const columnas: { key: Lead['estado']; label: string; color: string }[] = [
  { key: 'nuevo', label: 'Nuevo', color: 'text-blue-400 border-blue-500/30' },
  { key: 'contactado', label: 'Contactado', color: 'text-purple-400 border-purple-500/30' },
  { key: 'visita', label: 'En visita', color: 'text-amber-400 border-amber-500/30' },
  { key: 'negociacion', label: 'Negociación', color: 'text-orange-400 border-orange-500/30' },
  { key: 'cerrado', label: 'Cerrado', color: 'text-green-400 border-green-500/30' },
  { key: 'perdido', label: 'Perdido', color: 'text-gray-500 border-gray-700' },
];

const canalLabel: Record<Lead['canal'], string> = {
  landing: 'Landing',
  whatsapp: 'WhatsApp',
  portal: 'Portal',
  referido: 'Referido',
};

const CRM = () => {
  const { tenant, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [leadAbierto, setLeadAbierto] = useState<Lead | null>(null);
  const [notasEdit, setNotasEdit] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarLeads = () => {
    setCargando(true);
    api.get('/leads')
      .then(r => setLeads(r.data))
      .catch(() => setError('No se pudieron cargar los leads'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarLeads();
  }, []);

  const abrirLead = (lead: Lead) => {
    setLeadAbierto(lead);
    setNotasEdit(lead.notas || '');
    setError('');
  };

  const cambiarEstado = async (leadId: string, estado: Lead['estado']) => {
    setGuardando(true);
    setError('');
    try {
      const { data } = await api.put(`/leads/${leadId}`, { estado });
      setLeads(prev => prev.map(l => (l._id === leadId ? data : l)));
      if (leadAbierto?._id === leadId) setLeadAbierto(data);
    } catch {
      setError('No se pudo actualizar el estado');
    } finally {
      setGuardando(false);
    }
  };

  const guardarNotas = async () => {
    if (!leadAbierto) return;
    setGuardando(true);
    setError('');
    try {
      const { data } = await api.put(`/leads/${leadAbierto._id}`, { notas: notasEdit });
      setLeads(prev => prev.map(l => (l._id === leadAbierto._id ? data : l)));
      setLeadAbierto(data);
    } catch {
      setError('No se pudieron guardar las notas');
    } finally {
      setGuardando(false);
    }
  };

  const formatearPrecio = (precio: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(precio);

  const tiempoRelativo = (fecha: string) => {
    const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    return `Hace ${dias} días`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-amber-500 text-xl font-bold">Realty IA</a>
          <span className="text-gray-500 text-sm">CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{tenant?.nombre}</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition-colors">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-gray-400 mt-1">{leads.length} leads en tu pipeline</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="text-gray-500 text-center py-16">Cargando leads...</div>
        ) : leads.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-400">Todavía no tienes leads. Aparecerán aquí en cuanto alguien escriba en tu landing.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columnas.map((col) => {
              const leadsCol = leads.filter(l => l.estado === col.key);
              return (
                <div key={col.key} className="flex-shrink-0 w-72">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${col.color} bg-gray-900 mb-3`}>
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{leadsCol.length}</span>
                  </div>

                  <div className="space-y-3">
                    {leadsCol.map((lead) => (
                      <button
                        key={lead._id}
                        onClick={() => abrirLead(lead)}
                        className="w-full text-left bg-gray-900 border border-gray-800 hover:border-amber-500/50 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm truncate">{lead.nombre}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{tiempoRelativo(lead.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{lead.telefono}</p>
                        {lead.propiedad && (
                          <p className="text-xs text-amber-500/80 truncate mb-2">{lead.propiedad.titulo}</p>
                        )}
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                          {canalLabel[lead.canal]}
                        </span>
                      </button>
                    ))}
                    {leadsCol.length === 0 && (
                      <div className="text-xs text-gray-600 text-center py-6 border border-dashed border-gray-800 rounded-lg">
                        Sin leads aquí
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {leadAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="p-6 pb-4 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{leadAbierto.nombre}</h2>
                <button onClick={() => setLeadAbierto(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 mt-3 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Teléfono</label>
                <a href={`tel:${leadAbierto.telefono}`} className="text-amber-500 hover:underline">{leadAbierto.telefono}</a>
              </div>

              {leadAbierto.email && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Email</label>
                  <p>{leadAbierto.email}</p>
                </div>
              )}

              {leadAbierto.propiedad && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Propiedad de interés</label>
                  <p className="font-medium">{leadAbierto.propiedad.titulo}</p>
                  <p className="text-sm text-gray-400">{leadAbierto.propiedad.zona} · {formatearPrecio(leadAbierto.propiedad.precio)}</p>
                </div>
              )}

              {leadAbierto.mensaje && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Mensaje original</label>
                  <p className="text-sm bg-gray-800 rounded-lg p-3">{leadAbierto.mensaje}</p>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 block mb-1">Canal</label>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                  {canalLabel[leadAbierto.canal]}
                </span>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Mover a</label>
                <div className="flex flex-wrap gap-2">
                  {columnas.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => cambiarEstado(leadAbierto._id, col.key)}
                      disabled={guardando}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                        leadAbierto.estado === col.key
                          ? `${col.color} bg-gray-800`
                          : 'text-gray-500 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notas</label>
                <textarea
                  value={notasEdit}
                  onChange={(e) => setNotasEdit(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 h-24"
                  placeholder="Agrega notas de seguimiento..."
                />
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-800 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setLeadAbierto(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={guardarNotas}
                disabled={guardando}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors"
              >
                {guardando ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;