import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../lib/api';

interface Stats {
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

const Dashboard = () => {
  const { tenant, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/leads/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 text-xl font-bold">Realty IA</span>
          <span className="text-gray-500 text-sm">Panel del asesor</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{tenant?.nombre}</span>
          <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full uppercase">{tenant?.plan}</span>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition-colors">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Bienvenida, {tenant?.nombre?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Tu landing está en: <span className="text-amber-500">localhost:5173/{tenant?.slug}</span></p>
        </div>

        {/* Stats del CRM */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total leads', value: stats?.total ?? 0, color: 'text-white' },
            { label: 'Nuevos', value: stats?.pipeline.nuevo ?? 0, color: 'text-blue-400' },
            { label: 'En visita', value: stats?.pipeline.visita ?? 0, color: 'text-amber-400' },
            { label: 'Cerrados', value: stats?.pipeline.cerrado ?? 0, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Mis propiedades', desc: 'Agrega y administra tu portafolio', href: '/propiedades', icon: '🏠' },
            { title: 'CRM', desc: 'Gestiona tus leads y pipeline', href: '/crm', icon: '📋' },
            { title: 'Mi perfil', desc: 'Configura tu estilo y personalidad', href: '/perfil', icon: '⚙️' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="bg-gray-900 border border-gray-800 hover:border-amber-500/50 rounded-xl p-6 transition-colors group">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-semibold group-hover:text-amber-500 transition-colors">{item.title}</div>
              <div className="text-gray-500 text-sm mt-1">{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;