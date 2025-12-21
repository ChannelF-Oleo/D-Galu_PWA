import { useEffect, useState } from "react";
import "./ReviewsSection.css";

// Asegúrate de que esta URL sea EXACTAMENTE la que te dio Firebase al hacer deploy
const API_URL = "https://getgooglereviews-7fa64vatrq-uc.a.run.app";

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // Agregamos un estado para el mensaje de error específico
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log("📡 Fetching reviews from:", API_URL);
        const res = await fetch(API_URL);

        // 1. Si el servidor responde con error HTTP (404, 500, etc.)
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
        }

        const responseData = await res.json();
        console.log("✅ Respuesta del Backend:", responseData);

        // 2. Manejo de errores lógicos del Backend (según tu archivo TS)
        if (
          responseData.status === "ZERO_REVIEWS" ||
          responseData.status === "ERROR_GOOGLE"
        ) {
          throw new Error(
            responseData.message ||
              responseData.error_message ||
              "Error en Google API"
          );
        }

        // 3. Asignación correcta de datos
        // Tu backend devuelve { data: [...] }, no { reviews: [...] }
        if (responseData.data && Array.isArray(responseData.data)) {
          setReviews(responseData.data);
        } else {
          // Si llega aquí, la estructura no es la esperada
          console.warn("⚠️ Estructura inesperada:", responseData);
          setReviews([]);
        }
      } catch (err) {
        console.error("❌ Error fetching Google reviews:", err);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="reviews-section">
        <p className="reviews-loading">Cargando reseñas…</p>
      </section>
    );
  }

  // Si hay error o no hay reviews, no mostramos la sección
  if (errorMessage || reviews.length === 0) {
    console.log("Ocultando sección por:", errorMessage || "Sin reviews");
    return null;
  }

  return (
    <section className="reviews-section">
      <h2 className="reviews-title">Lo que dicen nuestros clientes</h2>

      <div className="reviews-grid">
        {reviews.map((review, index) => (
          <article key={index} className="review-card">
            <header className="review-header">
              {review.profilePhotoUrl && (
                <img
                  src={review.profilePhotoUrl}
                  alt={review.authorName}
                  className="review-avatar"
                  loading="lazy"
                />
              )}

              <div className="review-meta">
                <strong className="review-author">{review.authorName}</strong>
                <span className="review-rating">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
            </header>

            {review.text && <p className="review-text">“{review.text}”</p>}

            {review.relativeTime && (
              <small className="review-time">{review.relativeTime}</small>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
