// src/components/home/ReviewsSection.jsx
import { useEffect, useState } from "react";
import "./ReviewsSection.css";

// 1. DEFINIMOS LA URL (Solo texto)
const API_URL = "https://getgooglereviews-7fa64vatrq-uc.a.run.app";

console.log("📡 Conectando a:", API_URL);

try {
  // 2. HACEMOS LA PETICIÓN
  const response = await fetch(API_URL);

  // 3. VERIFICAMOS SI ES HTML (El error del '<')
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/html")) {
    throw new Error("❌ Error: La URL devolvió HTML en vez de JSON. Verifica la dirección.");
  }

  // 4. LEEMOS EL JSON
  const data = await response.json();
  console.log("✅ Datos recibidos:", data);

  // Aquí actualizas tu estado con 'data'
  // setReviews(data.data || []);

} catch (error) {
  console.error("❌ Error en el frontend:", error);
}

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(API_URL);

        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Error fetching Google reviews:", err);
        setError(true);
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

  if (error || !reviews.length) {
    return null;
  }

  return (
    <section className="reviews-section">
      <h2 className="reviews-title">
        Lo que dicen nuestros clientes
      </h2>

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
                <strong className="review-author">
                  {review.authorName}
                </strong>

                <span className="review-rating">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
            </header>

            {review.text && (
              <p className="review-text">
                “{review.text}”
              </p>
            )}

            {review.relativeTime && (
              <small className="review-time">
                {review.relativeTime}
              </small>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
