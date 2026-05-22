/**
 * Layouts específicos de asientos por estadio
 *
 * Cada estadio tiene su propia forma, distribución y nombres de secciones.
 * Se mapea por nombre de estadio o un tipo de layout.
 */

export type LayoutType = 'NFL' | 'SOCCER_LATIN' | 'MLS' | 'DOME' | 'OVAL_LARGE';

export interface SectionDef {
  id: string;
  label: string;
  category: 'VIP' | 'PREMIUM' | 'TRIBUNA' | 'GENERAL';
  capacityPct: number; // % de la capacidad total
  priceMin: number;
  priceMax: number;
  rows: number;
  status: 'available' | 'few' | 'soldout';
  // SVG path coords (relative to viewBox 600x400)
  path: string;
  labelX: number;
  labelY: number;
}

export interface StadiumLayout {
  type: LayoutType;
  shapeDesc: string; // brief describing the shape
  fieldShape: 'soccer-rect' | 'nfl' | 'oval';
  /** Path para el contorno externo del estadio (decorativo) */
  outline?: string;
  sections: SectionDef[];
}

// ─── NFL LAYOUT (Rectangular, 3 niveles: Lower / Club / Upper) ──────────────
// AT&T, MetLife, NRG, Gillette, Hard Rock, Lincoln Financial, Levi's, Lumen, SoFi, Arrowhead
const NFL_LAYOUT: StadiumLayout = {
  type: 'NFL',
  shapeDesc: 'Bowl rectangular tipo NFL · 3 niveles',
  fieldShape: 'nfl',
  outline:
    'M 80 60 Q 80 30 110 30 L 490 30 Q 520 30 520 60 L 520 340 Q 520 370 490 370 L 110 370 Q 80 370 80 340 Z',
  sections: [
    // ── VIP — Club Suites (palcos privados arriba)
    {
      id: 'suite-norte',
      label: 'CLUB SUITES N',
      category: 'VIP',
      capacityPct: 3,
      priceMin: 1200,
      priceMax: 2500,
      rows: 4,
      status: 'few',
      path: 'M 220 40 L 380 40 L 370 70 L 230 70 Z',
      labelX: 300,
      labelY: 57,
    },
    {
      id: 'suite-sur',
      label: 'CLUB SUITES S',
      category: 'VIP',
      capacityPct: 2,
      priceMin: 1200,
      priceMax: 2500,
      rows: 4,
      status: 'soldout',
      path: 'M 230 330 L 370 330 L 380 360 L 220 360 Z',
      labelX: 300,
      labelY: 347,
    },
    // ── PREMIUM — Club Level (laterales bajos)
    {
      id: 'club-este',
      label: 'CLUB LEVEL E',
      category: 'PREMIUM',
      capacityPct: 8,
      priceMin: 550,
      priceMax: 900,
      rows: 14,
      status: 'available',
      path: 'M 440 100 L 500 130 L 500 270 L 440 300 Z',
      labelX: 470,
      labelY: 200,
    },
    {
      id: 'club-oeste',
      label: 'CLUB LEVEL W',
      category: 'PREMIUM',
      capacityPct: 8,
      priceMin: 550,
      priceMax: 900,
      rows: 14,
      status: 'available',
      path: 'M 100 130 L 160 100 L 160 300 L 100 270 Z',
      labelX: 130,
      labelY: 200,
    },
    // ── TRIBUNA — Lower Bowl (filas 100s)
    {
      id: 'lower-norte',
      label: 'SECTION 100s N',
      category: 'TRIBUNA',
      capacityPct: 14,
      priceMin: 220,
      priceMax: 420,
      rows: 22,
      status: 'available',
      path: 'M 160 70 L 440 70 L 440 100 L 160 100 Z',
      labelX: 300,
      labelY: 87,
    },
    {
      id: 'lower-sur',
      label: 'SECTION 100s S',
      category: 'TRIBUNA',
      capacityPct: 14,
      priceMin: 220,
      priceMax: 420,
      rows: 22,
      status: 'few',
      path: 'M 160 300 L 440 300 L 440 330 L 160 330 Z',
      labelX: 300,
      labelY: 317,
    },
    {
      id: 'lower-end-norte',
      label: 'END ZONE N',
      category: 'TRIBUNA',
      capacityPct: 6,
      priceMin: 180,
      priceMax: 320,
      rows: 18,
      status: 'available',
      path: 'M 160 100 L 220 70 L 220 100 Z M 380 70 L 440 100 L 380 100 Z',
      labelX: 200,
      labelY: 92,
    },
    // ── GENERAL — Upper Deck (filas 300s)
    {
      id: 'upper-norte',
      label: 'UPPER 300s N',
      category: 'GENERAL',
      capacityPct: 15,
      priceMin: 90,
      priceMax: 170,
      rows: 32,
      status: 'available',
      path: 'M 100 40 L 500 40 L 520 70 L 80 70 Z',
      labelX: 300,
      labelY: 55,
    },
    {
      id: 'upper-sur',
      label: 'UPPER 300s S',
      category: 'GENERAL',
      capacityPct: 15,
      priceMin: 90,
      priceMax: 170,
      rows: 32,
      status: 'available',
      path: 'M 80 330 L 520 330 L 500 360 L 100 360 Z',
      labelX: 300,
      labelY: 347,
    },
    {
      id: 'upper-este',
      label: 'UPPER E',
      category: 'GENERAL',
      capacityPct: 7.5,
      priceMin: 90,
      priceMax: 170,
      rows: 28,
      status: 'few',
      path: 'M 500 70 L 540 130 L 540 270 L 500 330 Z',
      labelX: 520,
      labelY: 200,
    },
    {
      id: 'upper-oeste',
      label: 'UPPER W',
      category: 'GENERAL',
      capacityPct: 7.5,
      priceMin: 90,
      priceMax: 170,
      rows: 28,
      status: 'available',
      path: 'M 60 130 L 100 70 L 100 330 L 60 270 Z',
      labelX: 80,
      labelY: 200,
    },
  ],
};

