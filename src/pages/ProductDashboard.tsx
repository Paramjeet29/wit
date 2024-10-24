
import { MobileMenuButton } from '../components/Sidebar'; 
import Sidebar from '../components/Sidebar'; 
import MainContent from '../components/MainContent';
import AddCategoryModal from '../components/AddCategoryModal';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../types'; // Import the types
import { useEffect, useState } from 'react';

const ProductDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCategories(data.categories);
        setProducts(data.products); // Set products from fetched data
      } catch (error) {
        console.error('Error fetching data:', error);
       
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveCategory = async (categoryName: string) => {
    const newCategory: Category = {
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      products: [] // Initialize products as an empty array
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);

    // Persist changes back to the server
    await saveCategories(updatedCategories);
  };

  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      const response = await fetch('/products.json', {
        method: 'PUT', // Adjust method as per your server setup
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: updatedCategories }),
      });
      if (!response.ok) {
        throw new Error('Failed to save categories');
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      
    }
  };

  

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message
  }

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
    
        <MainContent 
      onAddCategory={() => setIsModalOpen(true)}
      onAddProduct={() => { navigate('/manage'); }}
      categories={categories} 
      products={products}
    />

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default ProductDashboard;
