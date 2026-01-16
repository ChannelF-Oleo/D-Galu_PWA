import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { emailService } from "../../services/emailService";
import CourseEnrollmentModal from "../../components/ui/CourseEnrollmentModal";
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
  MessageCircle,
  AlertCircle
} from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener curso de Firebase
        const courseDoc = await getDoc(doc(db, 'courses', id));
        
        if (courseDoc.exists()) {
          const courseData = { id: courseDoc.id, ...courseDoc.data() };
          setCourse(courseData);
          
          // Verificar si el usuario ya está inscrito
          if (user) {
            await checkEnrollmentStatus(courseData.id, user.uid);
          }
        } else {
          setError('Curso no encontrado');
          setCourse(null);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Error al cargar el curso. Por favor intenta de nuevo.');
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate, user]);

  // Verificar si el usuario ya está inscrito (por email si no está autenticado)
  const checkEnrollmentStatus = async (courseId, userId) => {
    try {
      setCheckingEnrollment(true);
      const enrollmentsRef = collection(db, 'course_enrollments');
      const q = query(
        enrollmentsRef,
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      setIsEnrolled(!snapshot.empty);
    } catch (err) {
      console.error('Error checking enrollment:', err);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnrollClick = () => {
    // Abrir modal de inscripción
    setShowEnrollmentModal(true);
  };

  const handleEnrollSubmit = async (formData) => {
    try {
      setEnrolling(true);
      setError(null);

      // Verificar si ya existe inscripción con este email
      const enrollmentsRef = collection(db, 'course_enrollments');
      const q = query(
        enrollmentsRef,
        where('courseId', '==', course.id),
        where('userEmail', '==', formData.email)
      );
      const existingEnrollment = await getDocs(q);
      
      if (!existingEnrollment.empty) {
        throw new Error('Este email ya está inscrito en el curso');
      }
      
      // Crear inscripción en Firebase
      const enrollmentData = {
        courseId: course.id,
        courseTitle: course.title,
        userId: user?.uid || 'guest',
        userEmail: formData.email,
        userName: formData.fullName,
        userPhone: formData.phone,
        enrolledAt: serverTimestamp(),
        status: 'pending', // pending hasta que se confirme el pago
        paymentStatus: 'pending',
        price: course.price || 0,
      };

      const enrollmentRef = await addDoc(enrollmentsRef, enrollmentData);

      console.log('Enrollment created successfully:', enrollmentRef.id);

      // Enviar email de confirmación
      try {
        await emailService.sendCourseEnrollmentConfirmation({
          userEmail: formData.email,
          studentName: formData.fullName,
          courseTitle: course.title,
          instructor: course.instructor || 'D\'Galú Academy',
          duration: course.duration || 'Por definir',
          price: `RD$ ${course.price || 0}`,
          startDate: course.startDate || new Date().toISOString(),
          enrollmentId: enrollmentRef.id
        });
        console.log('Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Error sending enrollment confirmation email:', emailError);
        // No fallar la inscripción por error de email
      }

      setIsEnrolled(true);
      setShowEnrollmentModal(false);
      
      // Mostrar mensaje de éxito
      alert(`¡Inscripción exitosa!\n\nHemos enviado un email de confirmación a ${formData.email} con los detalles del curso.\n\nNos pondremos en contacto contigo pronto para coordinar el pago.`);
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setError(error.message || 'Error al inscribirse. Por favor intenta de nuevo.');
      alert(error.message || 'Error al inscribirse. Por favor intenta de nuevo.');
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
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Curso no encontrado'}
          </h1>
          <p className="text-gray-600 mb-6">
            El curso que buscas no está disponible o no existe.
          </p>
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
                      onClick={handleEnrollClick}
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

                    <p className="text-xs text-gray-500 text-center mt-2">
                      Completa el formulario de inscripción
                    </p>

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

      {/* Enrollment Modal */}
      <CourseEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onSubmit={handleEnrollSubmit}
        course={course}
        loading={enrolling}
      />
    </div>
  );
};

export default CourseDetail;
