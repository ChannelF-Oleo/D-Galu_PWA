import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import axios from "axios";
import { db } from "../utils/admin";

// 🔐 Secret
const GOOGLE_PLACES_API_KEY = defineSecret("GOOGLE_PLACES_API_KEY");

// ⚙️ CONFIG
const PLACE_ID = "TU_PLACE_ID_AQUI"; // Recuerda poner tu ID real
const FIRESTORE_DOC_PATH = "content/google_reviews";

export const getGoogleReviews = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB",
    secrets: [GOOGLE_PLACES_API_KEY],
    cors: true,
  },
  async (req, res) => {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const apiKey = GOOGLE_PLACES_API_KEY.value();
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${apiKey}`;

      const response = await axios.get(url);
      const data = response.data;

      if (!data.result || !data.result.reviews) {
        res.status(404).json({ error: "No reviews found" });
        return;
      }

      const reviews = data.result.reviews.map((review: any) => ({
        authorName: review.author_name,
        profilePhotoUrl: review.profile_photo_url || null,
        rating: review.rating,
        text: review.text || "",
        relativeTime: review.relative_time_description,
        time: review.time,
      }));

      // Guardar en Firestore
      await db.doc(FIRESTORE_DOC_PATH).set(
        {
          reviews,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      console.error("❌ Error fetching Google reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
