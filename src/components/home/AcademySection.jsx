import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  GraduationCap,
  ArrowRight,
  Clock,
  Users,
  Star,
  BookOpen,
} from "lucide-react";

const AcademySection = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);

        // Query simplificada: Traemos 3 cursos cualquiera para asegurar que se vean datos
        const coursesQuery = query(collection(db, "courses"), limit(3));

        const snapshot = await getDocs(coursesQuery);

        if (!snapshot.empty) {
          const coursesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // 1. TRANSFORMACIÓN DE FECHAS (Crítico para evitar errores)
              startDate: data.startDate?.toDate
                ? data.startDate.toDate().toISOString()
                : new Date().toISOString(),

              // 2. MAPEO DE CAMPOS
              students: data.studentsCount || 0, // Mapeamos studentsCount a students

              // 3. VALORES POR DEFECTO (Para UI consistente)
              rating: data.rating || 5.0,
              level: data.level || "Principiante",
              image:
                data.image ||
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
              featured: true,
            };
          });

          console.log("🔥 Cursos Home cargados:", coursesData);
          setCourses(coursesData);
        } else {
          // Fallback a cursos de ejemplo solo si Firebase está vacío
          setCourses(getFallbackCourses());
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourses(getFallbackCourses());
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  const getFallbackCourses = () => [
    {
      id: "course-1",
      title: "Técnicas Avanzadas de Trenzas Africanas",
      description:
        "Aprende las técnicas más modernas y tradicionales de trenzado africano.",
      duration: "40 horas",
      students: 150,
      rating: 4.9,
      price: 299,
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
      level: "Intermedio",
      featured: true,
    },
    {
      id: "course-2",
      title: "Manicure y Pedicure Profesional",
      description: "Domina todas las técnicas de cuidado de uñas.",
      duration: "30 horas",
      students: 200,
      rating: 4.8,
      price: 249,
      image:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
      level: "Principiante",
      featured: true,
    },
    {
      id: "course-3",
      title: "Spa y Relajación Terapéutica",
      description: "Conviértete en especialista en tratamientos de spa.",
      duration: "35 horas",
      students: 120,
      rating: 4.9,
      price: 349,
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
      level: "Avanzado",
      featured: true,
    },
  ];

  const CourseCard = ({ course }) => (
    <div className="course-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full">
      <div className="relative overflow-hidden h-48">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.description}
          </p>

          {/* Course info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{course.students} estudiantes</span>
            </div>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-purple-600">
              ${course.price}
            </span>
            <span className="text-xs text-gray-500">Pago único</span>
          </div>

          <button
            onClick={() => navigate(`/academy/${course.id}`)}
            className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <BookOpen size={14} />
            Ver Curso
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="w-48 h-6 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
            <div className="w-64 h-4 bg-gray-300 rounded animate-pulse mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 animate-pulse border"
              >
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                <div className="w-1/4 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header de la sección */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-8 h-8 text-purple-600" />
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            D'Galú Academy
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Desarrolla tus habilidades profesionales con nuestros cursos
            especializados. Aprende de los mejores expertos en belleza y
            bienestar.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Certificación incluida
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Práctica real
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Instructores expertos
            </span>
          </div>
        </div>

        {/* Grid de cursos */}
        {courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Call to action */}
            <div className="text-center">
              <button
                onClick={() => navigate("/academy")}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-all hover:shadow-lg font-semibold"
              >
                Ver Todos los Cursos
                <ArrowRight size={20} />
              </button>

              <p className="text-sm text-gray-500 mt-3">
                Más de {courses.length} cursos especializados disponibles
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Academia en Preparación
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos preparando cursos increíbles para potenciar tu carrera
              profesional
            </p>
            <button
              onClick={() => navigate("/academy")}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Explorar Academia
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AcademySection;
