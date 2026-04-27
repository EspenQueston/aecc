import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, ConfirmProvider } from './components/common/ConfirmToast';
import PublicLayout from './components/layout/PublicLayout';
import ScrollToTop from './components/common/ScrollToTop';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Blogs from './pages/public/Blogs';
import BlogDetails from './pages/public/BlogDetails';
import Resources from './pages/public/Resources';
import Events from './pages/public/Events';
import EventDetails from './pages/public/EventDetails';
import Learning from './pages/public/Learning';
import LearningDetail from './pages/public/LearningDetail';
import MemberCV from './pages/public/MemberCV';
import Equipe from './pages/public/Equipe';
import ScholarshipsDetail from './pages/public/ScholarshipsDetail';
import ActivitiesDetail from './pages/public/ActivitiesDetail';
import RelationsDetail from './pages/public/RelationsDetail';
import Contact from './pages/public/Contact';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Profile from './pages/public/Profile';
import SearchResults from './pages/public/SearchResults';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminEvents from './pages/admin/AdminEvents';
import AdminResources from './pages/admin/AdminResources';

import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminContacts from './pages/admin/AdminContacts';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminLearning from './pages/admin/AdminLearning';

function ScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const SELECTOR = '.reveal,.reveal-fade,.reveal-left,.reveal-right,.reveal-scale';
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const id = setTimeout(() => {
      document.querySelectorAll(SELECTOR).forEach(el => observer.observe(el));
    }, 60);
    return () => { clearTimeout(id); observer.disconnect(); };
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <ConfirmProvider>
        <Router>
        <ScrollToTop />
        <ScrollReveal />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/learning/resource/:slug" element={<LearningDetail />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/equipe/:slug" element={<MemberCV />} />
            <Route path="/bourses" element={<ScholarshipsDetail />} />
            <Route path="/activites" element={<ActivitiesDetail />} />
            <Route path="/relations" element={<RelationsDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<SearchResults />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/blogs" element={<AdminBlogs />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/learning" element={<AdminLearning />} />

              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/contacts" element={<AdminContacts />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
        </Router>
        </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
