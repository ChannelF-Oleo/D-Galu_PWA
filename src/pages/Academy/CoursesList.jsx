import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
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
  Calendar,
  AlertCircle,
} from "lucide-react";

const CoursesList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9; // 3x3 grid

  // Definimos las categorías disponibles
  const categories = [
    "all",
    "Peluquería",
    "Manicure",
    "Spa",
    "Maquillaje",
    "Pestañas",
    "Cejas",
    "General", // Agregado para cursos sin categoría definida
  ];

  const levels = ["all", "Principiante", "Intermedio", "Avanzado"];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        // Referencia a la colección (sin filtros complejos por ahora para asegurar que lleguen datos)
        const coursesRef = collection(db, "courses");
        const snapshot = await getDocs(coursesRef);

        if (!snapshot.empty) {
          // Mapeamos los datos de Firebase a la estructura que necesita tu UI
          const coursesData = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              ...data,
              // 1. TRANSFORMACIÓN DE FECHAS
              // Firebase devuelve Timestamp, lo convertimos a String ISO para que React no falle
              startDate: data.startDate?.toDate
                ? data.startDate.toDate().toISOString()
                : new Date().toISOString(),

              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate().toISOString()
                : new Date().toISOString(),

              // 2. MAPEO DE CAMPOS (Firebase vs UI)
              students: data.studentsCount || 0, // Tu DB dice studentsCount, la UI usa students
              certificate: data.includesMaterials || true, // Usamos includesMaterials como proxy o true por defecto

              // 3. VALORES POR DEFECTO (Para campos que aún no tienes en DB)
              rating: data.rating || 5.0,
              level: data.level || "Principiante",
              category: data.category || "General",
              featured: data.featured || false,
              modules: data.modules || 4,
              image:
                data.image ||
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
            };
          });

          console.log("🔥 Cursos cargados desde Firebase:", coursesData);
          setCourses(coursesData);
        } else {
          console.log("⚠️ Firebase vacío, no hay cursos disponibles");
          setCourses([]);
        }
      } catch (err) {
        console.error("❌ Error fetching courses:", err);
        setError("Error al cargar los cursos");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filtrar cursos
  const filteredCourses = courses.filter((course) => {
    // Protección contra valores nulos
    const title = course.title || "";
    const desc = course.description || "";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      selectedLevel === "all" || course.level === selectedLevel;

    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Paginación
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedCategory]);

  // Componente de Tarjeta individual
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
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              course.level === "Principiante"
                ? "bg-green-100 text-green-800"
                : course.level === "Intermedio"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
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
            <span>Instructor: {course.instructor || "D'Galú Staff"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>
              Inicia:{" "}
              {course.startDate
                ? new Date(course.startDate).toLocaleDateString()
                : "Próximamente"}
            </span>
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
            <span className="text-xs text-gray-500">Pago único</span>
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

  // Loading State
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

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar cursos
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reintentar
            </button>
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
            Desarrolla tus habilidades profesionales con nuestros cursos
            especializados en belleza y bienestar
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
                {levels.map((level) => (
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
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "Todas las categorías" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Mostrando {indexOfFirstCourse + 1}-{Math.min(indexOfLastCourse, filteredCourses.length)} de {filteredCourses.length} cursos
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </p>
          )}
        </div>

        {/* Courses Grid */}
        {currentCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Mostrar solo páginas cercanas a la actual
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
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
