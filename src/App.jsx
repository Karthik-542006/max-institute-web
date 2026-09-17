import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import { dataService } from './lib/dataService';

// Public Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Faculty from './pages/Faculty';
import Gallery from './pages/Gallery';
import Reviews from './pages/Reviews';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';

// Admin Components & Pages
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ManageCourses from './admin/ManageCourses';
import ManageFaculty from './admin/ManageFaculty';
import ManageGallery from './admin/ManageGallery';
import ManageReviews from './admin/ManageReviews';
import ManageEnquiries from './admin/ManageEnquiries';
import ManageFAQ from './admin/ManageFAQ';
import Settings from './admin/Settings';

// Scroll to top helper on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [settings, setSettings] = useState(null);

  const fetchSettings = async () => {
    const data = await dataService.getSettings();
    setSettings(data);
  };

  useEffect(() => {
    fetchSettings();
    const handleUpdate = () => fetchSettings();
    window.addEventListener('max_settings_updated', handleUpdate);
    return () => window.removeEventListener('max_settings_updated', handleUpdate);
  }, []);

  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Protected Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="faculty" element={<ManageFaculty />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="enquiries" element={<ManageEnquiries />} />
          <Route path="faq" element={<ManageFAQ />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Public Institutional Routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col justify-between">
              <Navbar settings={settings} />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home settings={settings} />} />
                  <Route path="/about" element={<About settings={settings} />} />
                  <Route path="/courses" element={<Courses settings={settings} />} />
                  <Route path="/faculty" element={<Faculty settings={settings} />} />
                  <Route path="/gallery" element={<Gallery settings={settings} />} />
                  <Route path="/reviews" element={<Reviews settings={settings} />} />
                  <Route path="/faq" element={<FAQ settings={settings} />} />
                  <Route path="/contact" element={<Contact settings={settings} />} />
                  <Route path="*" element={<Home settings={settings} />} />
                </Routes>
              </div>
              <Footer settings={settings} />
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
