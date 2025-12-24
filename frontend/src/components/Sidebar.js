import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/ABN1.png';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // State for the Report Dropdown
  const [reportOpen, setReportOpen] = useState(false);

  // Automatically open report menu if on a report page
  useEffect(() => {
    if (location.pathname.includes('/report')) {
      setReportOpen(true);
    }
  }, [location.pathname]);

  const Icons = {
    Dashboard: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm14 12v3h-5v-3h5zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5zM6 8v7H1V8h5zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H1zm14-6v7h-5V1h5zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1h-5z" />
      </svg>
    ),
    AddMember: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
      </svg>
    ),
    AddEvent: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" />
        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        <path fillRule="evenodd" d="M8 7a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2h-2a.5.5 0 0 1 0-1h2v-2A.5.5 0 0 1 8 7z" />
      </svg>
    ),
    Meetings: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" />
        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
      </svg>
    ),
    Users: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002A.274.274 0 0 1 15 13H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      </svg>
    ),
    RuleBook: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
        <path fillRule="evenodd" d="M8 5a.5.5 0 0 1 .5.5V7H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V8H6a.5.5 0 0 1 0-1h1.5V5.5A.5.5 0 0 1 8 5z" />
      </svg>
    ),
    Settings: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
      </svg>
    ),
    Profile: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
      </svg>
    ),
    ChevronDown: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
      </svg>
    ),
    ChevronRight: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
      </svg>
    ),
    Menu: () => (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
      </svg>
    ),
    Lock: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 1 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      </svg>
    ),
    Logout: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
      </svg>
    ),
    // New Icons for Reports
    Report: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
        <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 3.798-.622c.296.006.595.032.898.088.27.05.506.136.702.261a1.2 1.2 0 0 1 .432.483.75.75 0 0 1-.226.852c-.22.203-.497.35-.805.434a9.66 9.66 0 0 1-2.925.267 6.47 6.47 0 0 1-2.365-.454z" />
      </svg>
    ),
    Business: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
    ),
    Attendance: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
      </svg>
    ),
  };

  // Menu items configuration
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Icons.Dashboard },
    { path: '/events', label: 'Add Event', icon: Icons.AddEvent },
    { path: '/meeting', label: 'Meetings', icon: Icons.Meetings },
    { path: '/users', label: 'Users', icon: Icons.Users },
    // New Report Item with subItems
    {
      label: 'Report',
      icon: Icons.Report,
      subItems: [
        { path: '/business-report', label: 'Chapter Report', icon: Icons.Business },
        { path: '/attendance-report', label: 'Chapter Attendance', icon: Icons.Attendance }
      ]
    },
    { path: '/setting', label: 'Settings', icon: Icons.Settings },
  ];

  // Determine if a menu item is active
  const isActive = (path) => location.pathname === path;

  // Get current page title for mobile header
  const getPageTitle = () => {
    // Check main items
    let currentItem = menuItems.find(item => item.path === location.pathname);

    // Check sub items if not found
    if (!currentItem) {
      menuItems.forEach(item => {
        if (item.subItems) {
          const subItem = item.subItems.find(sub => sub.path === location.pathname);
          if (subItem) currentItem = subItem;
        }
      });
    }

    return currentItem ? currentItem.label : 'Dashboard';
  };

  // Toast notification helper
  const showToast = (message, type) => {
    console.log(`Toast: ${message} (${type})`);
  };

  // Confirmation dialog helper
  const showConfirmation = (title, message, onConfirm) => {
    console.log(`Confirmation: ${title} - ${message}`);
    setTimeout(() => {
      onConfirm();
    }, 100);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>

        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-center h-20">
          <div className="h-[60px] flex items-center justify-center px-4">
            <img
              src={logo}
              alt="Logo"
              className="h-full w-auto object-contain"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="mt-6">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;

            // Check if it's a dropdown menu (Report)
            if (item.subItems) {
              const isParentActive = item.subItems.some(sub => isActive(sub.path));
              return (
                <div key={index}>
                  <button
                    onClick={() => setReportOpen(!reportOpen)}
                    className={`w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${isParentActive || reportOpen ? 'text-blue-600 bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">
                        <IconComponent />
                      </span>
                      {item.label}
                    </div>
                    <span>
                      {reportOpen ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                    </span>
                  </button>

                  {/* Submenu */}
                  {reportOpen && (
                    <div className="bg-gray-50">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center pl-12 pr-6 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors ${isActive(subItem.path) ? 'text-blue-600 font-medium' : ''
                              }`}
                          >
                            <span className="mr-3">
                              <SubIcon />
                            </span>
                            {subItem.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular Link items
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive(item.path) ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                  }`}
                data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <span className="mr-3">
                  <IconComponent />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white shadow-sm border-b z-10">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Icons.Menu />
          </button>

          {/* Page title for mobile and desktop */}
          <h1 className="text-2xl font-semibold text-gray-800 lg:text-xl">
            {getPageTitle()}
          </h1>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-expanded={showProfileDropdown}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                <Icons.Profile />
              </div>
              <Icons.ChevronDown />
            </button>

            {/* Dropdown menu */}

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                {/* <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3"><Icons.Profile /></span>
                  Profile
                </Link> */}
                <Link
                  to="/change-password"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3"><Icons.Lock /></span>
                  Change Password
                </Link>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    showConfirmation('Logout', 'Are you sure you want to logout?', () => {
                      handleLogout();
                      showToast('Logged out successfully', 'success');
                    });
                  }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3"><Icons.Logout /></span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Sidebar;