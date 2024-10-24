import { useEffect, useState, useRef } from 'react';

interface Combination {
  id: string;
  variant: string;
  sku: string;
  inStock: boolean;
  quantity: string;
  error?: string;
}

interface ProductCombinationsFormProps {
  onFormValidChange: (isValid: boolean) => void;
}

const ProductCombinationsForm: React.FC<ProductCombinationsFormProps> = ({ onFormValidChange }) => {
  // Get initial combinations from localStorage or use default
  const getInitialCombinations = () => {
    const savedCombinations = localStorage.getItem('productCombinations');
    return savedCombinations ? JSON.parse(savedCombinations) : [
      { id: '1', variant: 'M/Black', sku: 'ABC12', inStock: false, quantity: '' },
      { id: '2', variant: 'M/Red', sku: 'S0F3', inStock: true, quantity: '5' },
      { id: '3', variant: 'L/Black', sku: 'HWE2', inStock: false, quantity: '' },
      { id: '4', variant: 'L/Red', sku: 'ABC12', inStock: true, quantity: '9', error: 'Duplicate SKU' }
    ];
  };

  const [combinations, setCombinations] = useState<Combination[]>(getInitialCombinations());
  const [hasErrors, setHasErrors] = useState<boolean>(true);
  
  // Refs for inputs
  const skuInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const quantityInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Save to localStorage whenever combinations change
  useEffect(() => {
    localStorage.setItem('productCombinations', JSON.stringify(combinations));
  }, [combinations]);

  // Update refs array when combinations length changes
  useEffect(() => {
    skuInputRefs.current = skuInputRefs.current.slice(0, combinations.length);
    quantityInputRefs.current = quantityInputRefs.current.slice(0, combinations.length);
  }, [combinations.length]);

  const validateForm = () => {
    const skuCounts = new Map<string, number>();
    const updatedCombinations = combinations.map(combo => {
      if (combo.sku.trim()) {
        skuCounts.set(combo.sku, (skuCounts.get(combo.sku) || 0) + 1);
      }
      return combo;
    });

    const hasAnyErrors = updatedCombinations.some(combo => {
      const isDuplicate = skuCounts.get(combo.sku) && skuCounts.get(combo.sku)! > 1;
      const isEmpty = combo.sku.trim() === '';
      return isEmpty || isDuplicate;
    });

    setHasErrors(hasAnyErrors);
    onFormValidChange(!hasAnyErrors);
  };

  const handleSkuChange = (id: string, value: string) => {
    setCombinations(prev => {
      const newCombinations = prev.map(combo => ({
        ...combo,
        error: undefined
      }));

      const updatedCombinations = newCombinations.map(combo => {
        if (combo.id === id) {
          const isDuplicate = newCombinations.some(c => c.id !== id && c.sku === value);
          const isEmpty = value.trim() === '';
          return {
            ...combo,
            sku: value,
            error: isEmpty ? 'SKU is required' : isDuplicate ? 'Duplicate SKU' : undefined
          };
        }
        return combo;
      });

      return updatedCombinations;
    });
  };

  const handleToggleChange = (id: string) => {
    setCombinations(prev =>
      prev.map(combo => {
        if (combo.id === id) {
          const newCombo = { ...combo, inStock: !combo.inStock };
          // Focus quantity input when toggling to in-stock
          if (newCombo.inStock) {
            setTimeout(() => {
              const index = combinations.findIndex(c => c.id === id);
              quantityInputRefs.current[index]?.focus();
            }, 0);
          }
          return newCombo;
        }
        return combo;
      })
    );
  };

  const handleQuantityChange = (id: string, value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setCombinations(prev =>
        prev.map(combo =>
          combo.id === id ? { ...combo, quantity: value } : combo
        )
      );
    }
  };

  useEffect(() => {
    validateForm();
  }, [combinations]);

  return (
    <div className="bg-white rounded-lg shadow-md p-1 md:p-4 w-full lg:w-1/2">
      <h2 className="text-lg font-medium mb-4">Combinations</h2>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr className="text-left">
              <th className="pb-2 text-sm font-medium w-[10px]">Variant</th>
              <th className="pb-2 text-sm font-medium w-[50px]">
                SKU <span className="text-red-500">*</span>
              </th>
              <th className="pb-2 text-sm font-medium text-center w-[50px]">In stock</th>
              <th className="pb-2 text-sm font-medium w-[50px]">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {combinations.map((combo, index) => (
              <tr key={combo.id}>
                <td className="py-2 pr-0 text-sm text-gray-600">
                  {combo.variant}
                </td>
                <td className="py-2 pr-0">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={combo.sku}
                      onChange={(e) => handleSkuChange(combo.id, e.target.value)}
                      className={`border rounded p-2 w-full text-sm ${combo.error ? 'border-red-500' : ''}`}
                      placeholder="Enter SKU"
                      ref={el => skuInputRefs.current[index] = el}
                    />
                    {combo.error && (
                      <div className="text-xs text-red-500">{combo.error}</div>
                    )}
                  </div>
                </td>
                <td className="py-2 lg:pr-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggleChange(combo.id)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${combo.inStock ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${combo.inStock ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    value={combo.quantity}
                    onChange={(e) => handleQuantityChange(combo.id, e.target.value)}
                    placeholder="0"
                    className="border rounded p-2 w-full text-sm"
                    disabled={!combo.inStock}
                    ref={el => quantityInputRefs.current[index] = el}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductCombinationsForm;