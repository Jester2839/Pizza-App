import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      if (data.role === 'admin') {
        sessionStorage.setItem('admin_token', data.token);
        sessionStorage.setItem('admin_role', data.role);
        onLoginSuccess();
      } else {
        setError('Nemáte oprávnění pro přístup do administrace.');
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při přihlašování.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <button className="admin-login-close" onClick={() => navigate('/')} title="Zavřít">
          <i className="ph ph-x"></i>
        </button>
        <div className="admin-login-card__logo">
          <i className="ph-fill ph-pizza"></i>
          <h2>Přihlášení</h2>
        </div>
        <p>Podívejte se na svou historii objednávek</p>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Uživatelské jméno</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            //   placeholder="login"
            />
          </div>
          <div className="form-group">
            <label>Heslo</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            //   placeholder="••••••••"
            />
          </div>
          
          {error && <div className="admin-error-small">{error}</div>}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Ověřování...' : 'Přihlásit se'}
          </button>
        </form>
      </div>
    </div>
  );
};