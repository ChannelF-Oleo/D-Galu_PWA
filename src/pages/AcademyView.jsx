import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Plus, 
  Users,
  Calendar,
  DollarSign,
  Eye,
  Edit2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  collection, 
  query, 
  getDocs,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { hasPermission } from "../utils/rolePermissions";
import "./AcademyView.css";

const AcademyView = ({ userRole }) => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  const canManage = hasPermission(userRole, "canManageCourses");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar cursos
      const coursesRef = collection(db, "courses");
      const coursesQuery = query(coursesRef, orderBy("createdAt", "desc"));
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cargar estudiantes
      const studentsRef = collection(db, "students");
      const studentsQuery = query(studentsRef, orderBy("enrolledAt", "desc"));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCourses(coursesData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: "Activo", class: "status--active", icon: CheckCircle },
      upcoming: { label: "Próximo", class: "status--upcoming", icon: Calendar },
      completed: { label: "Completado", class: "status--completed", icon: CheckCircle },
      cancelled: { label: "Cancelado", class: "status--cancelled", icon: XCircle }
    };
    
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    
    return (
      <span className={`status-badge ${badge.class}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const badges = {
      paid: { label: "Pagado", class: "payment--paid" },
      pending: { label: "Pendiente", class: "payment--pending" },
      partial: { label: "Parcial", class: "payment--partial" }
    };
    return badges[status] || badges.pending;
  };

  if (!canManage) {
    return (
      <div className="academy-view__no-access">
        <GraduationCap size={48} />
        <h2>Acceso Restringido</h2>
        <p>No tienes permisos para gestionar cursos.</p>
      </div>
    );
  }

  return (
    <div className="academy-view">
      {/* Header con tabs */}
      <div className="academy-view__header">
        <div className="academy-tabs">
          <button
            className={`academy-tab ${activeTab === "courses" ? "academy-tab--active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            <GraduationCap size={18} />
            Cursos
          </button>
          <button
            className={`academy-tab ${activeTab === "students" ? "academy-tab--active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <Users size={18} />
            Estudiantes
          </button>
        </div>

        <button className="academy-view__add-btn">
          <Plus size={20} />
          {activeTab === "courses" ? "Nuevo Curso" : "Nuevo Estudiante"}
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="academy-view__loading">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      ) : (
        <>
          {activeTab === "courses" && (
            <div className="courses-section">
              {courses.length === 0 ? (
                <div className="academy-view__empty">
                  <GraduationCap size={48} />
                  <h3>No hay cursos</h3>
                  <p>Comienza creando tu primer curso</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {courses.map((course) => (
                    <div key={course.id} className="course-card">
                      <div className="course-card__header">
                        <div className="course-card__image">
                          {course.image ? (
                            <img src={course.image} alt={course.name} />
                          ) : (
                            <div className="course-card__placeholder">
                              <GraduationCap size={32} />
                            </div>
                          )}
                        </div>
                        {getStatusBadge(course.status)}
                      </div>

                      <div className="course-card__content">
                        <h3 className="course-card__name">{course.name}</h3>
                        <p className="course-card__description">
                          {course.description || "Sin descripción"}
                        </p>

                        <div className="course-card__info">
                          <div className="info-item">
                            <Calendar size={14} />
                            <span>{course.duration || "—"} horas</span>
                          </div>
                          <div className="info-item">
                            <Users size={14} />
                            <span>{course.enrolledCount || 0} estudiantes</span>
                          </div>
                          <div className="info-item">
                            <DollarSign size={14} />
                            <span>${course.price?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="course-card__actions">
                        <button className="btn-card btn-card--view">
                          <Eye size={16} />
                          Ver Detalles
                        </button>
                        <button className="btn-card btn-card--edit">
                          <Edit2 size={16} />
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "students" && (
            <div className="students-section">
              {students.length === 0 ? (
                <div className="academy-view__empty">
                  <Users size={48} />
                  <h3>No hay estudiantes</h3>
                  <p>Los estudiantes inscritos aparecerán aquí</p>
                </div>
              ) : (
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Curso</th>
                        <th>Inscripción</th>
                        <th>Estado Pago</th>
                        <th>Progreso</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const payment = getPaymentBadge(student.paymentStatus);
                        return (
                          <tr key={student.id}>
                            <td>
                              <div className="student-info">
                                <div className="student-avatar">
                                  {student.name?.charAt(0).toUpperCase() || "E"}
                                </div>
                                <div>
                                  <div className="student-name">{student.name}</div>
                                  <div className="student-email">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{student.courseName}</td>
                            <td className="text-muted">
                              {student.enrolledAt?.toDate().toLocaleDateString("es-DO") || "—"}
                            </td>
                            <td>
                              <span className={`payment-badge ${payment.class}`}>
                                {payment.label}
                              </span>
                            </td>
                            <td>
                              <div className="progress-bar">
                                <div 
                                  className="progress-bar__fill"
                                  style={{ width: `${student.progress || 0}%` }}
                                />
                              </div>
                              <span className="progress-text">
                                {student.progress || 0}%
                              </span>
                            </td>
                            <td>
                              <button className="btn-icon">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AcademyView;