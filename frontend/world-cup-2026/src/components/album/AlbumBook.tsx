import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LaminaAlbumResponse } from '../../services/albumApi';
import { StickerCardFlip } from './StickerCardFlip';

const RARITY_ORDER = ['LEGENDARIO', 'EPICO', 'RARO', 'COMUN'] as const;
type Rarity = (typeof RARITY_ORDER)[number];
const RARITY_INDEX: Record<Rarity, number> = { LEGENDARIO: 0, EPICO: 1, RARO: 2, COMUN: 3 };
const CARDS_PER_PAGE = 6;

interface Props {
  laminas: LaminaAlbumResponse[];
  onPegar: (id: number) => void;
}

export function AlbumBook({ laminas, onPegar }: Props) {
  const [page, setPage] = useState(0);
  const [filterRarity, setFilterRarity] = useState<string>('ALL');

  const filtered =
    filterRarity === 'ALL'
      ? [...laminas].sort(
          (a, b) =>
            (RARITY_INDEX[a.rareza as Rarity] ?? 99) - (RARITY_INDEX[b.rareza as Rarity] ?? 99),
        )
      : laminas.filter((l) => l.rareza === filterRarity);

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const currentSlice = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const changeFilter = (r: string) => {
    setFilterRarity(r);
    setPage(0);
  };

  const obtenidas = laminas.length;
  const pegadas = laminas.filter((l) => l.estaPegada).length;
  const especiales = laminas.filter(
    (l) => l.rareza === 'EPICO' || l.rareza === 'LEGENDARIO',
  ).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats tray */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Obtenidas', value: obtenidas },
          { label: 'Pegadas', value: pegadas },
          { label: 'Especiales', value: especiales },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-bg-surface border border-border rounded-xl p-3 text-center"
          >
            <div className="font-headline text-2xl font-extrabold text-primary">{value}</div>
            <div className="text-xs text-text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Rarity filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...RARITY_ORDER].map((r) => (
          <button
            key={r}
            onClick={() => changeFilter(r)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              filterRarity === r
                ? 'bg-primary text-white border-primary'
                : 'bg-bg-surface text-text-muted border-border hover:border-primary/50'
            }`}
          >
            {r === 'ALL'
              ? 'Todas'
              : r === 'COMUN'
                ? 'Común'
                : r === 'RARO'
                  ? 'Raro'
                  : r === 'EPICO'
                    ? 'Épico'
                    : 'Legendario'}
          </button>
        ))}
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          No tienes figuritas {filterRarity !== 'ALL' ? `de rareza ${filterRarity}` : ''} todavía.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 justify-items-center min-h-[160px]">
            {currentSlice.map((l) => (
              <StickerCardFlip key={l.idLamina} lamina={l} size="sm" onPegar={onPegar} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-2">
              <button
                onClick={goPrev}
                disabled={page === 0}
                className="p-2 rounded-lg border border-border text-text-muted disabled:opacity-30 hover:bg-bg-hover transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-muted">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={goNext}
                disabled={page === totalPages - 1}
                className="p-2 rounded-lg border border-border text-text-muted disabled:opacity-30 hover:bg-bg-hover transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
