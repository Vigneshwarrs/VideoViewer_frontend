import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { cameraAPI } from "../../services/api";
import { useAppStore } from "../../store/useAppStore";
import { Camera } from "../../types";
import AddCameraModal from "./AddCameraModal";
import CameraCard from "./CameraCard";

const CameraList: React.FC = () => {
  const { cameras, setCameras, user, setLoading, setError } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const camerasData = await cameraAPI.getCameras();
      setCameras(camerasData);
    } catch (error) {
      console.error("Failed to load cameras:", error);
      setError("Failed to load cameras");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCamera = () => {
    setEditingCamera(null);
    setShowAddModal(true);
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingCamera(null);
  };

  const handleCameraUpdated = () => {
    loadCameras();
    handleCloseModal();
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Cameras</h2>
        {isAdmin && (
          <button
            onClick={handleAddCamera}
            className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Camera
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {cameras.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No cameras available</div>
            {isAdmin && (
              <button
                onClick={handleAddCamera}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Add your first camera
              </button>
            )}
          </div>
        ) : (
          Array.isArray(cameras) &&
          cameras.map((camera) => (
            <CameraCard
              key={camera.videoUrl}
              camera={camera}
              onEdit={isAdmin ? handleEditCamera : undefined}
              onRefresh={loadCameras}
            />
          ))
        )}
      </div>

      {showAddModal && (
        <AddCameraModal
          camera={editingCamera}
          onClose={handleCloseModal}
          onSuccess={handleCameraUpdated}
        />
      )}
    </div>
  );
};

export default CameraList;
