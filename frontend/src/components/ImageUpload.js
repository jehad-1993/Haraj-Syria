import React, { useState, useContext } from "react";
import { LanguageContext } from "../App";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ImageUpload = ({ images, setImages, maxImages = 5 }) => {
  const { language } = useContext(LanguageContext);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (images.length + files.length > maxImages) {
      setUploadError(language === 'ar' ? 
        `لا يمكن رفع أكثر من ${maxImages} صور` : 
        `Cannot upload more than ${maxImages} images`);
      return;
    }

    setUploading(true);
    setUploadError('');

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError(language === 'ar' ? 'يرجى اختيار ملفات صور فقط' : 'Please select image files only');
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(language === 'ar' ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' : 'File size must be less than 5MB');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const imageUrl = `${BACKEND_URL}${response.data.url}`;
        setImages(prev => [...prev, imageUrl]);

      } catch (error) {
        console.error('Upload error:', error);
        setUploadError(error.response?.data?.detail || (language === 'ar' ? 'خطأ في رفع الصورة' : 'Error uploading image'));
      }
    }

    setUploading(false);
    event.target.value = ''; // Reset file input
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {language === 'ar' ? 'الصور' : 'Images'} ({images.length}/{maxImages})
      </label>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer ${uploading || images.length >= maxImages ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="text-gray-400 text-4xl mb-2">📷</div>
          <div className="text-gray-600">
            {uploading ? 
              (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') :
              images.length >= maxImages ?
                (language === 'ar' ? 'تم الوصول للحد الأقصى من الصور' : 'Maximum images reached') :
                (language === 'ar' ? 'اختر الصور أو اسحبها هنا' : 'Choose images or drag them here')
            }
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {language === 'ar' ? 'PNG, JPG, GIF حتى 5MB' : 'PNG, JPG, GIF up to 5MB'}
          </div>
        </label>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="mt-2 text-red-500 text-sm">
          {uploadError}
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                
                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex gap-2">
                    {/* Move Left */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700"
                      >
                        ←
                      </button>
                    )}
                    
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700"
                    >
                      ×
                    </button>
                    
                    {/* Move Right */}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Image Indicator */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {language === 'ar' ? 'رئيسية' : 'Main'}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {language === 'ar' ? 
              'يمكنك ترتيب الصور باستخدام الأسهم. الصورة الأولى ستكون الصورة الرئيسية.' :
              'You can reorder images using the arrows. The first image will be the main image.'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;