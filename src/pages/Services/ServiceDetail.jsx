import React from "react";
import { useParams } from "react-router-dom";

const ServiceDetail = () => {
  const { id } = useParams();

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Detalle del Servicio</h1>
      <p className="page-desc">ID del servicio: {id}</p>
      <p>Pronto mostraremos información completa del servicio.</p>
    </div>
  );
};

export default ServiceDetail;