// ─── SOCCER LATIN (Ovalado/elíptico tipo Azteca) ────────────────────────────
// Estadio Azteca, Estadio Akron, Estadio BBVA
const SOCCER_LATIN_LAYOUT: StadiumLayout = {
  type: 'SOCCER_LATIN',
  shapeDesc: 'Estadio ovalado · Norte/Sur con porterías · Oriente/Poniente con palcos',
  fieldShape: 'soccer-rect',
  outline:
    'M 300 30 C 480 30 560 130 560 200 C 560 270 480 370 300 370 C 120 370 40 270 40 200 C 40 130 120 30 300 30 Z',
  sections: [
    // ── VIP — Palcos Centrales (oriente)
    {
      id: 'palco-oriente',
      label: 'PALCOS ORIENTE',
      category: 'VIP',
      capacityPct: 4,
      priceMin: 1000,
      priceMax: 2200,
      rows: 6,
      status: 'few',
      path: 'M 440 160 Q 480 200 440 240 L 410 235 Q 440 200 410 165 Z',
      labelX: 442,
      labelY: 200,
    },
    {
      id: 'palco-poniente',
      label: 'PALCOS PONIENTE',
      category: 'VIP',
      capacityPct: 3,
      priceMin: 1000,
      priceMax: 2200,
      rows: 6,
      status: 'soldout',
      path: 'M 160 160 Q 120 200 160 240 L 190 235 Q 160 200 190 165 Z',
      labelX: 158,
      labelY: 200,
    },
    // ── PREMIUM — Preferente Oriente/Poniente
    {
      id: 'pref-oriente',
      label: 'PREFERENTE ORIENTE',
      category: 'PREMIUM',
      capacityPct: 10,
      priceMin: 500,
      priceMax: 850,
      rows: 18,
      status: 'available',
      path: 'M 410 100 Q 470 110 500 150 L 480 175 Q 460 145 410 145 Z M 410 255 Q 460 255 480 225 L 500 250 Q 470 290 410 300 Z',
      labelX: 460,
      labelY: 130,
    },
    {
      id: 'pref-poniente',
      label: 'PREFERENTE PONIENTE',
      category: 'PREMIUM',
      capacityPct: 10,
      priceMin: 500,
      priceMax: 850,
      rows: 18,
      status: 'available',
      path: 'M 190 100 Q 130 110 100 150 L 120 175 Q 140 145 190 145 Z M 190 255 Q 140 255 120 225 L 100 250 Q 130 290 190 300 Z',
      labelX: 140,
      labelY: 130,
    },
    // ── TRIBUNA — General Norte/Sur (cabeceras)
    {
      id: 'cabecera-norte',
      label: 'CABECERA NORTE',
      category: 'TRIBUNA',
      capacityPct: 18,
      priceMin: 180,
      priceMax: 380,
      rows: 30,
      status: 'available',
      path: 'M 200 60 Q 300 40 400 60 L 410 100 Q 300 80 190 100 Z',
      labelX: 300,
      labelY: 80,
    },
    {
      id: 'cabecera-sur',
      label: 'CABECERA SUR',
      category: 'TRIBUNA',
      capacityPct: 18,
      priceMin: 180,
      priceMax: 380,
      rows: 30,
      status: 'few',
      path: 'M 190 300 Q 300 320 410 300 L 400 340 Q 300 360 200 340 Z',
      labelX: 300,
      labelY: 325,
    },
    // ── GENERAL — Alta Norte/Sur/Oriente/Poniente
    {
      id: 'alta-norte',
      label: 'ALTA NORTE',
      category: 'GENERAL',
      capacityPct: 10,
      priceMin: 80,
      priceMax: 150,
      rows: 28,
      status: 'available',
      path: 'M 180 30 Q 300 10 420 30 L 400 60 Q 300 40 200 60 Z',
      labelX: 300,
      labelY: 45,
    },
    {
      id: 'alta-sur',
      label: 'ALTA SUR',
      category: 'GENERAL',
      capacityPct: 10,
      priceMin: 80,
      priceMax: 150,
      rows: 28,
      status: 'available',
      path: 'M 200 340 Q 300 360 400 340 L 420 370 Q 300 390 180 370 Z',
      labelX: 300,
      labelY: 355,
    },
    {
      id: 'alta-oriente',
      label: 'ALTA ORIENTE',
      category: 'GENERAL',
      capacityPct: 8.5,
      priceMin: 80,
      priceMax: 150,
      rows: 30,
      status: 'few',
      path: 'M 500 150 Q 560 200 500 250 L 480 225 Q 530 200 480 175 Z',
      labelX: 520,
      labelY: 200,
    },
    {
      id: 'alta-poniente',
      label: 'ALTA PONIENTE',
      category: 'GENERAL',
      capacityPct: 8.5,
      priceMin: 80,
      priceMax: 150,
      rows: 30,
      status: 'available',
      path: 'M 100 150 Q 40 200 100 250 L 120 225 Q 70 200 120 175 Z',
      labelX: 80,
      labelY: 200,
    },
  ],
};

