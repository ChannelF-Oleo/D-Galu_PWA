// src/components/home/ReviewsSection.jsx
import { useEffect, useState } from "react";
import "./ReviewsSection.css";

const ENDPOINT =
  import.meta.env.VITE_GOOGLE_REVIEWS_ENDPOINT;

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(ENDPOINT);

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
