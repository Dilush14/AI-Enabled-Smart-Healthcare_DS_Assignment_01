import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ role, links }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-sm border border-gray-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg text-text tracking-tight">MedikaLine</span>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                {role}
              </span>
            </Link>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (location.pathname.startsWith(link.path) && link.path !== `/${role.toLowerCase()}` && link.path !== `/${role.toLowerCase()}/`);
              // Special case for dashboard root matching
              const isExactMatch = location.pathname === link.path;
              const isDashboardRoot = link.path.endsWith('/dashboard') || link.path === `/${role.toLowerCase()}`;
              
              const active = isDashboardRoot ? isExactMatch : isActive;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${active 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <Link to="/login" className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut className="mr-3 h-5 w-5 text-red-500" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
          {/* Top header offset for mobile mobile menu button */}
          <div className="h-10 lg:hidden"></div>
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
