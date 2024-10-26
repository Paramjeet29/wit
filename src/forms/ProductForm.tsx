
import React, { ChangeEvent, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface ProductFormData {
  name: string;
  category: string;
  brand: string;
  image?: File;
  imageUrl?: string;
}

interface ProductCategory {
  id: string;
  name: string;
}

interface ProductFormProps {
  onFormValidChange: (isValid: boolean) => void;
  categories: ProductCategory[];
}

const ProductForm: React.FC<ProductFormProps> = ({ onFormValidChange, categories }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: categories[0]?.name || 'Shoes',
    brand: 'Nike',
    image: undefined,
    imageUrl: '',
  });
  
  const [formValid, setFormValid] = useState<boolean>(false);
  console.log(formValid)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  
  useEffect(() => {
    const savedData = localStorage.getItem('productFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData) as ProductFormData;
      setFormData(prev => ({
        ...prev,
        ...parsedData,
        category: parsedData.category || categories[0]?.name || 'Shoes',
      }));
      if (parsedData.imageUrl) {
        setImagePreview(parsedData.imageUrl);
      }
    }
  }, [categories]);

  const saveToLocalStorage = (newFormData: ProductFormData) => {
    localStorage.setItem('productFormData', JSON.stringify(newFormData));
  };

  useEffect(() => {
    const isValid = formData.name.trim() !== '' && formData.brand.trim() !== '';
    setFormValid(isValid);
    onFormValidChange(isValid);
  }, [formData.name, formData.brand, onFormValidChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const uploadToCloudinary = async (file: File) => {
    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText}. ${errorText}`);
      }
      const data = await response.json();
      return data.secure_url; // Ensure this returns the correct URL
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };
  
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploading(true); // Set uploading to true when starting upload
      
      try {
        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(file);
        
        // Update form data with new image and URL
        const newFormData = {
          ...formData,
          image: file,
          imageUrl: cloudinaryUrl // This should be the secure URL from Cloudinary
        };
        
        setFormData(newFormData);
        setImagePreview(cloudinaryUrl); // Set the preview to the newly uploaded URL
        saveToLocalStorage(newFormData);
        
        // console.log("Image uploaded successfully:", cloudinaryUrl);
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false); // Set uploading to false after upload completes
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm w-full md:w-1/2">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Description</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              required
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            />
          </div>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Upload Image (Optional)</span>
                </>
              )}
            </button>
          </div>
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Image Preview" className="w-32 h-32 object-cover rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
