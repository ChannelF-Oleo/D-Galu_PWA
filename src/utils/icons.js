// Lucide icons
import {
  Calendar,
  Layers3,
  Zap,
  Handshake as HeartHandshake,
  Star,
  ArrowRight,
  ShoppingBag,
  GraduationCap,
} from "lucide-react";

// Iconify renderer
import { Icon } from "@iconify/react";

// ----------------------------
// Export final
// ----------------------------
export const icons = {
  // --- Lucide Icons ---
  Calendar,
  Layers3,
  Zap,
  HeartHandshake,
  Star,
  ArrowRight,
  ShoppingBag,
  GraduationCap,

  // --- Iconify Icons ---
  // Se usan los "String IDs". El componente <Icon /> los descarga automáticamente
  // o los usa si tienes el bundle configurado.
  Iconify: {
    // MDI (Material Design Icons)
    hairSalon: "mdi:content-cut",
    hairDryer: "mdi:hair-dryer",
    nailPolish: "mdi:nail-polish",
    razor: "mdi:razor-electric",

    // Fluent UI
    eyebrow: "fluent:eye-20-filled",

    // Material Symbols / Otros para pestañas
    // Nota: 'eyelashes' no existe como tal en Material Symbols estándar.
    // 'icon-park-outline:eyelash' es la mejor opción visual para pestañas.
    // Si prefieres Material Symbols estricto, usa 'material-symbols:visibility'.
    eyelashes: "icon-park-outline:eyelash",

    // Healthicons
    spa: "healthicons:spa", // o "healthicons:spa-outline"

    // 'massage' específico a veces no existe en el set básico,
    // 'tabler:massage' es muy claro, o 'healthicons:physical-therapy'
    massage: "tabler:massage",
  },
};

export { Icon };
