import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import axios from "axios"; // ✅ Usamos Axios
import { db } from "../utils/admin";

const GOOGLE_PLACES_API_KEY = defineSecret("GOOGLE_PLACES_API_KEY");

// Tu ID real (Confirmado)
const PLACE_ID = "ChIJcaSTndyJr44RupvNk9S9jFE";

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
      const apiKey = GOOGLE_PLACES_API_KEY.value();
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${apiKey}&language=es`;

      // ✅ Petición con Axios
      const response = await axios.get(url);
      const data = response.data;

      // 🛑 MODO DETECTIVE: Ver qué responde Google exactamente
      console.log("🔍 Respuesta de Google:", JSON.stringify(data, null, 2));

      // Si Google responde con un estado que no es OK (ej. REQUEST_DENIED)
      if (data.status !== "OK") {
        res.status(200).json({
          status: "ERROR_GOOGLE",
          google_says: data.status,
          error_message: data.error_message || "Sin mensaje detallado",
          full_response: data,
        });
        return;
      }

      // Si Google dice OK pero no hay reseñas
      if (!data.result || !data.result.reviews) {
        res.status(200).json({
          status: "ZERO_REVIEWS",
          message:
            "El ID es válido y la API funciona, pero no hay reseñas públicas.",
          place_id_used: PLACE_ID,
        });
        return;
      }

      const reviews = data.result.reviews;

      // Guardar en Firestore
      await db
        .doc("content/google_reviews")
        .set({ reviews, updatedAt: new Date() }, { merge: true });

      // Respuesta exitosa
      res
        .status(200)
        .json({ success: true, count: reviews.length, data: reviews });
    } catch (error: any) {
      console.error("❌ Error:", error);
      // Axios encapsula el error de red o respuesta
      const errorData = error.response ? error.response.data : error.message;
      res.status(500).json({ error: "Fallo interno", details: errorData });
    }
  }
);
