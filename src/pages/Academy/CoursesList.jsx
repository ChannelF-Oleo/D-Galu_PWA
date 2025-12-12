import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Filter,
  Search,
  ArrowRight,
  Award,
  Calendar
} from "lucide-react";

const CoursesList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Intentar obtener cursos de Firebase
        const coursesQuery = query(
          collection(db, 'courses'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(coursesQuery);
        
        if (!snapshot.empty) {
          const coursesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCourses(coursesData);
        } else {
          // Fallback a cursos de ejemplo
          setCourses(getFallbackCourses());
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        // Fallback a cursos de ejemplo
        setCourses(getFallbackCourses());
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getFallbackCourses = () => [
    {
      id: 'course-1',
      title: 'Técnicas Avanzadas de Trenzas Africanas',
      description: 'Aprende las técnicas más modernas y tradicionales de trenzado africano con nuestros expertos. Incluye práctica con modelos reales.',
      duration: '40 horas',
      students: 150,
      rating: 4.9,
      price: 299,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      level: 'Intermedio',
      category: 'Peluquería',
      featured: true,
      instructor: 'María González',
      startDate: '2024-02-15',
      modules: 8,
      certificate: true
    },
    {
      id: 'course-2',
      title: 'Manicure y Pedicure Profesional',
      description: 'Domina todas las técnicas de cuidado de uñas, desde lo básico hasta diseños avanzados. Incluye kit de herramientas.',
      duration: '30 horas',
      students: 200,
      rating: 4.8,
      price: 249,
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      level: 'Principiante',
      category: 'Manicure',
      featured: true,
      instructor: 'Ana Rodríguez',
      startDate: '2024-02-20',
      modules: 6,
      certificate: true
    },
    {
      id: 'course-3',
      title: 'Spa y Relajación Terapéutica',
      description: 'Conviértete en especialista en tratamientos de spa y técnicas de relajación. Aprende masajes terapéuticos.',
      duration: '35 horas',
      students: 120,
      rating: 4.9,
      price: 349,
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      level: 'Avanzado',
      category: 'Spa',
      featured: true,
      instructor: 'Carmen López',
      startDate: '2024-03-01',
      modules: 10,
      certificate: true
    },
    {
      id: 'course-4',
      title: 'Maquillaje Profesional',
      description: 'Aprende técnicas de maquillaje para eventos, bodas y sesiones fotográficas. Incluye productos profesionales.',
      duration: '25 horas',
      students: 180,
      rating: 4.7,
      price: 199,
      image: 'https://images.unsplash.com/photo-1487412947132-28c5d9539d3c?auto=format&fit=crop&w=800&q=80',
      level: 'Principiante',
      category: 'Maquillaje',
      featured: false,
      instructor: 'Sofía Martín',
      startDate: '2024-02-25',
      modules: 5,
      certificate: true
    },
    {
      id: 'course-5',
      title: 'Extensiones de Pestañas',
      description: 'Especialízate en aplicación de extensiones de pestañas. Técnicas clásicas y volumen ruso.',
      duration: '20 horas',
      students: 95,
      rating: 4.8,
      price: 279,
      image: 'https://images.unsplash.com/photo-1587570497554-1b72e5352608?auto=format&fit=crop&w=800&q=80',
      level: 'Intermedio',
      category: 'Pestañas',
      featured: false,
      instructor: 'Isabella Torres',
      startDate: '2024-03-10',
      modules: 4,
      certificate: true
    },
    {
      id: 'course-6',
      title: 'Microblading y Cejas',
      description: 'Técnicas avanzadas de microblading y diseño de cejas. Incluye práctica supervisada.',
      duration: '45 horas',
      students: 75,
      rating: 4.9,
      price: 399,
      image: 'https://images.unsplash.com/photo-1588510883462-801e14940026?auto=format&fit=crop&w=800&q=80',
      level: 'Avanzado',
      category: 'Cejas',
      featured: false,
      instructor: 'Valentina Cruz',
      startDate: '2024-03-15',
      modules: 12,
      certificate: true
    }
  ];

  // Filtrar cursos
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const levels = ["all", "Principiante", "Intermedio", "Avanzado"];
  const categories = ["all", "Peluquería", "Manicure", "Spa", "Maquillaje", "Pestañas", "Cejas"];

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {course.featured && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              Destacado
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            course.level === 'Principiante' ? 'bg-green-100 text-green-800' :
            course.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.level}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star size={12} className="text-yellow-400 fill-current" />
          <span className="text-xs font-medium text-gray-700">
            {course.rating}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
            {course.category}
          </span>
          {course.certificate && (
            <Award size={14} className="text-yellow-500" />
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1 mb-1">
            <Users size={12} />
            <span>Instructor: {course.instructor}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Inicia: {new Date(course.startDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Course info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={12} />
            <span>{course.modules} módulos</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{course.students}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-purple-600">
              ${course.price}
            </span>
            <span className="text-xs text-gray-500">
              Pago único
            </span>
          </div>

          <button
            onClick={() => navigate(`/academy/${course.id}`)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Ver Detalles
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="w-64 h-8 bg-gray-300 rounded mb-4"></div>
            <div className="w-96 h-4 bg-gray-300 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border">
                  <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="w-1/4 h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
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
            <GraduationCap className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            D'Galú Academy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Desarrolla tus habilidades profesionales con nuestros cursos especializados en belleza y bienestar
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === "all" ? "Todos los niveles" : level}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "Todas las categorías" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredCourses.length} de {courses.length} cursos
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron cursos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros de búsqueda
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedLevel("all");
                setSelectedCategory("all");
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesList;
