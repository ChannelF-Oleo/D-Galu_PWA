// src/utils/seedServices.js
import { db } from "../config/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";

// Tu lista maestra de servicios convertida a datos
const servicesData = [
  {
    id: "peluqueria", // ID único para la URL
    name: "Peluquería / Cabello",
    description: "Cortes, color, tratamientos y estilismo profesional.",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80", // Imagen placeholder
    subservices: [
      { name: "Corte de cabello (regular, capas, bob, pixie)", price: 0 },
      { name: "Lavado + acondicionador", price: 0 },
      { name: "Secado / Brushing / Blowout", price: 0 },
      { name: "Planchado / Ondas / Rizos definidos", price: 0 },
      { name: "Peinados para eventos (recogidos, glam waves)", price: 0 },
      { name: "Tintes (color completo, retoque, baño)", price: 0 },
      { name: "Mechas (Highlights, Balayage, Babylights)", price: 0 },
      { name: "Tratamientos (Hidratación, Botox, Keratina)", price: 0 },
      { name: "Alisados químicos / permanentes", price: 0 },
      { name: "Extensiones (Colocación, mantenimiento)", price: 0 },
      { name: "Trenzas africanas (Box braids, Cornrows)", price: 0 },
      { name: "Peinados protectores", price: 0 },
      { name: "Pelucas (Instalación y estilismo)", price: 0 }
    ]
  },
  {
    id: "manicure-pedicure",
    name: "Manicure y Pedicure",
    description: "Cuidado y belleza para tus manos y pies.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    subservices: [
      { name: "Manicura clásica", price: 0 },
      { name: "Pedicura clásica", price: 0 },
      { name: "Manicura Spa", price: 0 },
      { name: "Pedicura Spa", price: 0 },
      { name: "Esmaltado regular", price: 0 },
      { name: "Esmaltado semipermanente", price: 0 },
      { name: "Uñas acrílicas (Set completo)", price: 0 },
      { name: "Uñas en gel (Soft gel, Polygel)", price: 0 },
      { name: "Nail Art (Diseños)", price: 0 },
      { name: "Reparación de uñas", price: 0 },
      { name: "Tratamiento de parafina", price: 0 }
    ]
  },
  {
    id: "cejas-browbar",
    name: "Cejas (Brow Bar)",
    description: "Diseño y perfección para tu mirada.",
    image: "https://images.unsplash.com/photo-1588510883462-801e14940026?auto=format&fit=crop&w=800&q=80",
    subservices: [
      { name: "Diseño de cejas", price: 0 },
      { name: "Depilación (Cera / Hilo)", price: 0 },
      { name: "Perfilado completo", price: 0 },
      { name: "Tinte de cejas", price: 0 },
      { name: "Henna Brows", price: 0 },
      { name: "Brow Lamination (Laminado)", price: 0 },
      { name: "Nutrición de cejas", price: 0 }
    ]
  },
  {
    id: "pestañas-lashbar",
    name: "Pestañas (Lash Bar)",
    description: "Extensiones y lifting para una mirada impactante.",
    image: "https://images.unsplash.com/photo-1587570497554-1b72e5352608?auto=format&fit=crop&w=800&q=80",
    subservices: [
      { name: "Lifting de pestañas", price: 0 },
      { name: "Tinte de pestañas", price: 0 },
      { name: "Extensiones Clásicas", price: 0 },
      { name: "Extensiones Híbridas", price: 0 },
      { name: "Extensiones Volumen", price: 0 },
      { name: "Extensiones Mega Volumen", price: 0 },
      { name: "Retoque de extensiones", price: 0 },
      { name: "Retiro de extensiones", price: 0 }
    ]
  },
  {
    id: "depilacion",
    name: "Depilación con Cera",
    description: "Piel suave y libre de vello.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    subservices: [
      { name: "Facial: Labio superior / Mentón", price: 0 },
      { name: "Facial: Cejas / Patillas", price: 0 },
      { name: "Corporal: Axilas", price: 0 },
      { name: "Corporal: Brazos (Medio/Completo)", price: 0 },
      { name: "Corporal: Piernas (Media/Completa)", price: 0 },
      { name: "Corporal: Abdomen / Espalda", price: 0 },
      { name: "Bikini Line", price: 0 },
      { name: "Bikini Brasileño", price: 0 },
      { name: "Íntima completa", price: 0 }
    ]
  },
  {
    id: "spa-bienestar",
    name: "Spa & Bienestar",
    description: "Relajación y cuidado corporal profundo.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    subservices: [
      { name: "Masaje relajante", price: 0 },
      { name: "Masaje descontracturante", price: 0 },
      { name: "Masaje reductivo / Linfático", price: 0 },
      { name: "Reflexología", price: 0 },
      { name: "Exfoliación corporal", price: 0 },
      { name: "Facial: Limpieza básica / Profunda", price: 0 },
      { name: "Facial: Hidratación / Anti-edad", price: 0 },
      { name: "Facial: Antiacné", price: 0 }
    ]
  },
  {
    id: "maquillaje",
    name: "Maquillaje Profesional",
    description: "Para toda ocasión, desde social hasta novias.",
    image: "https://images.unsplash.com/photo-1487412947132-28c5d9539d3c?auto=format&fit=crop&w=800&q=80",
    subservices: [
      { name: "Maquillaje de día", price: 0 },
      { name: "Maquillaje de noche / Glam", price: 0 },
      { name: "Maquillaje para fotos", price: 0 },
      { name: "Maquillaje artístico", price: 0 },
      { name: "Maquillaje de Novia", price: 0 },
      { name: "Prueba de Novia", price: 0 }
    ]
  },
  {
    id: "premium",
    name: "Servicios Premium",
    description: "Paquetes exclusivos y cambios de look.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    subservices: [
      { name: "Diseño de imagen capilar", price: 0 },
      { name: "Asesoría de colorimetría", price: 0 },
      { name: "Paquete Novia (Completo)", price: 0 },
      { name: "Paquetes de Eventos", price: 0 },
      { name: "Cambio de look total", price: 0 }
    ]
  }
];

// Función para subir todo de un golpe (Batch Write)
export const uploadServices = async () => {
  const batch = writeBatch(db);

  servicesData.forEach((service) => {
    const docRef = doc(db, "services", service.id);
    batch.set(docRef, service);
  });

  try {
    await batch.commit();
    console.log("¡Servicios cargados exitosamente!");
    alert("✅ Base de datos actualizada con todos los servicios.");
  } catch (error) {
    console.error("Error subiendo servicios:", error);
    alert("❌ Error: " + error.message);
  }
};

