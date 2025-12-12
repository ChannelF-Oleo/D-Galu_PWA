import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { Image, Search, Filter, Eye, X } from "lucide-react";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    { id: "all", name: "Todas las categorías" },
    { id: "trenzas", name: "Trenzas Africanas" },
    { id: "uñas", name: "Uñas y Manicure" },
    { id: "peluqueria", name: "Peluquería" },
    { id: "spa", name: "Spa y Relajación" },
    { id: "cejas", name: "Cejas y Pestañas" },
    { id: "maquillaje", name: "Maquillaje" },
    { id: "antes-despues", name: "Antes y Después" }
  ];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const galleryRef = collection(db, "gallery");
        const q = query(galleryRef, orderBy("createdAt", "desc"));
        
        const snapshot = await getDocs(q);
        const imagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (imagesData.length > 0) {
          setImages(imagesData);
          setFilteredImages(imagesData);
        } else {
          // Fallback a imágenes de ejemplo
          const fallbackImages = getFallbackImages();
          setImages(fallbackImages);
          setFilteredImages(fallbackImages);
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
        // Usar imágenes de ejemplo
        const fallbackImages = getFallbackImages();
        setImages(fallbackImages);
        setFilteredImages(fallbackImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const getFallbackImages = () => [
    {
      id: '1',
      title: 'Trenzas Africanas Elegantes',
      description: 'Hermoso peinado con trenzas africanas para ocasión especial',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      category: 'trenzas',
      tags: ['trenzas', 'africanas', 'elegante'],
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Manicure Francesa Clásica',
      description: 'Manicure francesa perfecta con acabado brillante',
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      category: 'uñas',
      tags: ['manicure', 'francesa', 'clásica'],
      createdAt: new Date()
    },
    {
      id: '3',
      title: 'Corte y Peinado Moderno',
      description: 'Corte de cabello moderno con peinado profesional',
      imageUrl: 'https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?auto=format&fit=crop&w=800&q=80',
      category: 'peluqueria',
      tags: ['corte', 'peinado', 'moderno'],
      createdAt: new Date()
    },
    {
      id: '4',
      title: 'Relajación en Spa',
      description: 'Sesión de relajación y cuidado corporal',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      category: 'spa',
      tags: ['spa', 'relajación', 'masaje'],
      createdAt: new Date()
    },
    {
      id: '5',
      title: 'Diseño de Cejas Perfecto',
      description: 'Cejas perfectamente diseñadas y definidas',
      imageUrl: 'https://images.unsplash.com/photo-1588510883462-801e14940026?auto=format&fit=crop&w=800&q=80',
      category: 'cejas',
      tags: ['cejas', 'diseño', 'definidas'],
      createdAt: new Date()
    },
    {
      id: '6',
      title: 'Maquillaje de Noche',
      description: 'Maquillaje elegante para eventos nocturnos',
      imageUrl: 'https://images.unsplash.com/photo-1487412947132-28c5d9539d3c?auto=format&fit=crop&w=800&q=80',
      category: 'maquillaje',
      tags: ['maquillaje', 'noche', 'elegante'],
      createdAt: new Date()
    }
  ];

  // Filtrar imágenes
  useEffect(() => {
    let filtered = [...images];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(image => image.category === selectedCategory);
    }

    setFilteredImages(filtered);
  }, [images, searchTerm, selectedCategory]);

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Galería D'Galú
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros trabajos más destacados y déjate inspirar por la belleza y el arte
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar en la galería..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de categoría */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredImages.length} de {images.length} imágenes
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>

        {/* Grid de imágenes */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => openImageModal(image)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Overlay con información */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white p-4">
                    <Eye className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{image.title}</h3>
                    <p className="text-xs opacity-90 line-clamp-2">{image.description}</p>
                  </div>
                </div>

                {/* Categoría */}
                <div className="absolute top-2 left-2">
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {categories.find(cat => cat.id === image.category)?.name || image.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron imágenes
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros de búsqueda
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal de imagen */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-96 md:max-h-full object-cover"
                />
              </div>
              
              <div className="md:w-1/3 p-6">
                <div className="mb-4">
                  <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                    {categories.find(cat => cat.id === selectedImage.category)?.name || selectedImage.category}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {selectedImage.title}
                </h2>
                
                <p className="text-gray-600 mb-4">
                  {selectedImage.description}
                </p>
                
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  {selectedImage.createdAt && (
                    <p>Fecha: {new Date(selectedImage.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;