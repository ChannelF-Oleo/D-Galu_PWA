import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award,
  Calendar,
  User,
  CheckCircle,
  PlayCircle,
  Download,
  MessageCircle
} from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // Intentar obtener curso de Firebase
        const courseDoc = await getDoc(doc(db, 'courses', id));
        
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() });
        } else {
          // Fallback a curso de ejemplo
          const fallbackCourse = getFallbackCourse(id);
          if (fallbackCourse) {
            setCourse(fallbackCourse);
          } else {
            navigate('/academy');
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        // Fallback a curso de ejemplo
        const fallbackCourse = getFallbackCourse(id);
        if (fallbackCourse) {
          setCourse(fallbackCourse);
        } else {
          navigate('/academy');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  const getFallbackCourse = (courseId) => {
    const courses = {
      'course-1': {
        id: 'course-1',
        title: 'Técnicas Avanzadas de Trenzas Africanas',
        description: 'Aprende las técnicas más modernas y tradicionales de trenzado africano con nuestros expertos. Este curso te llevará desde los fundamentos básicos hasta las técnicas más avanzadas utilizadas por profesionales en todo el mundo.',
        duration: '40 horas',
        students: 150,
        rating: 4.9,
        price: 299,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        level: 'Intermedio',
        category: 'Peluquería',
        featured: true,
        instructor: 'María González',
        instructorBio: 'Especialista en trenzas africanas con más de 15 años de experiencia. Certificada internacionalmente.',
        instructorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80',
        startDate: '2024-02-15',
        endDate: '2024-03-15',
        schedule: 'Lunes a Viernes, 9:00 AM - 1:00 PM',
        modules: 8,
        certificate: true,
        requirements: [
          'Conocimientos básicos de peluquería',
          'Herramientas básicas de peinado',
          'Disponibilidad de tiempo completo'
        ],
        curriculum: [
          {
            module: 1,
            title: 'Fundamentos de Trenzas Africanas',
            duration: '5 horas',
            topics: ['Historia y cultura', 'Tipos de cabello', 'Herramientas básicas']
          },
          {
            module: 2,
            title: 'Técnicas Básicas',
            duration: '5 horas',
            topics: ['Trenza simple', 'Trenza francesa', 'Preparación del cabello']
          },
          {
            module: 3,
            title: 'Patrones y Diseños',
            duration: '5 horas',
            topics: ['Patrones geométricos', 'Diseños creativos', 'Combinaciones']
          },
          {
            module: 4,
            title: 'Técnicas Avanzadas',
            duration: '5 horas',
            topics: ['Box braids', 'Cornrows', 'Twist outs']
          },
          {
            module: 5,
            title: 'Cuidado y Mantenimiento',
            duration: '5 horas',
            topics: ['Productos recomendados', 'Rutinas de cuidado', 'Solución de problemas']
          },
          {
            module: 6,
            title: 'Práctica Supervisada',
            duration: '5 horas',
            topics: ['Trabajo con modelos', 'Corrección de técnicas', 'Evaluación']
          },
          {
            module: 7,
            title: 'Aspectos Comerciales',
            duration: '5 horas',
            topics: ['Precios y costos', 'Atención al cliente', 'Marketing personal']
          },
          {
            module: 8,
            title: 'Examen Final y Certificación',
            duration: '5 horas',
            topics: ['Examen práctico', 'Evaluación teórica', 'Entrega de certificados']
          }
        ],
        benefits: [
          'Certificado oficial de D\'Galú Academy',
          'Kit de herramientas profesionales incluido',
          'Acceso a grupo privado de graduados',
          'Descuentos en productos profesionales',
          'Seguimiento post-graduación por 6 meses'
        ]
      }
    };

    return courses[courseId] || null;
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      
      // Crear inscripción en Firebase
      const enrollmentRef = await addDoc(collection(db, 'course_enrollments'), {
        courseId: course.id,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        enrolledAt: serverTimestamp(),
        status: 'enrolled',
        paymentStatus: 'pending'
      });

      // Enviar email de confirmación
      try {
        const { emailService } = await import('../../services/emailService');
        await emailService.sendCourseEnrollmentConfirmation({
          userEmail: user.email,
          studentName: user.displayName || user.email,
          courseTitle: course.title,
          instructor: course.instructor,
          duration: course.duration,
          price: course.price,
          startDate: course.startDate,
          enrollmentId: enrollmentRef.id
        });
      } catch (emailError) {
        console.error('Error sending enrollment confirmation email:', emailError);
        // No fallar la inscripción por error de email
      }

      setIsEnrolled(true);
      alert('¡Inscripción exitosa! Te hemos enviado un email de confirmación con los detalles.');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error al inscribirse. Por favor intenta de nuevo.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="w-32 h-8 bg-gray-300 rounded mb-6"></div>
            <div className="bg-white rounded-xl p-8">
              <div className="w-full h-64 bg-gray-300 rounded-lg mb-6"></div>
              <div className="w-3/4 h-8 bg-gray-300 rounded mb-4"></div>
              <div className="w-1/2 h-4 bg-gray-300 rounded mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="w-full h-32 bg-gray-300 rounded mb-4"></div>
                  <div className="w-full h-32 bg-gray-300 rounded"></div>
                </div>
                <div className="w-full h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h1>
          <button
            onClick={() => navigate('/academy')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver a la Academia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/academy')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver a la Academia
        </button>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Hero Section */}
          <div className="relative">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {course.category}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  course.level === 'Principiante' ? 'bg-green-500' :
                  course.level === 'Intermedio' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {course.level}
                </span>
                {course.certificate && (
                  <Award size={20} className="text-yellow-400" />
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span>{course.rating} ({course.students} estudiantes)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  <span>{course.modules} módulos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Description */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción del Curso</h2>
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                </section>

                {/* Curriculum */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Temario del Curso</h2>
                  <div className="space-y-4">
                    {course.curriculum?.map((module, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Módulo {module.module}: {module.title}
                          </h3>
                          <span className="text-sm text-gray-500">{module.duration}</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {module.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-500" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Requirements */}
                {course.requirements && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Requisitos</h2>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle size={16} className="text-purple-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Benefits */}
                {course.benefits && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Beneficios Incluidos</h2>
                    <ul className="space-y-2">
                      {course.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle size={16} className="text-green-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Instructor */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={course.instructorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=400&q=80'}
                      alt={course.instructor}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{course.instructor}</h3>
                      <p className="text-gray-600 text-sm">{course.instructorBio}</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        ${course.price}
                      </div>
                      <div className="text-sm text-gray-500">Pago único</div>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar size={16} />
                        <div>
                          <div className="font-medium">Inicio</div>
                          <div>{new Date(course.startDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      {course.schedule && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Clock size={16} />
                          <div>
                            <div className="font-medium">Horario</div>
                            <div>{course.schedule}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Users size={16} />
                        <div>
                          <div className="font-medium">Estudiantes</div>
                          <div>{course.students} inscritos</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <BookOpen size={16} />
                        <div>
                          <div className="font-medium">Duración</div>
                          <div>{course.duration}</div>
                        </div>
                      </div>
                    </div>

                    {/* Enroll Button */}
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling || isEnrolled}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        isEnrolled
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : enrolling
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isEnrolled ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle size={20} />
                          Inscrito
                        </span>
                      ) : enrolling ? (
                        'Inscribiendo...'
                      ) : (
                        'Inscribirse Ahora'
                      )}
                    </button>

                    {!user && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Necesitas iniciar sesión para inscribirte
                      </p>
                    )}

                    {/* Contact */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">¿Tienes preguntas?</h3>
                      <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm">
                        <MessageCircle size={16} />
                        Contactar instructor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