// ─── MLS / SOCCER-ESPECÍFICO (más íntimo, 2 niveles) ────────────────────────
// BMO Field (Toronto), Mercedes-Benz (configuración soccer)
const MLS_LAYOUT: StadiumLayout = {
  type: 'MLS',
  shapeDesc: 'Estadio soccer compacto · 2 niveles · Supporters Section',
  fieldShape: 'soccer-rect',
  outline:
    'M 100 80 Q 100 50 130 50 L 470 50 Q 500 50 500 80 L 500 320 Q 500 350 470 350 L 130 350 Q 100 350 100 320 Z',
  sections: [
    // ── VIP — President's Club
    {
      id: 'presidents-club',
      label: "PRESIDENT'S CLUB",
      category: 'VIP',
      capacityPct: 4,
      priceMin: 900,
      priceMax: 1800,
      rows: 5,
      status: 'few',
      path: 'M 250 60 L 350 60 L 340 85 L 260 85 Z',
      labelX: 300,
      labelY: 73,
    },
    // ── PREMIUM — Field Club & West Stand Premium
    {
      id: 'field-club',
      label: 'FIELD CLUB',
      category: 'PREMIUM',
      capacityPct: 12,
      priceMin: 480,
      priceMax: 780,
      rows: 12,
      status: 'available',
      path: 'M 130 200 L 100 230 L 100 280 L 130 290 Z M 470 200 L 500 230 L 500 280 L 470 290 Z',
      labelX: 115,
      labelY: 245,
    },
    {
      id: 'west-stand-premium',
      label: 'WEST PREMIUM',
      category: 'PREMIUM',
      capacityPct: 10,
      priceMin: 380,
      priceMax: 620,
      rows: 16,
      status: 'available',
      path: 'M 100 100 L 130 130 L 130 270 L 100 230 Z',
      labelX: 115,
      labelY: 185,
    },
    // ── TRIBUNA — East Stand / Center Sideline
    {
      id: 'east-stand',
      label: 'EAST STAND',
      category: 'TRIBUNA',
      capacityPct: 22,
      priceMin: 200,
      priceMax: 380,
      rows: 24,
      status: 'available',
      path: 'M 470 100 L 500 130 L 500 270 L 470 270 Z',
      labelX: 485,
      labelY: 185,
    },
    {
      id: 'north-end',
      label: 'NORTH END',
      category: 'TRIBUNA',
      capacityPct: 16,
      priceMin: 180,
      priceMax: 350,
      rows: 22,
      status: 'few',
      path: 'M 130 85 L 470 85 L 470 130 L 130 130 Z',
      labelX: 300,
      labelY: 107,
    },
    // ── GENERAL — Supporters Section & General Admission
    {
      id: 'supporters',
      label: 'SUPPORTERS 🚩',
      category: 'GENERAL',
      capacityPct: 12,
      priceMin: 70,
      priceMax: 130,
      rows: 28,
      status: 'soldout',
      path: 'M 130 290 L 470 290 L 470 330 L 130 330 Z',
      labelX: 300,
      labelY: 310,
    },
    {
      id: 'general-upper',
      label: 'GENERAL UPPER',
      category: 'GENERAL',
      capacityPct: 24,
      priceMin: 60,
      priceMax: 110,
      rows: 18,
      status: 'available',
      path: 'M 100 50 L 500 50 L 500 100 L 100 100 Z M 100 330 L 500 330 L 500 380 L 100 380 Z',
      labelX: 300,
      labelY: 75,
    },
  ],
};

