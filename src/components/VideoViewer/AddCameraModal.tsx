import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cameraAPI } from '../../services/api';
import { Camera } from '../../types';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface AddCameraModalProps {
  camera?: Camera | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCameraModal: React.FC<AddCameraModalProps> = ({ camera, onClose, onSuccess }) => {
  const { user, addCamera, updateCamera } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    name: camera?.name || '',
    description: camera?.description || '',
    location: camera?.location || '',
    resolution: camera?.resolution || '1920x1080',
    frameRate: camera?.frameRate || 30,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const isEdit = !!camera;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'frameRate' ? parseInt(value) : value
    }));
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEdit && !videoFile) {
      alert('Please select a video file');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      submitData.append('resolution', formData.resolution);
      submitData.append('frameRate', formData.frameRate.toString());
      submitData.append('createdBy', user?.id || '');
      
      if (videoFile) {
        submitData.append('video', videoFile);
      }

      if (isEdit) {
        const updatedCamera = await cameraAPI.updateCamera(camera["_id"], submitData);
        updateCamera(camera["_id"], updatedCamera);
      } else {
        const newCamera = await cameraAPI.createCamera(submitData);
        addCamera(newCamera);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save camera:', error);
      alert('Failed to save camera. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Camera' : 'Add New Camera'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Camera Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter camera name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter location"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Enter camera description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution
                </label>
                <select
                  name="resolution"
                  value={formData.resolution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="640x480">480p (640x480)</option>
                  <option value="1280x720">720p (1280x720)</option>
                  <option value="1920x1080">1080p (1920x1080)</option>
                  <option value="2560x1440">1440p (2560x1440)</option>
                  <option value="3840x2160">4K (3840x2160)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frame Rate
                </label>
                <select
                  name="frameRate"
                  value={formData.frameRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={15}>15 fps</option>
                  <option value={24}>24 fps</option>
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </div>
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video File *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  
                  {videoFile ? (
                    <div>
                      <p className="text-white font-medium">{videoFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 mb-2">
                        Drag and drop a video file here, or click to browse
                      </p>
                      <p className="text-gray-500 text-sm">
                        Supports MP4, MOV, AVI, WebM
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg transition-colors"
              >
                {isSubmitting ? 'Saving...' : isEdit ? 'Update Camera' : 'Add Camera'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCameraModal;