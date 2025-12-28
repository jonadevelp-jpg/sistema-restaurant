import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Redirigir al dashboard
        window.location.href = '/admin/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-slate-900">
        Iniciar Sesión
      </h1>
      
      <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            className="w-full min-h-[48px] px-4 py-3 text-base sm:text-lg border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-gold-300 focus:border-gold-500 transition-all"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            className="w-full min-h-[48px] px-4 py-3 text-base sm:text-lg border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-gold-300 focus:border-gold-500 transition-all"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base font-medium"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-label={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          className="w-full min-h-[56px] bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-white font-bold text-base sm:text-lg py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gold-300 transition-all"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}

