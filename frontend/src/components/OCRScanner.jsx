import React, { useState, useRef } from 'react';
import axios from 'axios';

const OCRScanner = ({ onScanComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset states
    setError('');

    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (PNG, JPG, JPEG)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      // Update file input value for consistency
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }

      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleOCR = async () => {
    if (!fileInputRef.current?.files[0]) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', fileInputRef.current.files[0]);

    try {
      const response = await axios.post('/api/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        // Call the callback with extracted text
        if (onScanComplete) {
          onScanComplete(response.data.text);
        }

        // Clear the preview and file input
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.data.message || 'Failed to process image');
      }
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err.response?.data?.message || 'Error processing image');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const cancelSelection = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 mb-8">
      <h3 className="text-2xl font-semibold mb-4 text-white">Image to Text</h3>
      <p className="text-gray-400 mb-6">Upload an image containing text to extract its content</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors"
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <div className="text-white text-lg">Click or drag image here</div>
            <p className="text-gray-400 text-sm max-w-xs">
              Supports PNG, JPG or JPEG (max. 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain rounded-lg"
            />
            <button
              onClick={cancelSelection}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm text-center">Processing image... {progress}%</p>
            </div>
          ) : (
            <button
              onClick={handleOCR}
              disabled={!previewUrl || isLoading}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Image...
                </div>
              ) : "Extract Text from Image"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OCRScanner;
