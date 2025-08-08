import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Brain, ShoppingCart } from 'lucide-react';
import OpenAI from 'openai';

const categories = ["all", "footwear", "electronics", "clothing"];

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Add to .env file
  dangerouslyAllowBrowser: true // Only for demo purposes
});

// Async AI search function using OpenAI
const aiSearchWithOpenAI = async (query, products) => {
  try {
    const prompt = `
    You are a product search assistant. Analyze this search query: "${query}"
    
    Extract the following information and return ONLY a JSON object:
    {
      "priceMin": number or null,
      "priceMax": number or null,
      "category": "footwear" or "electronics" or "clothing" or null,
      "brand": string or null,
      "minRating": number or null,
      "searchTerms": string or null
    }
    
    Examples:
    - "running shoes under $100" → {"priceMax": 100, "category": "footwear", "searchTerms": "running shoes"}
    - "Apple electronics with good reviews" → {"category": "electronics", "brand": "Apple", "minRating": 4.0}
    - "clothing over $50" → {"priceMin": 50, "category": "clothing"}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 150
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log('🤖 OpenAI Analysis:', result);

    // Filter products based on OpenAI analysis
    return products.filter(product => {
      if (result.priceMin && product.price < result.priceMin) return false;
      if (result.priceMax && product.price > result.priceMax) return false;
      if (result.category && product.category !== result.category) return false;
      if (result.brand && !product.name.toLowerCase().includes(result.brand.toLowerCase())) return false;
      if (result.minRating && product.rating < result.minRating) return false;
      
      if (result.searchTerms) {
        const terms = result.searchTerms.toLowerCase();
        return product.name.toLowerCase().includes(terms) || 
               product.description.toLowerCase().includes(terms);
      }
      
      return true;
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    // Fallback: just return all products if error occurs
    return products;
  }
};


function EcommerceApp() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // This will hold the final filtered products to display
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Load products (simulate fetch)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('./products.json');
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback product example
        const fallbackProducts = [
          {
            id: 1,
            name: "Nike Air Max 270 Running Shoes",
            price: 120,
            category: "footwear",
            description: "Comfortable running shoes with air cushioning technology",
            rating: 4.5,
            image: "🏃‍♂️"
          },
          // Add more fallback products here if needed
        ];
        setProducts(fallbackProducts);
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Synchronous filtering for category, price, and non-AI search
  const syncFilteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (searchQuery.trim() && !aiSearchActive) {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [products, selectedCategory, priceRange, searchQuery, aiSearchActive]);

  // Run async OpenAI search when AI search ON & query exists
  useEffect(() => {
    if (aiSearchActive && searchQuery.trim()) {
      setLoading(true);

      aiSearchWithOpenAI(searchQuery, syncFilteredProducts)
        .then(result => {
          setFilteredProducts(result);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setFilteredProducts(syncFilteredProducts);
          setLoading(false);
        });
    } else {
      // AI search off → use synchronous filtered products
      setFilteredProducts(syncFilteredProducts);
    }
  }, [searchQuery, aiSearchActive, syncFilteredProducts]);

  // Helper to render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <div className="text-lg text-gray-600">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              AI Store
            </h1>
            <div className="text-sm text-gray-600">
              {filteredProducts.length} products found
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {/* AI Search Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
              <button
                onClick={() => setAiSearchActive(!aiSearchActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  aiSearchActive 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                {aiSearchActive ? 'AI Search ON' : 'AI Search OFF'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={aiSearchActive ? "Try: 'running shoes under $100 with good reviews'" : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  aiSearchActive 
                    ? 'border-blue-300 focus:ring-blue-500 bg-blue-50' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Category and Price Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Search Info */}
        {aiSearchActive && searchQuery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">AI Search Active</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Understanding your query: "{searchQuery}" - Processing price, rating, category, and brand filters automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="text-center mb-4">
                <img 
                src={product.image}
                alt={product.name}
                className='mx-auto mb-3 h-32 object-contain'
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                  }}
                />
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                  {product.name}
                </h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
                </div>
                
                <p className="text-sm text-gray-600 text-center line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Footer with AI Info */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>AI Feature:</strong> Smart Product Search with Natural Language Processing
            </p>
            <p>
              Try queries like: "running shoes under $100 with good reviews", "Apple electronics", or "clothing over $50"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default EcommerceApp;
