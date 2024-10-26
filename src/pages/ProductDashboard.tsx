
import { MobileMenuButton } from '../components/Sidebar';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import AddCategoryModal from '../components/AddCategoryModal';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../types';
import { useEffect, useState } from 'react';

const ProductDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadLocalStorage = () => {
    try {
      // Retrieve categories from localStorage
      const storedCategories = localStorage.getItem('categories');
      const parsedCategories = storedCategories ? JSON.parse(storedCategories) : [];
  
      // Load existing products or initialize an empty array
      const storedProducts = localStorage.getItem('products');
      const parsedProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : [];
  
      // Load formData and other product details if available
      const formData = localStorage.getItem('productFormData');
      const parsedFormData = formData ? JSON.parse(formData) : null;
      const price = localStorage.getItem('price');
      const discount = localStorage.getItem('discount');
      // const imagePreview = localStorage.getItem('productFormImagePreview');
      const variants = localStorage.getItem('productVariants');
      const parsedVariants = variants ? JSON.parse(variants) : [];
      const combinations = localStorage.getItem('productCombinations');
      const parsedCombinations = combinations ? JSON.parse(combinations) : [];
  
      if (parsedFormData) {
        const newProduct: Product = {
          name: parsedFormData.name || '',
          category: parsedFormData.category || '',
          brand: parsedFormData.brand || '',
          image: parsedFormData.imageUrl ||  'https://res.cloudinary.com/dk322vkjl/image/upload/v1729853766/bun1fmtf4jowqbvkg0mq.png', // Use image URL or placeholder
          variants: parsedVariants.map((variant: any) => ({
            name: variant.name,
            values: variant.values,
          })),
          combinations: parsedCombinations.map((combo: any) => ({
            name: combo.variant,
            sku: combo.sku,
            quantity: combo.quantity ? Number(combo.quantity) : null,
            inStock: combo.inStock,
          })),
          price: price ? Number(price) : 0,
          discount: {
            method: discount ? 'pct' : 'none',
            value: discount ? Number(discount) : 0,
          },
        };
  
        // Append the new product to the existing products array
        parsedProducts.push(newProduct);
  
        // Save updated products array to localStorage
        localStorage.setItem('products', JSON.stringify(parsedProducts));
      }
  
      console.log('Loaded from localStorage:', {
        products: parsedProducts,
        categories: parsedCategories,
      });
      localStorage.removeItem('productFormData');
      localStorage.removeItem('price');
      localStorage.removeItem('discount');
      localStorage.removeItem('productFormImagePreview');
      localStorage.removeItem('productVariants');
      localStorage.removeItem('productCombinations');
      return {
        products: parsedProducts,
        categories: parsedCategories,
      };
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return { products: [], categories: [] };
    }
  };
  
  // Save data to localStorage in the new combined format
  const saveToLocalStorage = (products: Product[], categories: Category[]) => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('categories', JSON.stringify(categories));
      console.log('Saved to localStorage:', { products, categories });
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Merge products without duplicates
  const mergeProducts = (apiProducts: Product[], localProducts: Product[]): Product[] => {
    const allProducts = [...apiProducts];
    
    localProducts.forEach(localProduct => {
      const isDuplicate = allProducts.some(apiProduct => 
        apiProduct.name.toLowerCase() === localProduct.name.toLowerCase() && 
        apiProduct.category.toLowerCase() === localProduct.category.toLowerCase() &&
        apiProduct.brand.toLowerCase() === localProduct.brand.toLowerCase()
      );
      
      if (!isDuplicate) {
        allProducts.push(localProduct);
      }
    });
    
    return allProducts;
  };

  // Merge categories without duplicates
  const mergeCategories = (apiCategories: Category[], localCategories: Category[]): Category[] => {
    const allCategories = [...apiCategories];
    
    localCategories.forEach(localCategory => {
      const isDuplicate = allCategories.some(apiCategory => 
        apiCategory.id === localCategory.id ||
        apiCategory.name.toLowerCase() === localCategory.name.toLowerCase()
      );
      
      if (!isDuplicate) {
        allCategories.push(localCategory);
      }
    });
    
    return allCategories;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First load from localStorage
        const localData = loadLocalStorage();
        
        // Set initial data from localStorage
        setProducts(localData.products);
        setCategories(localData.categories);
        
        // Then try to fetch from API
        try {
          const response = await fetch('/products.json');
          if (response.ok) {
            const apiData = await response.json();
            console.log('API data:', apiData);

            // If API request successful, merge with localStorage data
            if (apiData?.products || apiData?.categories) {
              const mergedProducts = mergeProducts(
                apiData.products || [],
                localData.products
              );
              
              const mergedCategories = mergeCategories(
                apiData.categories || [],
                localData.categories
              );

              console.log('Merged data:', {
                products: mergedProducts,
                categories: mergedCategories
              });

              setProducts(mergedProducts);
              setCategories(mergedCategories);
              saveToLocalStorage(mergedProducts, mergedCategories);
            }
          }
        } catch (apiError) {
          console.warn('API fetch failed, using localStorage data:', apiError);
        }
      } catch (error) {
        console.error('Error in data fetching:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      products: []
    };
    
    const updatedCategories = [...categories, newCategory];
    console.log('Adding new category:', newCategory);
    console.log('Updated categories:', updatedCategories);
    
    setCategories(updatedCategories);
    saveToLocalStorage(products, updatedCategories);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
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
        onAddProduct={() => navigate('/manage')}
        categories={categories}
        products={products}
      />

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCategory}
      />

      
    </div>
  );
};

export default ProductDashboard;