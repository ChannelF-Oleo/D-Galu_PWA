// src/utils/seedProducts.js
import { db } from "../config/firebase";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";

// Productos para D'Galú
const productsData = [
  {
    id: "esmalte-rojo-clasico",
    name: "Esmalte Rojo Clásico",
    description: "Esmalte de uñas de larga duración en color rojo intenso. Fórmula libre de tóxicos.",
    category: "esmaltes",
    price: 15.99,
    sku: "ESM-ROJ-001",
    stock: 25,
    minStock: 5,
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: true,
    tags: ["esmalte", "rojo", "larga duración", "libre de tóxicos"],
    specifications: {
      brand: "D'Galú Professional",
      volume: "15ml",
      finish: "Brillante",
      dryingTime: "2-3 minutos"
    }
  },
  {
    id: "kit-manicura-completo",
    name: "Kit de Manicura Completo",
    description: "Kit profesional con todo lo necesario para una manicura perfecta en casa.",
    category: "kits",
    price: 45.99,
    sku: "KIT-MAN-001",
    stock: 15,
    minStock: 3,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: true,
    tags: ["kit", "manicura", "profesional", "completo"],
    specifications: {
      brand: "D'Galú Professional",
      includes: "Lima, cortauñas, empujador de cutícula, aceite nutritivo",
      material: "Acero inoxidable"
    }
  },
  {
    id: "crema-manos-hidratante",
    name: "Crema Hidratante para Manos",
    description: "Crema nutritiva con manteca de karité y vitamina E para manos suaves y protegidas.",
    category: "cuidado",
    price: 12.99,
    sku: "CRE-MAN-001",
    stock: 30,
    minStock: 8,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: false,
    tags: ["crema", "hidratante", "manos", "karité", "vitamina E"],
    specifications: {
      brand: "D'Galú Care",
      volume: "100ml",
      ingredients: "Manteca de karité, Vitamina E, Aloe vera",
      skinType: "Todo tipo de piel"
    }
  },
  {
    id: "aceite-cuticulas-nutritivo",
    name: "Aceite Nutritivo para Cutículas",
    description: "Aceite especial para nutrir y suavizar las cutículas, con aroma a lavanda.",
    category: "cuidado",
    price: 8.99,
    sku: "ACE-CUT-001",
    stock: 20,
    minStock: 5,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: false,
    tags: ["aceite", "cutículas", "nutritivo", "lavanda"],
    specifications: {
      brand: "D'Galú Care",
      volume: "15ml",
      scent: "Lavanda",
      application: "Con pincel aplicador"
    }
  },
  {
    id: "base-coat-fortalecedora",
    name: "Base Coat Fortalecedora",
    description: "Base fortalecedora que protege y prepara las uñas para el esmaltado.",
    category: "esmaltes",
    price: 13.99,
    sku: "BAS-FOR-001",
    stock: 18,
    minStock: 4,
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: false,
    tags: ["base", "fortalecedora", "protección", "preparación"],
    specifications: {
      brand: "D'Galú Professional",
      volume: "15ml",
      benefits: "Fortalece, protege, mejora adherencia",
      dryingTime: "1-2 minutos"
    }
  },
  {
    id: "top-coat-brillo-extremo",
    name: "Top Coat Brillo Extremo",
    description: "Acabado final con brillo intenso y protección UV para un esmaltado duradero.",
    category: "esmaltes",
    price: 14.99,
    sku: "TOP-BRI-001",
    stock: 22,
    minStock: 5,
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: true,
    tags: ["top coat", "brillo", "protección UV", "duradero"],
    specifications: {
      brand: "D'Galú Professional",
      volume: "15ml",
      finish: "Brillo extremo",
      protection: "UV y desgaste"
    }
  },
  {
    id: "removedor-esmalte-sin-acetona",
    name: "Removedor de Esmalte Sin Acetona",
    description: "Removedor suave sin acetona, enriquecido con vitamina E para cuidar las uñas.",
    category: "cuidado",
    price: 9.99,
    sku: "REM-SIN-001",
    stock: 35,
    minStock: 10,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: false,
    tags: ["removedor", "sin acetona", "suave", "vitamina E"],
    specifications: {
      brand: "D'Galú Care",
      volume: "250ml",
      formula: "Sin acetona",
      enriched: "Vitamina E y aloe vera"
    }
  },
  {
    id: "set-limas-profesionales",
    name: "Set de Limas Profesionales",
    description: "Juego de 5 limas de diferentes granos para el cuidado profesional de las uñas.",
    category: "herramientas",
    price: 19.99,
    sku: "LIM-PRO-001",
    stock: 12,
    minStock: 3,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    featured: false,
    tags: ["limas", "profesionales", "set", "diferentes granos"],
    specifications: {
      brand: "D'Galú Professional",
      quantity: "5 limas",
      grits: "100/180, 180/240, 240/320",
      material: "Cristal templado"
    }
  }
];

// Función para subir productos
export const uploadProducts = async () => {
  const batch = writeBatch(db);

  productsData.forEach((product) => {
    const docRef = doc(db, "products", product.id);
    
    // Agregar campos adicionales necesarios
    const productData = {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      sales: 0,
      rating: 0,
      reviews: 0
    };
    
    batch.set(docRef, productData);
  });

  try {
    await batch.commit();
    console.log("¡Productos cargados exitosamente!");
    return { success: true, message: "✅ Catálogo de productos creado correctamente." };
  } catch (error) {
    console.error("Error subiendo productos:", error);
    throw new Error(`Error subiendo productos: ${error.message}`);
  }
};