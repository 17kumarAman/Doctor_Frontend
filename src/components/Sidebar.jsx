import {
  Calendar,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, userType, logout } = useAuth();
  const location = useLocation();

  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // ✅ No dependency here, runs only once

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    window.location.href = "/contact-us";
  };
  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/enquiries', label: 'Manage Enquiries', icon: MessageSquare },
    ...(user.role === "super_admin"
      ? [{ path: '/doctors', label: 'Manage Doctor', icon: Users }]
      : []),
    { path: '/appointments', label: 'Manage Appointment', icon: Calendar },
    { path: '/myprofile', label: 'My Profile', icon: Settings },

  ];


  const doctorMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/appointments', label: 'My Appointments', icon: Calendar },
    { path: '/availability', label: 'My Availability', icon: FileText },
    { path: '/myprofile', label: 'My Profile', icon: Settings },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : doctorMenuItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 lg:hidden top-16"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto lg:top-0 lg:h-[calc(100vh-64px)]
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-600">
                {userType === 'super_admin' ? (user?.role === 'super_admin' ? 'Admin Panel' : 'Reception') : 'Doctor Panel'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back
              </p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile */}
          {!showSidebar && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(user?.name || user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user?.name || user?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{userType}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2 rounded-lg transition-colors duration-200 text-sm
                        ${isActive(item.path)
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      <Icon size={18} className="mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 space-y-3">
            {/* ✅ Show Logout only for small screens (<768px) */}
            {!showSidebar && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
            <div className="text-xs text-gray-600">
              <p>© 2024 Medical System</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
