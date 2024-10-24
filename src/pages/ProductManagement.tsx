
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, {  MobileMenuButton } from '../components/Sidebar';
import ProductNavbar from '../components/ProductNavbar';
import ProductForm from '../forms/ProductForm';

const ProductManagement: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [formValid, setFormValid] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState<string[]>([]); // State to store categories  

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/products.json'); // Adjust path if needed
        const data = await response.json();
        const categoryNames = data.categories.map((category: { name: string }) => category.name);
        setCategories(categoryNames);
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
            onBack={() => navigate("/")}
            onNext={handleNext}
            backLabel="Cancel"
            isNextDisabled={!formValid}
          />

        <ProductForm 
          onFormValidChange={handleFormValidChange} 
          categories={categories} // Pass categories to ProductForm
        />
      </div>
    </div>
  );
};

export default ProductManagement;
