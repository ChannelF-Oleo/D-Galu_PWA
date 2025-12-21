import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  Edit2,
  MapPin,
  Package,
  Clock,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  Timestamp,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase"; // Ajusta ruta segun tu estructura
import { hasPermission } from "../utils/rolePermissions"; // Ajusta ruta
import CourseModal from "../components/ui/CourseModal";
import StudentModal from "../components/ui/StudentModal";
import "./AcademyView.css"; // Tu CSS existente

const AcademyView = ({ userRole }) => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  // --- Estados para Modales ---
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const canManage = hasPermission(userRole, "canManageCourses");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Cursos
      const coursesRef = collection(db, "courses");
      const coursesQuery = query(coursesRef, orderBy("createdAt", "desc"));
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesData);

      // Fetch Estudiantes
      const studentsRef = collection(db, "students");
      const studentsSnapshot = await getDocs(studentsRef);
      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers para Cursos ---
  const handleOpenCourseModal = (course = null) => {
    setEditingItem(course);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (courseData) => {
    try {
      const payload = {
        ...courseData,
        updatedAt: serverTimestamp(),
        startDate: courseData.startDate
          ? Timestamp.fromDate(new Date(courseData.startDate))
          : null,
      };

      if (editingItem) {
        await updateDoc(doc(db, "courses", editingItem.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        payload.studentsCount = 0;
        await addDoc(collection(db, "courses"), payload);
      }
      await fetchData();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Error al guardar el curso");
    }
  };

  // --- Handlers para Estudiantes ---
  const handleOpenStudentModal = (student = null) => {
    setEditingItem(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      const payload = {
        ...studentData,
        updatedAt: serverTimestamp(),
        enrolledAt: serverTimestamp(),
      };

      // Denormalizar nombre del curso para mostrarlo fácil en tabla
      const course = courses.find((c) => c.id === studentData.courseId);
      if (course) payload.courseName = course.title;

      if (editingItem) {
        await updateDoc(doc(db, "students", editingItem.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "students"), payload);
      }
      await fetchData();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  return (
    <div className="academy-view p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="text-purple-600 w-8 h-8" />
            Academia D-Galu
          </h1>
          <p className="text-gray-500 mt-1">
            Gestión profesional de cursos y alumnado
          </p>
        </div>

        {canManage && (
          <button
            onClick={() =>
              activeTab === "courses"
                ? handleOpenCourseModal()
                : handleOpenStudentModal()
            }
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            {activeTab === "courses" ? "Nuevo Curso" : "Nuevo Estudiante"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "courses"
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Cursos
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === "students"
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Estudiantes
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      ) : activeTab === "courses" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group flex flex-col"
            >
              <div className="relative h-48 bg-gray-200">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                    <GraduationCap size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-gray-700 shadow-sm border border-gray-100">
                    {course.modality || "Presencial"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-bold text-lg text-gray-900 line-clamp-1"
                    title={course.title}
                  >
                    {course.title}
                  </h3>
                  <span className="text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded text-sm">
                    RD$ {course.price}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                  {course.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-5 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-purple-500" />
                    <span className="truncate">
                      {course.schedule || "Horario pendiente"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-purple-500" />
                      <span>
                        Cupo: {course.studentsCount || 0}/
                        {course.capacity || "∞"}
                      </span>
                    </div>
                    {course.includesMaterials && (
                      <div className="flex items-center gap-1 text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">
                        <Package size={12} /> Materiales
                      </div>
                    )}
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleOpenCourseModal(course)}
                    className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-purple-200 hover:text-purple-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Editar Curso
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Tabla de Estudiantes (Simplificada para el ejemplo)
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4">{student.courseName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.paymentStatus === "paid"
                        ? "Pagado"
                        : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenStudentModal(student)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales Integrados */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveCourse}
        editingCourse={editingItem}
      />
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingItem}
        availableCourses={courses}
      />
    </div>
  );
};

export default AcademyView;