// ─── DOME / MULTIPURPOSE (BC Place - techo retráctil) ───────────────────────
const DOME_LAYOUT: StadiumLayout = {
  type: 'DOME',
  shapeDesc: 'Estadio con techo retráctil · Forma circular cerrada',
  fieldShape: 'soccer-rect',
  outline:
    'M 300 30 C 480 30 560 130 560 200 C 560 270 480 370 300 370 C 120 370 40 270 40 200 C 40 130 120 30 300 30 Z',
  sections: [
    {
      id: 'dome-vip',
      label: 'VIP BOXES',
      category: 'VIP',
      capacityPct: 5,
      priceMin: 950,
      priceMax: 1900,
      rows: 6,
      status: 'few',
      path: 'M 240 60 L 360 60 L 350 90 L 250 90 Z',
      labelX: 300,
      labelY: 76,
    },
    {
      id: 'dome-club-east',
      label: 'CLUB EAST',
      category: 'PREMIUM',
      capacityPct: 12,
      priceMin: 480,
      priceMax: 800,
      rows: 14,
      status: 'available',
      path: 'M 420 120 Q 480 140 490 200 Q 480 260 420 280 L 405 250 Q 455 230 460 200 Q 455 170 405 150 Z',
      labelX: 450,
      labelY: 200,
    },
    {
      id: 'dome-club-west',
      label: 'CLUB WEST',
      category: 'PREMIUM',
      capacityPct: 12,
      priceMin: 480,
      priceMax: 800,
      rows: 14,
      status: 'available',
      path: 'M 180 120 Q 120 140 110 200 Q 120 260 180 280 L 195 250 Q 145 230 140 200 Q 145 170 195 150 Z',
      labelX: 150,
      labelY: 200,
    },
    {
      id: 'dome-lower-n',
      label: 'LOWER NORTH',
      category: 'TRIBUNA',
      capacityPct: 18,
      priceMin: 240,
      priceMax: 420,
      rows: 22,
      status: 'available',
      path: 'M 180 90 L 420 90 L 405 150 Q 300 130 195 150 Z',
      labelX: 300,
      labelY: 115,
    },
    {
      id: 'dome-lower-s',
      label: 'LOWER SOUTH',
      category: 'TRIBUNA',
      capacityPct: 18,
      priceMin: 240,
      priceMax: 420,
      rows: 22,
      status: 'few',
      path: 'M 195 250 Q 300 270 405 250 L 420 310 L 180 310 Z',
      labelX: 300,
      labelY: 285,
    },
    {
      id: 'dome-upper-n',
      label: 'UPPER NORTH',
      category: 'GENERAL',
      capacityPct: 12.5,
      priceMin: 90,
      priceMax: 180,
      rows: 28,
      status: 'available',
      path: 'M 130 60 L 470 60 L 420 90 L 180 90 Z',
      labelX: 300,
      labelY: 78,
    },
    {
      id: 'dome-upper-s',
      label: 'UPPER SOUTH',
      category: 'GENERAL',
      capacityPct: 12.5,
      priceMin: 90,
      priceMax: 180,
      rows: 28,
      status: 'available',
      path: 'M 180 310 L 420 310 L 470 340 L 130 340 Z',
      labelX: 300,
      labelY: 325,
    },
    {
      id: 'dome-endzone-e',
      label: 'END E',
      category: 'GENERAL',
      capacityPct: 5,
      priceMin: 90,
      priceMax: 180,
      rows: 32,
      status: 'available',
      path: 'M 490 200 Q 560 200 470 60 L 470 340 Q 560 200 490 200 Z',
      labelX: 520,
      labelY: 200,
    },
    {
      id: 'dome-endzone-w',
      label: 'END W',
      category: 'GENERAL',
      capacityPct: 5,
      priceMin: 90,
      priceMax: 180,
      rows: 32,
      status: 'available',
      path: 'M 110 200 Q 40 200 130 60 L 130 340 Q 40 200 110 200 Z',
      labelX: 80,
      labelY: 200,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Mapping: stadium name → layout
// ─────────────────────────────────────────────────────────────────────────

const STADIUM_LAYOUT_MAP: Record<string, StadiumLayout> = {
  // NFL stadiums
  'AT&T Stadium': NFL_LAYOUT,
  'NRG Stadium': NFL_LAYOUT,
  'Gillette Stadium': NFL_LAYOUT,
  'Hard Rock Stadium': NFL_LAYOUT,
  'Lincoln Financial Field': NFL_LAYOUT,
  "Levi's Stadium": NFL_LAYOUT,
  'Lumen Field': NFL_LAYOUT,
  'SoFi Stadium': NFL_LAYOUT,
  'Arrowhead Stadium': NFL_LAYOUT,
  'MetLife Stadium': NFL_LAYOUT,

  // MLS / Soccer-specific
  'Mercedes-Benz Stadium': MLS_LAYOUT,
  'BMO Field': MLS_LAYOUT,

  // Dome / Multipurpose
  'BC Place': DOME_LAYOUT,

  // Soccer Latin (México)
  'Estadio Azteca': SOCCER_LATIN_LAYOUT,
  'Estadio Akron': SOCCER_LATIN_LAYOUT,
  'Estadio BBVA': SOCCER_LATIN_LAYOUT,
};

export function getLayoutForStadium(nombre: string): StadiumLayout {
  return STADIUM_LAYOUT_MAP[nombre] ?? NFL_LAYOUT;
}
