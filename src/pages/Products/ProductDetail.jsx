import React from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Detalle del Producto</h1>
      <p className="page-desc">ID del producto: {id}</p>
      <p>Pronto mostraremos descripción, fotos y precio.</p>
    </div>
  );
};

export default ProductDetail;
