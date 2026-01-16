import React, { useState } from "react";
import { X, Save, User, Mail, Phone, AlertCircle, CheckCircle } from "lucide-react";
import Portal from "./Portal";

const CourseEnrollmentModal = ({ isOpen, onClose, onSubmit, course, loading }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!isOpen) return null;

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value || value.trim().length < 3) {
          return "El nombre debe tener al menos 3 caracteres";
        }
        return null;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          return "Email inválido";
        }
        return null;

      case "phone":
        const phoneRegex = /^[0-9]{10}$/;
        if (!value || !phoneRegex.test(value.replace(/[\s-]/g, ""))) {
          return "Teléfono debe tener 10 dígitos";
        }
        return null;

      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({ fullName: true, email: true, phone: true });

    // Si hay errores, no continuar
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Enviar datos
    await onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ fullName: "", email: "", phone: "" });
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Inscripción al Curso
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {course?.title}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Course Info */}
          <div className="px-6 py-4 bg-purple-50 border-b">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Precio:</span>
              <span className="text-2xl font-bold text-purple-600">
                ${course?.price}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Duración: {course?.duration} • {course?.modules} módulos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Ej: María González"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
                    errors.fullName && touched.fullName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
              </div>
              {errors.fullName && touched.fullName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="8091234567"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
                    errors.phone && touched.phone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formato: 10 dígitos sin espacios ni guiones
              </p>
            </div>

            {/* Info adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Próximos pasos:</p>
                  <ul className="text-xs space-y-1 text-blue-700">
                    <li>• Recibirás un email de confirmación</li>
                    <li>• Te contactaremos para coordinar el pago</li>
                    <li>• Te enviaremos los detalles del curso</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Inscribirme
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default CourseEnrollmentModal;
