import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login Successful');
      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = doc(db, 'registeredUsers', result.user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        // Agar user ka account already exist karta hai, toh user ko home page pe bhejenge
        alert('Login Successful');
        navigate('/home');
      } else {
        // Agar user ka account nahi hai, toh unhe register page pe bhejenge
        navigate('/register');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="waves">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="wave-svg"
        >
          <path
            fill="#6c63ff"
            fillOpacity="1"
            d="M0,224L60,202.7C120,181,240,139,360,133.3C480,128,600,160,720,186.7C840,213,960,235,1080,213.3C1200,192,1320,128,1380,96L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="auth-container">
        <h2>Here you can Login</h2>
        <p>Let's join us :)</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <button
          onClick={handleGoogleLogin}
          className="google-login-btn"
          disabled={loading}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google Icon"
            className="google-icon"
          />
          {loading ? 'Logging in with Google...' : 'Sign in with Google'}
        </button>
        <p className="signup-link">
          Don't have an account? <Link to="/register">Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
