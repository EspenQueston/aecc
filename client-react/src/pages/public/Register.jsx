import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CHINA_PROVINCES from '../../data/chinaProvinces';
import AuthDotMap from '../../components/auth/AuthDotMap';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  // Handle ?verified= query param from email verification redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified');
    if (verified === 'success') {
      setVerificationMessage('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.');
      setMode('login');
      window.history.replaceState({}, '', location.pathname);
    } else if (verified === 'expired') {
      setVerificationMessage('Le lien de vérification a expiré. Veuillez en demander un nouveau.');
      setMode('login');
      window.history.replaceState({}, '', location.pathname);
    } else if (verified === 'error') {
      setVerificationMessage('Une erreur est survenue lors de la vérification.');
      setMode('login');
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '', twoFactorToken: '' });

  const [regStep, setRegStep] = useState(1);
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', secondName: '', dateOfBirth: '',
    gender: '', passportNumber: '', phoneNumber: '', wechatId: '',
    province: '', city: '', lastEntryDate: '',
    university: '', fieldOfStudy: '', degreeLevel: '',
    yearOfAdmission: '', expectedGraduation: '',
    scholarshipStatus: '', scholarshipType: '', studentId: '',
    email: '', password: '', confirmPassword: ''
  });

  const provinces = Object.keys(CHINA_PROVINCES).sort();
  const cities = useMemo(() => {
    return regForm.province ? (CHINA_PROVINCES[regForm.province] || []) : [];
  }, [regForm.province]);

  function calculateAge(dob) {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setVerificationMessage('');
    setNeedsVerification(false);
    setLoading(true);
    try {
      const result = await login(loginForm.email, loginForm.password, show2FA ? loginForm.twoFactorToken : undefined);
      if (result?.requires2FA) {
        setShow2FA(true);
        setLoading(false);
        return;
      }
      navigate('/profile');
    } catch (err) {
      if (err.data?.needsVerification) {
        setNeedsVerification(true);
        setVerifiedEmail(err.data.email || loginForm.email);
        setError('Veuillez vérifier votre adresse email avant de vous connecter');
      } else {
        setError(err.data?.errors?.[0]?.msg || err.message || 'Erreur de connexion');
      }
    }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (regForm.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal: {
            firstName: regForm.firstName, lastName: regForm.lastName,
            secondName: regForm.secondName, dateOfBirth: regForm.dateOfBirth,
            gender: regForm.gender, passportNumber: regForm.passportNumber,
            phoneNumber: regForm.phoneNumber, wechatId: regForm.wechatId,
            province: regForm.province, city: regForm.city,
            lastEntryDate: regForm.lastEntryDate
          },
          academic: {
            university: regForm.university, fieldOfStudy: regForm.fieldOfStudy,
            degreeLevel: regForm.degreeLevel, yearOfAdmission: regForm.yearOfAdmission,
            expectedGraduation: regForm.expectedGraduation,
            scholarshipStatus: regForm.scholarshipStatus,
            scholarshipType: regForm.scholarshipType, studentId: regForm.studentId
          },
          account: { email: regForm.email, password: regForm.password }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.msg || 'Échec de l\'inscription');
      if (data.requiresVerification) {
        setVerificationSent(true);
        setVerifiedEmail(data.email || regForm.email);
      } else {
        localStorage.setItem('token', data.token);
        navigate('/profile');
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleResendVerification() {
    const emailToResend = verifiedEmail || regForm.email || loginForm.email;
    if (!emailToResend) return;
    setResendingEmail(true);
    setError('');
    try {
      const res = await fetch('/api/users/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToResend })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Erreur');
      setVerificationMessage('Un nouveau lien de vérification a été envoyé à votre email.');
    } catch (err) {
      setError(err.message);
    }
    setResendingEmail(false);
  }

  function handleRegChange(e) {
    const { name, value } = e.target;
    if (name === 'province') {
      setRegForm({ ...regForm, province: value, city: '' });
    } else {
      setRegForm({ ...regForm, [name]: value });
    }
  }

  function validateStep(step) {
    if (step === 1) {
      if (!regForm.firstName || !regForm.lastName || !regForm.dateOfBirth || !regForm.gender) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
      const age = calculateAge(regForm.dateOfBirth);
      if (age < 15) {
        setError('Vous devez avoir au moins 15 ans pour vous inscrire');
        return false;
      }
      if (age > 65) {
        setError('Veuillez vérifier votre date de naissance');
        return false;
      }
    }
    if (step === 2) {
      if (!regForm.passportNumber || !regForm.phoneNumber || !regForm.wechatId || !regForm.province || !regForm.city || !regForm.lastEntryDate) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
      if (!/^OA\d{7}$/.test(regForm.passportNumber)) {
        setError('Le numéro de passeport doit commencer par OA suivi de 7 chiffres (ex: OA1234567)');
        return false;
      }
    }
    if (step === 3) {
      if (!regForm.university || !regForm.fieldOfStudy || !regForm.degreeLevel || !regForm.expectedGraduation || !regForm.scholarshipStatus) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
      if (regForm.scholarshipStatus === 'yes' && !regForm.scholarshipType) {
        setError('Veuillez sélectionner le type de bourse');
        return false;
      }
    }
    setError('');
    return true;
  }

  const dobAge = regForm.dateOfBirth ? calculateAge(regForm.dateOfBirth) : null;

  return (
    <div className="auth-standalone">
      <Link to="/" className="auth-home-link"><i className="fas fa-arrow-left"></i> Retour au site</Link>
      <section className="auth-section">
        <div className="container">
        <div className="auth-wrapper">
          <div className="auth-sidebar-panel">
            <AuthDotMap />
            <div className="auth-sidebar-overlay">
              <div className="auth-sidebar-logo">
                <div className="auth-logo-img-wrap">
                  <img src="/logo.png" alt="AECC" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="auth-logo-fallback">🇨🇬</div>
                </div>
                <h2>AECC</h2>
                <p>Congo — Chine</p>
              </div>
              <h3 className="auth-sidebar-title">Bienvenue dans la communauté</h3>
              <p className="auth-sidebar-sub">Rejoignez la plus grande communauté d'étudiants congolais en Chine</p>
              <div className="auth-features">
                <div className="auth-feature"><i className="fas fa-users"></i><span>+500 étudiants membres</span></div>
                <div className="auth-feature"><i className="fas fa-university"></i><span>+50 universités couvertes</span></div>
                <div className="auth-feature"><i className="fas fa-calendar-alt"></i><span>Événements exclusifs</span></div>
                <div className="auth-feature"><i className="fas fa-hands-helping"></i><span>Entraide communautaire</span></div>
              </div>
            </div>
          </div>

          <div className="auth-form-panel">
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
                <i className="fas fa-sign-in-alt"></i> Connexion
              </button>
              <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>
                <i className="fas fa-user-plus"></i> Inscription
              </button>
            </div>

            {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            {verificationMessage && <div className="alert alert-success" style={{background:'#f0fdf4',color:'#166534',border:'1px solid #bbf7d0'}}><i className="fas fa-check-circle"></i> {verificationMessage}</div>}

            {/* Email verification sent screen */}
            {(verificationSent || needsVerification) ? (
              <div className="auth-form" style={{textAlign:'center',padding:'2rem 1.5rem'}}>
                <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>
                  <i className="fas fa-envelope-open-text" style={{color:'#B7222D'}}></i>
                </div>
                <h3 style={{marginBottom:'.5rem'}}>Vérifiez votre email</h3>
                <p style={{color:'#555',fontSize:'.92rem',lineHeight:'1.6',marginBottom:'1.2rem'}}>
                  {verificationSent
                    ? <>Un email de vérification a été envoyé à <strong>{verifiedEmail}</strong>. Cliquez sur le lien dans l'email pour activer votre compte.</>
                    : <>Votre email <strong>{verifiedEmail}</strong> n'est pas encore vérifié. Vérifiez votre boîte de réception ou demandez un nouveau lien.</>
                  }
                </p>
                <button type="button" onClick={handleResendVerification} disabled={resendingEmail}
                  style={{padding:'.6rem 1.5rem',background:'var(--white)',border:'1.5px solid var(--border)',borderRadius:'8px',cursor:'pointer',fontSize:'.88rem',color:'var(--text)',fontWeight:'500',transition:'all .2s'}}>
                  {resendingEmail ? <><i className="fas fa-spinner fa-spin"></i> Envoi...</> : <><i className="fas fa-redo"></i> Renvoyer l'email de vérification</>}
                </button>
                <div style={{marginTop:'1.5rem',paddingTop:'1rem',borderTop:'1px solid #eee'}}>
                  <button type="button" onClick={() => { setVerificationSent(false); setNeedsVerification(false); setMode('login'); setError(''); }}
                    style={{background:'none',border:'none',color:'#B7222D',cursor:'pointer',fontSize:'.88rem',fontWeight:'500'}}>
                    <i className="fas fa-arrow-left"></i> Retour à la connexion
                  </button>
                </div>
                <p style={{color:'#999',fontSize:'.78rem',marginTop:'1rem'}}>
                  <i className="fas fa-info-circle"></i> Vérifiez aussi vos spams. Le lien expire après 24h.
                </p>
              </div>
            ) : mode === 'login' ? (
              <form onSubmit={handleLogin} className="auth-form">
                <h3>Bienvenue !</h3>
                <p className="auth-subtitle">Connectez-vous à votre compte AECC</p>
                <div className="form-group">
                  <label><i className="fas fa-envelope"></i> Email</label>
                  <input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="votreemail@exemple.com" required />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-lock"></i> Mot de passe</label>
                  <div className="input-with-icon">
                    <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="Votre mot de passe" required />
                    <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
                {show2FA && (
                  <div className="form-group twofa-input">
                    <label><i className="fas fa-shield-alt"></i> Code 2FA</label>
                    <input type="text" value={loginForm.twoFactorToken} onChange={e => setLoginForm({...loginForm, twoFactorToken: e.target.value})} placeholder="Code à 6 chiffres" maxLength={6} required />
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Connexion...</> : <><i className="fas fa-sign-in-alt"></i> Se connecter</>}
                </button>
                <p style={{ textAlign: 'right', marginTop: '.5rem', marginBottom: 0 }}>
                  <Link to="/forgot-password" style={{ color: '#B7222D', fontSize: '.85rem', textDecoration: 'none', fontWeight: '500' }}>
                    Mot de passe oublié ?
                  </Link>
                </p>
                <p className="auth-switch-text">
                  Pas encore membre ? <button type="button" className="link-btn" onClick={() => { setMode('register'); setError(''); }}>Créer un compte</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="step-progress">
                  <div className={`step-dot ${regStep >= 1 ? 'active' : ''} ${regStep > 1 ? 'done' : ''}`}>
                    <span>{regStep > 1 ? <i className="fas fa-check"></i> : '1'}</span>
                    <small>Identité</small>
                  </div>
                  <div className={`step-line ${regStep > 1 ? 'done' : ''}`}></div>
                  <div className={`step-dot ${regStep >= 2 ? 'active' : ''} ${regStep > 2 ? 'done' : ''}`}>
                    <span>{regStep > 2 ? <i className="fas fa-check"></i> : '2'}</span>
                    <small>Contact</small>
                  </div>
                  <div className={`step-line ${regStep > 2 ? 'done' : ''}`}></div>
                  <div className={`step-dot ${regStep >= 3 ? 'active' : ''} ${regStep > 3 ? 'done' : ''}`}>
                    <span>{regStep > 3 ? <i className="fas fa-check"></i> : '3'}</span>
                    <small>Études</small>
                  </div>
                  <div className={`step-line ${regStep > 3 ? 'done' : ''}`}></div>
                  <div className={`step-dot ${regStep >= 4 ? 'active' : ''}`}>
                    <span>4</span>
                    <small>Compte</small>
                  </div>
                </div>

                {/* Step 1: Identité */}
                {regStep === 1 && (
                  <div className="form-step animate-in">
                    <h3><i className="fas fa-user"></i> Identité</h3>
                    <p className="form-step-desc">Vos informations personnelles</p>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Prénom <span className="required">*</span></label>
                        <input name="firstName" value={regForm.firstName} onChange={handleRegChange} placeholder="Votre prénom" required />
                      </div>
                      <div className="form-group">
                        <label>Nom <span className="required">*</span></label>
                        <input name="lastName" value={regForm.lastName} onChange={handleRegChange} placeholder="Votre nom de famille" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Post-nom <span className="optional">(facultatif)</span></label>
                      <input name="secondName" value={regForm.secondName} onChange={handleRegChange} placeholder="Votre post-nom" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date de naissance <span className="required">*</span></label>
                        <input type="date" name="dateOfBirth" value={regForm.dateOfBirth} onChange={handleRegChange} max={new Date().toISOString().split('T')[0]} required />
                        {dobAge !== null && (
                          <span className={`form-hint ${dobAge < 15 ? 'text-danger' : 'text-success'}`}>
                            <i className={`fas fa-${dobAge < 15 ? 'exclamation-triangle' : 'check-circle'}`}></i> {dobAge} ans
                          </span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Genre <span className="required">*</span></label>
                        <select name="gender" value={regForm.gender} onChange={handleRegChange} required>
                          <option value="">— Sélectionner —</option>
                          <option value="male">Homme</option>
                          <option value="female">Femme</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                    </div>
                    <button type="button" className="btn btn-primary btn-block" onClick={() => validateStep(1) && setRegStep(2)}>
                      Suivant <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                )}

                {/* Step 2: Coordonnées & Séjour */}
                {regStep === 2 && (
                  <div className="form-step animate-in">
                    <h3><i className="fas fa-id-card"></i> Coordonnées & Séjour</h3>
                    <p className="form-step-desc">Passeport, contact et localisation en Chine</p>

                    <div className="form-row">
                      <div className="form-group">
                        <label>N° Passeport <span className="required">*</span></label>
                        <input name="passportNumber" value={regForm.passportNumber} onChange={handleRegChange} pattern="^OA\d{7}$" placeholder="OA1234567" maxLength={9} required />
                        <span className="form-hint"><i className="fas fa-info-circle"></i> Format: OA + 7 chiffres</span>
                      </div>
                      <div className="form-group">
                        <label>Téléphone <span className="required">*</span></label>
                        <input name="phoneNumber" value={regForm.phoneNumber} onChange={handleRegChange} placeholder="+86 138 0000 0000" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>WeChat ID <span className="required">*</span></label>
                      <input name="wechatId" value={regForm.wechatId} onChange={handleRegChange} placeholder="Votre identifiant WeChat" required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Province en Chine <span className="required">*</span></label>
                        <select name="province" value={regForm.province} onChange={handleRegChange} required>
                          <option value="">— Sélectionner —</option>
                          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Ville <span className="required">*</span></label>
                        <select name="city" value={regForm.city} onChange={handleRegChange} required disabled={!regForm.province}>
                          <option value="">{regForm.province ? '— Sélectionner —' : '— Province d\'abord —'}</option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Date d'entrée en Chine <span className="required">*</span></label>
                      <input type="date" name="lastEntryDate" value={regForm.lastEntryDate} onChange={handleRegChange} max={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-outline" onClick={() => setRegStep(1)}>
                        <i className="fas fa-arrow-left"></i> Précédent
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => validateStep(2) && setRegStep(3)}>
                        Suivant <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Études */}
                {regStep === 3 && (
                  <div className="form-step animate-in">
                    <h3><i className="fas fa-graduation-cap"></i> Études</h3>
                    <p className="form-step-desc">Informations académiques</p>

                    <div className="form-group">
                      <label>Université <span className="required">*</span></label>
                      <input name="university" value={regForm.university} onChange={handleRegChange} placeholder="Nom de votre université" required />
                    </div>
                    <div className="form-group">
                      <label>Filière / Spécialité <span className="required">*</span></label>
                      <input name="fieldOfStudy" value={regForm.fieldOfStudy} onChange={handleRegChange} placeholder="Ex: Génie informatique, Médecine..." required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Niveau d'études <span className="required">*</span></label>
                        <select name="degreeLevel" value={regForm.degreeLevel} onChange={handleRegChange} required>
                          <option value="">— Sélectionner —</option>
                          <option value="language">Cours de langue (汉语)</option>
                          <option value="bachelor">Licence (本科)</option>
                          <option value="master">Master (硕士)</option>
                          <option value="phd">Doctorat (博士)</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Année d'admission <span className="optional">(facultatif)</span></label>
                        <input type="number" name="yearOfAdmission" value={regForm.yearOfAdmission} onChange={handleRegChange} min="2000" max={new Date().getFullYear() + 1} placeholder="Ex: 2023" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Fin d'études prévue <span className="required">*</span></label>
                      <input type="date" name="expectedGraduation" value={regForm.expectedGraduation} onChange={handleRegChange} required />
                    </div>
                    <div className="form-group">
                      <label>Statut de bourse <span className="required">*</span></label>
                      <select name="scholarshipStatus" value={regForm.scholarshipStatus} onChange={handleRegChange} required>
                        <option value="">— Êtes-vous boursier ? —</option>
                        <option value="yes">Oui, je suis boursier</option>
                        <option value="no">Non, je suis autofinancé</option>
                      </select>
                    </div>
                    {regForm.scholarshipStatus === 'yes' && (
                      <div className="form-group animate-in">
                        <label>Type de bourse <span className="required">*</span></label>
                        <select name="scholarshipType" value={regForm.scholarshipType} onChange={handleRegChange} required>
                          <option value="">— Sélectionner le type —</option>
                          <option value="Chinese Government Scholarship">🇨🇳 Bourse du gouvernement chinois (CSC)</option>
                          <option value="Provincial Government Scholarship">🏛️ Bourse du gouvernement provincial</option>
                          <option value="Municipality Scholarship">🏙️ Bourse municipale</option>
                          <option value="University Scholarship">🎓 Bourse universitaire</option>
                          <option value="Enterprise Scholarship">🏢 Bourse d'entreprise</option>
                          <option value="Congolese Government Scholarship">🇨🇬 Bourse du gouvernement congolais</option>
                          <option value="other">📋 Autre type de bourse</option>
                        </select>
                      </div>
                    )}
                    <div className="form-group">
                      <label>N° Étudiant <span className="optional">(facultatif)</span></label>
                      <input name="studentId" value={regForm.studentId} onChange={handleRegChange} placeholder="Votre numéro d'étudiant" />
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-outline" onClick={() => setRegStep(2)}>
                        <i className="fas fa-arrow-left"></i> Précédent
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => validateStep(3) && setRegStep(4)}>
                        Suivant <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Compte */}
                {regStep === 4 && (
                  <div className="form-step animate-in">
                    <h3><i className="fas fa-user-shield"></i> Créer votre compte</h3>
                    <p className="form-step-desc">Définissez vos identifiants de connexion</p>

                    <div className="reg-summary">
                      <h4><i className="fas fa-clipboard-check"></i> Résumé</h4>
                      <div className="summary-grid">
                        <div className="summary-item"><span className="summary-label">Nom</span><span>{regForm.firstName} {regForm.lastName}</span></div>
                        <div className="summary-item"><span className="summary-label">Province</span><span>{regForm.province}</span></div>
                        <div className="summary-item"><span className="summary-label">Université</span><span>{regForm.university}</span></div>
                        <div className="summary-item"><span className="summary-label">Niveau</span><span>{regForm.degreeLevel}</span></div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label><i className="fas fa-envelope"></i> Email <span className="required">*</span></label>
                      <input type="email" name="email" value={regForm.email} onChange={handleRegChange} placeholder="votreemail@exemple.com" required />
                    </div>
                    <div className="form-group">
                      <label><i className="fas fa-lock"></i> Mot de passe <span className="required">*</span></label>
                      <div className="input-with-icon">
                        <input type={showPassword ? 'text' : 'password'} name="password" value={regForm.password} onChange={handleRegChange} minLength={8} placeholder="Minimum 8 caractères" required />
                        <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                          <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                      {regForm.password && (
                        <div className="password-strength">
                          <div className={`strength-bar ${regForm.password.length >= 12 ? 'strong' : regForm.password.length >= 8 ? 'medium' : 'weak'}`}></div>
                          <span>{regForm.password.length >= 12 ? 'Fort' : regForm.password.length >= 8 ? 'Moyen' : 'Faible'}</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label><i className="fas fa-lock"></i> Confirmer le mot de passe <span className="required">*</span></label>
                      <input type="password" name="confirmPassword" value={regForm.confirmPassword} onChange={handleRegChange} minLength={8} placeholder="Retapez le mot de passe" required />
                      {regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                        <span className="form-hint text-danger"><i className="fas fa-times-circle"></i> Les mots de passe ne correspondent pas</span>
                      )}
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-outline" onClick={() => setRegStep(3)}>
                        <i className="fas fa-arrow-left"></i> Précédent
                      </button>
                      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Inscription...</> : <><i className="fas fa-check-circle"></i> Créer mon compte</>}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
