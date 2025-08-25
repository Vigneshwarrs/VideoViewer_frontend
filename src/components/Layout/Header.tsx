import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import React from "react";
import { useAppStore } from "../../store/useAppStore";

const Header: React.FC = () => {
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
  };

  return (
    <header className="bg-gray-900/30 backdrop-blur-xl border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">
              {format(new Date(), "MMM dd, yyyy")}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(), "h:mm a")}
            </p>
          </div>

          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
