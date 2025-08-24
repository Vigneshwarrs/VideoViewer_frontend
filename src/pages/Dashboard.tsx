import {
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  PlayIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { format, subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyticsAPI } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { AnalyticsData } from "../types";

const Dashboard: React.FC = () => {
  const { user } = useAppStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getDashboardData(dateRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Cameras",
      value: analyticsData?.totalCameras || 0,
      icon: VideoCameraIcon,
      color: "bg-primary-500",
      change: "+12%",
    },
    {
      name: "Active Sessions",
      value: analyticsData?.activeSessions || 0,
      icon: PlayIcon,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      name: "Total Users",
      value: analyticsData?.totalUsers || 0,
      icon: UserGroupIcon,
      color: "bg-purple-500",
      change: "+3%",
    },
    {
      name: "Analytics Views",
      value: "1.2K",
      icon: EyeIcon,
      color: "bg-orange-500",
      change: "+15%",
    },
  ];

  const COLORS = [
    "#3B82F6",
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {user.username}! Here's your video management
            overview.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Date Range:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800/50 rounded-xl p-6 animate-pulse"
            >
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.name}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:bg-gray-800/70 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-gray-400 text-sm">{stat.name}</p>
                  </div>
                  <div className="text-green-400 text-sm font-medium">
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Usage Chart */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Camera Usage</h2>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.cameraUsage || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="cameraName" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="playCount"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Login Activity Chart */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Login Activity</h2>
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.loginActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Most Active Users */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-white mb-6">
                Most Active Users
              </h2>
              <div className="space-y-4">
                {(analyticsData?.mostActiveUsers || [])
                  .slice(0, 5)
                  .map((user, index) => (
                    <div key={user.userId} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-white">
                              {user?.username?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.username}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {user.activityCount} activities
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">#{index + 1}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Camera Status Distribution */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-white mb-6">
                System Overview
              </h2>
              <div className="grid grid-cols-2 gap-6 h-64">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-400 mb-2">
                      {analyticsData?.totalCameras || 0}
                    </div>
                    <div className="text-gray-400">Total Cameras</div>
                    <div className="flex items-center justify-center mt-4 space-x-4">
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-400">Online</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-400">Offline</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">
                      {analyticsData?.activeSessions || 0}
                    </div>
                    <div className="text-gray-400">Active Sessions</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Real-time monitoring
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
