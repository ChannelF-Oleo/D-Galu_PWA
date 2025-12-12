import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useCart } from "../../context/CartContext";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Package, 
  AlertTriangle,
  Heart,
  Share2,
  Minus,
  Plus
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, isInCart, getItemQuantity, updateQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productDoc = await getDoc(doc(db, "products", id));
        
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);
          setError(null);
        } else {
          setError("Producto no encontrado");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = (event) => {
    if (product && quantity > 0) {
      addItem(product, quantity, event);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const isLowStock = product?.stock <= product?.minStock;
  const isOutOfStock = product?.stock === 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Producto no encontrado"}
            </h2>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate("/products")}
            className="hover:text-purple-600 transition-colors"
          >
            Productos
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Destacado
                  </span>
                )}
                {isLowStock && !isOutOfStock && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <AlertTriangle size={10} />
                    Pocas unidades
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Agotado
                  </span>
                )}
              </div>
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                  {product.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  {product.name}
                </h1>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} ({product.reviews} reseñas)
                </span>
              </div>
            )}

            {/* Precio */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-purple-600">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                SKU: {product.sku}
              </span>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Especificaciones */}
            {product.specifications && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Especificaciones
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key}:
                      </span>
                      <span className="text-sm text-gray-900 ml-1">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad y agregar al carrito */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Cantidad:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                }`}
              >
                <ShoppingCart size={20} />
                {isOutOfStock 
                  ? 'Producto Agotado' 
                  : isInCart(product.id) 
                    ? `Actualizar Carrito (${getItemQuantity(product.id)})` 
                    : 'Agregar al Carrito'
                }
              </button>

              {isInCart(product.id) && (
                <p className="text-sm text-green-600 text-center mt-2">
                  ✓ Ya tienes {getItemQuantity(product.id)} de este producto en tu carrito
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
