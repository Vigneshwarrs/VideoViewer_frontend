import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAppStore } from "../store/useAppStore";
import { analyticsAPI } from "../services/api";
import {
  VideoCameraIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

export default function Dashboard() {
  const { user } = useAppStore();
  const [stats, setStats] = useState<
    { name: string; value: string | number; icon: any; color: string }[]
  >([]);
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [cameraActivity, setCameraActivity] = useState<any[]>([]);
  const [videoActivity, setVideoActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await analyticsAPI.getDashboardData();
        
        const loginData = await analyticsAPI.getLoginActivity();
        const cameraData = await analyticsAPI.getCameraActivity();
        const videoData = await analyticsAPI.getVideoActivity();
        setStats([
          {
            name: "Total Cameras",
            value: dashboardData.totalCameras ?? 0,
            icon: VideoCameraIcon,
            color: "bg-blue-500",
          },
          {
            name: "Camera Usage",
            value: dashboardData.cameraUsage.length ?? 0,
            icon: UserIcon,
            color: "bg-green-500",
          },
          {
            name: "Total Users",
            value: dashboardData.totalUsers ?? 0,
            icon: ChartBarIcon,
            color: "bg-purple-500",
          },
          {
            name: "Avg. Watch Time",
            value: dashboardData.activeSessions ?? "0m",
            icon: ClockIcon,
            color: "bg-yellow-500",
          },
        ]);
        setLoginActivity(loginData || []);
        setCameraActivity(cameraData || []);
        setVideoActivity(videoData || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.username || "Guest"}! Here's your video management overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:bg-gray-800/70 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <StatIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Login Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Login Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Time</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loginActivity.map((log, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-white">{log.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {log.timestamp
                      ? format(new Date(log.timestamp), "MMM dd, yyyy h:mm:ss a")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        log.success === true
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {log.success? "Success" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
              {loginActivity.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
                    No login activity available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Camera Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Camera Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Camera</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Event</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {cameraActivity.map((activity, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-white">{activity.camera_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{activity.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {activity.timestamp
                      ? format(new Date(activity.timestamp), "MMM dd, yyyy h:mm:ss a")
                      : "N/A"}
                  </td>
                </tr>
              ))}
              {cameraActivity.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
                    No camera activity available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Video Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Camera Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Camera</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Event</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {videoActivity.map((activity, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-white">{activity.camera_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{activity.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {activity.timestamp
                      ? format(new Date(activity.timestamp), "MMM dd, yyyy h:mm:ss a")
                      : "N/A"}
                  </td>
                </tr>
              ))}
              {videoActivity.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
                    No camera activity available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
