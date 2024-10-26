
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { MobileMenuButton } from '../components/Sidebar';
import ProductNavbar from '../components/ProductNavbar';
import ProductForm from '../forms/ProductForm';
import { Category } from '../types'; // Import the Category type

const ProductManagement: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [formValid, setFormValid] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]); // Update type to Category[]

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories from localStorage
        const storedCategories: Category[] = JSON.parse(localStorage.getItem('categories') || '[]');

        // Fetch categories from products.json
        const response = await fetch('/products.json'); // Adjust path if needed
        if (!response.ok) {
          throw new Error('Failed to fetch categories from products.json');
        }
        const data = await response.json();

        // Create Category objects from the fetched data
        const jsonCategories: Category[] = data.categories.map((category: { id: string, name: string }) => ({
          id: category.id, // Make sure to include id
          name: category.name,
          products: [], // Initialize with an empty products array or whatever is needed
        }));

        // Combine categories from localStorage and products.json
        const allCategories = [...new Map([...jsonCategories, ...storedCategories].map(item => [item.id, item])).values()]; // Merge and remove duplicates

        // Set the merged categories to state
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleNext = () => {
    if (formValid) {
      navigate('/variant');
    }
  };

  const handleFormValidChange = (isValid: boolean) => {
    setFormValid(isValid);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MobileMenuButton 
        isOpen={isSidebarOpen} 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 py-4 md:p-6">
        <ProductNavbar
          title="Add Product"
          currentStep={currentStep}
          onBack={() => {navigate("/") 
            localStorage.removeItem('productFormData');
            localStorage.removeItem('price');
            localStorage.removeItem('discount');
            localStorage.removeItem('productFormImagePreview');
            localStorage.removeItem('productVariants');
            localStorage.removeItem('productCombinations');
          }
          }
          onNext={handleNext}
          backLabel="Cancel"
          isNextDisabled={!formValid}
        />

        <ProductForm 
          onFormValidChange={handleFormValidChange} 
          categories={categories} // Pass merged categories to ProductForm
        />
      </div>
    </div>
  );
};

export default ProductManagement;
