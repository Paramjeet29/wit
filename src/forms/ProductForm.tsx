
import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';

interface ProductFormData {
  name: string;
  category: string;
  brand: string;
  image?: File;
}

interface ProductFormProps {
  onFormValidChange: (isValid: boolean) => void;
  categories: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ onFormValidChange, categories }) => {
  const formDataRef = useRef<ProductFormData>({
    name: '',
    category: categories[0] || 'Shoes',
    brand: 'Nike',
    image: undefined,
  });

  const [formValid, setFormValid] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [, forceUpdate] = useState({});

  // Load saved form data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('productFormData');
    const savedImagePreview = localStorage.getItem('productFormImagePreview');
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      formDataRef.current = {
        ...formDataRef.current,
        name: parsedData.name || '',
        category: parsedData.category || categories[0] || 'Shoes',
        brand: parsedData.brand || 'Nike'
      };
      forceUpdate({}); // Force a re-render to show the loaded data
    }
    
    if (savedImagePreview) {
      setImagePreview(savedImagePreview);
    }
  }, [categories]);

  // Save form data to localStorage whenever it changes
  const saveToLocalStorage = () => {
    const dataToSave = {
      name: formDataRef.current.name,
      category: formDataRef.current.category,
      brand: formDataRef.current.brand
    };
    localStorage.setItem('productFormData', JSON.stringify(dataToSave));
    console.log(dataToSave)
    if (imagePreview) {
      localStorage.setItem('productFormImagePreview', imagePreview);
    } else {
      localStorage.removeItem('productFormImagePreview');
    }
  };

  // Validate form fields
  useEffect(() => {
    const isValid = 
      formDataRef.current.name.trim() !== '' && 
      formDataRef.current.brand.trim() !== '';
    setFormValid(isValid);
    onFormValidChange(isValid);
  }, [formDataRef.current, onFormValidChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    formDataRef.current = {
      ...formDataRef.current,
      [name]: value
    };
    saveToLocalStorage();
    forceUpdate({}); // Force a re-render to show the updated values
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      formDataRef.current = {
        ...formDataRef.current,
        image: file
      };
      
      // Create and save image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);
        saveToLocalStorage();
      };
      reader.readAsDataURL(file);
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
              value={formDataRef.current.name}
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
              value={formDataRef.current.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
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
              value={formDataRef.current.brand}
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
              <Upload className="w-4 h-4 mr-2" />
              Upload Image (Optional)
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