import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EstadioApi } from '../../types';
import { getLayoutForStadium, type SectionDef } from '../../data/stadiumLayouts';

/**
 * Guía informativa de asientos del estadio
 *
 * Cada estadio tiene su PROPIO layout específico (NFL, Soccer Latino, MLS, Dome).
 * Esta vista es solo informativa: muestra cómo está distribuido el estadio.
 */

interface Section extends Omit<SectionDef, 'capacityPct' | 'priceMin' | 'priceMax' | 'status'> {
  capacity: number;
}

const CATEGORY_COLORS: Record<Section['category'], { fill: string; stroke: string }> = {
  VIP: { fill: '#fbbf24', stroke: '#d97706' }, // gold
  PREMIUM: { fill: '#a78bfa', stroke: '#7c3aed' }, // purple
  TRIBUNA: { fill: '#60a5fa', stroke: '#2563eb' }, // blue
  GENERAL: { fill: '#34d399', stroke: '#059669' }, // green
};

// Descriptions and layout labels are resolved inside the component using t()

export function StadiumSeatMap({ stadium }: { stadium: EstadioApi }) {
  const { t } = useTranslation();
  const layout = useMemo(() => getLayoutForStadium(stadium.nombre), [stadium.nombre]);

  const CATEGORY_DESCRIPTIONS: Record<Section['category'], string> = {
    VIP: t('stadiums.categoryVip'),
    PREMIUM: t('stadiums.categoryPremium'),
    TRIBUNA: t('stadiums.categoryTribuna'),
    GENERAL: t('stadiums.categoryGeneral'),
  };

  const LAYOUT_LABELS: Record<string, string> = {
    NFL: t('stadiums.layoutNfl'),
    SOCCER_LATIN: t('stadiums.layoutSoccerLatin'),
    MLS: t('stadiums.layoutMls'),
    DOME: t('stadiums.layoutDome'),
    OVAL_LARGE: t('stadiums.layoutOvalLarge'),
  };

  // Convert layout sections to actual sections with real capacity values
  const sections: Section[] = useMemo(
    () =>
      layout.sections.map((s) => ({
        id: s.id,
        label: s.label,
        category: s.category,
        rows: s.rows,
        path: s.path,
        labelX: s.labelX,
        labelY: s.labelY,
        capacity: Math.round((stadium.capacidad * s.capacityPct) / 100),
      })),
    [layout, stadium.capacidad],
  );

  // Track selection alongside its stadium id so we can derive the displayed
  // section without a side-effect setState (avoids react-hooks/set-state-in-effect).
  const [selectedInfo, setSelectedInfo] = useState<{
    stadiumId: number;
    section: Section;
  } | null>(null);
  const selected = selectedInfo?.stadiumId === stadium.id ? selectedInfo.section : null;

  const [hovered, setHovered] = useState<string | null>(null);

  // Render the field based on layout type
  const renderField = () => {
    if (layout.fieldShape === 'nfl') {
      return (
        <g>
          <rect
            x="210"
            y="155"
            width="180"
            height="90"
            rx="2"
            fill="#16a34a"
            stroke="#fff"
            strokeWidth="1.5"
          />
          <rect x="210" y="155" width="25" height="90" fill="#0d6b34" opacity="0.7" />
          <rect x="365" y="155" width="25" height="90" fill="#0d6b34" opacity="0.7" />
          {[260, 285, 310, 335].map((x) => (
            <line
              key={x}
              x1={x}
              y1="155"
              x2={x}
              y2="245"
              stroke="#fff"
              strokeWidth="0.7"
              opacity="0.7"
            />
          ))}
          <line x1="300" y1="155" x2="300" y2="245" stroke="#fff" strokeWidth="1.2" />
        </g>
      );
    }

    return (
      <g>
        <rect
          x="225"
          y="155"
          width="150"
          height="90"
          rx="4"
          fill="#16a34a"
          stroke="#fff"
          strokeWidth="1.5"
        />
        <line x1="300" y1="155" x2="300" y2="245" stroke="#fff" strokeWidth="1.2" opacity="0.85" />
        <circle
          cx="300"
          cy="200"
          r="14"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
          opacity="0.85"
        />
        <circle cx="300" cy="200" r="1.5" fill="#fff" />
        <rect x="225" y="180" width="18" height="40" fill="none" stroke="#fff" strokeWidth="1.2" />
        <rect x="357" y="180" width="18" height="40" fill="none" stroke="#fff" strokeWidth="1.2" />
        <rect x="221" y="190" width="4" height="20" fill="#fff" opacity="0.85" />
        <rect x="375" y="190" width="4" height="20" fill="#fff" opacity="0.85" />
      </g>
    );
  };

  // Summarize total capacity by category
  const totalByCategory = useMemo(() => {
    const acc: Record<string, number> = {};
    sections.forEach((s) => {
      acc[s.category] = (acc[s.category] ?? 0) + s.capacity;
    });
    return acc;
  }, [sections]);

  return (
    <div className="glass rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-headline text-lg md:text-xl font-bold text-text-primary">
            📐 {t('stadiums.seatGuide')} — {stadium.nombre}
          </h3>
          <p className="text-text-muted text-xs md:text-sm">
            {LAYOUT_LABELS[layout.type] ?? layout.shapeDesc} • {stadium.capacidad.toLocaleString()}{' '}
            {t('stadiums.seats')}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs">
          {(Object.keys(CATEGORY_COLORS) as Section['category'][]).map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: CATEGORY_COLORS[cat].fill,
                  borderColor: CATEGORY_COLORS[cat].stroke,
                  borderWidth: 1,
                }}
              />
              <span className="text-text-secondary font-medium">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Stadium Map */}
        <div className="lg:col-span-2">
          <div className="relative aspect-[3/2] bg-bg-elevated rounded-xl overflow-hidden border border-border">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-full"
              style={{
                background: 'radial-gradient(ellipse at center, #1a1f2e 0%, #0d1117 100%)',
              }}
            >
              {layout.outline && (
                <path
                  d={layout.outline}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="2"
                />
              )}

              {renderField()}

              {sections.map((s) => {
                const color = CATEGORY_COLORS[s.category];
                const isHovered = hovered === s.id;
                const isSelected = selected?.id === s.id;
                return (
                  <g key={s.id}>
                    <path
                      d={s.path}
                      fill={color.fill}
                      stroke={isSelected ? '#fff' : color.stroke}
                      strokeWidth={isSelected ? 3 : 1.5}
                      opacity={isHovered ? 1 : 0.85}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={() => setHovered(s.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelectedInfo({ stadiumId: stadium.id, section: s })}
                    />
                    <text
                      x={s.labelX}
                      y={s.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="7"
                      fontWeight="700"
                      fill="#fff"
                      style={{
                        pointerEvents: 'none',
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                      }}
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}

              <g transform="translate(560, 30)">
                <circle
                  cx="0"
                  cy="0"
                  r="14"
                  fill="rgba(255,255,255,0.1)"
                  stroke="#fff"
                  strokeWidth="0.8"
                />
                <text x="0" y="-4" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">
                  N
                </text>
                <text x="0" y="10" textAnchor="middle" fontSize="6" fill="#fff" opacity="0.6">
                  S
                </text>
              </g>
              <g transform="translate(20, 380)">
                <rect
                  x="0"
                  y="-12"
                  width="80"
                  height="16"
                  rx="3"
                  fill="rgba(0,0,0,0.6)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                />
                <text x="40" y="0" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="600">
                  {layout.type}
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Section Info Panel */}
        <div className="flex flex-col gap-3">
          {selected ? (
            <div className="glass rounded-xl p-4 border-2 border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[selected.category].stroke }}
                >
                  {selected.category}
                </span>
              </div>
              <h4 className="font-headline text-lg font-bold text-text-primary mb-2">
                {selected.label}
              </h4>
              <p className="text-xs text-text-muted mb-3">
                {CATEGORY_DESCRIPTIONS[selected.category]}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('stadiums.estimatedCapacity')}:</span>
                  <span className="font-bold text-text-primary">
                    {selected.capacity.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('stadiums.rows')}:</span>
                  <span className="font-bold text-text-primary">{selected.rows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t('stadiums.seatsPerRow')}:</span>
                  <span className="font-bold text-text-primary">
                    ~{Math.round(selected.capacity / selected.rows)}
                  </span>
                </div>
              </div>

              {/* Visual rows */}
              <div className="mt-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  {t('stadiums.distributionView')}
                </p>
                <div className="space-y-1">
                  {Array.from({ length: Math.min(selected.rows, 8) }).map((_, i) => {
                    const seatsInRow = Math.min(
                      Math.round(selected.capacity / selected.rows / 4),
                      20,
                    );
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-[9px] text-text-muted w-4">{i + 1}</span>
                        <div className="flex-1 flex gap-0.5">
                          {Array.from({ length: seatsInRow }).map((__, j) => (
                            <div
                              key={j}
                              className="flex-1 h-2 rounded-sm"
                              style={{
                                backgroundColor: CATEGORY_COLORS[selected.category].fill,
                                opacity: 0.75,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {selected.rows > 8 && (
                    <p className="text-[9px] text-text-muted text-center pt-1">
                      {t('stadiums.moreRows', { n: selected.rows - 8 })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-4 text-center text-sm text-text-muted">
              <div className="text-4xl mb-2">📐</div>
              <p className="font-semibold text-text-primary mb-1">{layout.shapeDesc}</p>
              <p className="text-xs">{t('stadiums.clickSection')}</p>
            </div>
          )}

          {/* Summary chips */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(totalByCategory).map(([cat, total]) => (
              <div key={cat} className="glass rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: CATEGORY_COLORS[cat as Section['category']].fill,
                    }}
                  />
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{cat}</p>
                </div>
                <p className="text-sm font-bold text-text-primary">
                  {total.toLocaleString('es-CO')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
