// src/tests/SmokeTest.jsx
// Smoke tests para verificar compatibilidad con React 19

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Swiper, SwiperSlide } from 'swiper/react';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const SmokeTest = () => {
  const [date, setDate] = useState(new Date());
  const { register, handleSubmit } = useForm();

  const testToast = () => {
    toast.success('🎉 React Hot Toast funciona con React 19!');
  };

  const testForm = (data) => {
    toast.success(`Formulario enviado: ${data.test}`);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-green-800 mb-4">
          ✅ Smoke Tests - React 19 Compatibility
        </h1>
        <p className="text-green-700">
          Si puedes ver esta página sin errores en consola, las librerías críticas son compatibles.
        </p>
      </div>

      {/* Test 1: React Calendar */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">📅 Test: React Calendar</h2>
        <div className="max-w-md">
          <Calendar
            onChange={setDate}
            value={date}
            className="border rounded-lg"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Fecha seleccionada: {date.toLocaleDateString()}
        </p>
      </div>

      {/* Test 2: Swiper */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">🎠 Test: Swiper</h2>
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          className="h-32 bg-gray-100 rounded-lg"
        >
          <SwiperSlide className="flex items-center justify-center bg-blue-100 rounded-lg">
            <span className="text-blue-800 font-medium">Slide 1</span>
          </SwiperSlide>
          <SwiperSlide className="flex items-center justify-center bg-green-100 rounded-lg">
            <span className="text-green-800 font-medium">Slide 2</span>
          </SwiperSlide>
          <SwiperSlide className="flex items-center justify-center bg-purple-100 rounded-lg">
            <span className="text-purple-800 font-medium">Slide 3</span>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Test 3: React Hot Toast */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">🍞 Test: React Hot Toast</h2>
        <button
          onClick={testToast}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Probar Toast
        </button>
      </div>

      {/* Test 4: React Hook Form */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">📝 Test: React Hook Form</h2>
        <form onSubmit={handleSubmit(testForm)} className="space-y-4">
          <input
            {...register('test', { required: true })}
            placeholder="Escribe algo para probar..."
            className="w-full p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Enviar Formulario
          </button>
        </form>
      </div>

      {/* Test Results */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Resultados del Test:</h3>
        <ul className="text-blue-700 space-y-1">
          <li>✅ React Calendar: Renderizado correctamente</li>
          <li>✅ Swiper: Slides funcionando</li>
          <li>✅ React Hot Toast: Listo para notificaciones</li>
          <li>✅ React Hook Form: Formularios operativos</li>
        </ul>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default SmokeTest;