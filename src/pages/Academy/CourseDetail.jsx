import React from "react";
import { useParams } from "react-router-dom";

const CourseDetail = () => {
  const { id } = useParams();

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Detalle del Curso</h1>
      <p className="page-desc">ID del curso: {id}</p>
      <p>Pronto agregaremos temario, horarios y facilitadora.</p>
    </div>
  );
};

export default CourseDetail;
