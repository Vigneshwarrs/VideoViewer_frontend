import {
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import React from "react";
import { NavLink } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

const Sidebar: React.FC = () => {
  const { user } = useAppStore();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon, roles: ["admin"] },
    {
      name: "Video Viewer",
      href: "/video-viewer",
      icon: VideoCameraIcon,
      roles: ["admin", "user"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "user")
  );

  return (
    <div className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 h-screen sticky top-0">
      <div className="flex items-center px-6 py-4 border-b border-gray-800">
        <VideoCameraIcon className="h-8 w-8 text-primary-500" />
        <span className="ml-3 text-xl font-bold text-white">VideoHub</span>
      </div>

      <nav className="px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              )
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
