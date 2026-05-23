import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Pencil, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { buildAvatarSeed, DEFAULT_AVATAR_SEEDS, getAvatarUrl } from '../utils/avatar';

const DEFAULT_PUBLIC_ASSETS = [
  '/assets/avatar-1.png',
  '/assets/avatar-2.png',
  '/assets/avatar-3.png',
  '/assets/avatar-4.png',
  '/assets/avatar-5.png',
];

export default function AvatarPicker() {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [publicAvatars, setPublicAvatars] = useState<string[]>(() => user?.avatarCustomUrls ?? []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const probe = (url: string) =>
        new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });

      const found: string[] = [];
      for (const url of DEFAULT_PUBLIC_ASSETS) {
        try {
           
          if (await probe(url)) found.push(url);
        } catch {
          // ignore
        }
      }
      if (!mounted) return;
      const merged = [...(user?.avatarCustomUrls ?? []), ...found.filter((f) => !(user?.avatarCustomUrls ?? []).includes(f))];
      // Prioritize specific images requested: avatar-1 and avatar-5, then fill up to 5
      const prioritized: string[] = [];
      const ensurePush = (u?: string) => {
        if (!u) return;
        if (merged.includes(u) && !prioritized.includes(u)) prioritized.push(u);
      };
      ensurePush('/assets/avatar-1.png');
      ensurePush('/assets/avatar-5.png');
      for (const u of merged) {
        if (prioritized.length >= 5) break;
        if (!prioritized.includes(u)) prioritized.push(u);
      }
      setPublicAvatars(prioritized);
      if (prioritized.length && (!user?.avatarCustomUrls || user.avatarCustomUrls.length === 0)) {
        // set the first prioritized image as the default selected avatar
        updateUser({ avatarCustomUrls: [prioritized[0]] });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.avatarCustomUrls, updateUser]);

  const parsedSeed = (() => {
    try {
      const s = user?.avatarSeed ?? '';
      if (!s) return null;
      const [style, seed] = s.split(':');
      return { style, seed };
    } catch {
      return null;
    }
  })();

  const choosePublic = (url: string) => {
    updateUser({ avatarCustomUrls: [url] });
    updateUser({ avatarSeed: undefined });
    setOpen(false);
  };

  const chooseSeed = (opt: { style: string; seed: string }) => {
    const key = buildAvatarSeed(opt.style, opt.seed);
    updateUser({ avatarSeed: key });
    updateUser({ avatarCustomUrls: [] });
    setOpen(false);
  };

  const modal = (
    <div className="fixed inset-0 z-[90] bg-black/55 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-bg-card border border-border shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-lg text-text-primary">Elige tu avatar</h3>
            <p className="text-sm text-text-muted">Selecciona una imagen o elige una de las opciones generadas.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-bg-elevated">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-text-muted mb-3">Imágenes públicas</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {publicAvatars.map((url, idx) => {
              const selected = user?.avatarCustomUrls && user.avatarCustomUrls[0] === url;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => choosePublic(url)}
                  className={`relative rounded-xl p-2 border transition-all ${
                    selected ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={url} alt={`avatar-${idx + 1}`} className="w-full h-24 object-cover rounded-full mb-1" />
                  {selected && (
                    <span className="absolute top-2 right-2 text-primary">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-text-muted mb-3">Opciones generadas</div>
          <div className="grid grid-cols-3 gap-3">
            {DEFAULT_AVATAR_SEEDS.slice(0, 2).map((opt) => {
              const key = buildAvatarSeed(opt.style, opt.seed);
              const url = `https://api.dicebear.com/7.x/${encodeURIComponent(opt.style)}/svg?seed=${encodeURIComponent(opt.seed)}`;
              const selected = parsedSeed && buildAvatarSeed(parsedSeed.style, parsedSeed.seed) === key && (!user?.avatarCustomUrls || user.avatarCustomUrls.length === 0);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => chooseSeed(opt)}
                  className={`relative rounded-xl p-2 border transition-all ${
                    selected ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={url} alt={opt.label} className="w-full h-24 object-cover rounded-full mb-1" />
                  {selected && (
                    <span className="absolute top-2 right-2 text-primary">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative shrink-0">
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
        <img src={getAvatarUrl(user ?? undefined)} alt={user?.name ?? 'avatar'} className="w-full h-full object-cover" />
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar avatar"
        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-[#0D1B2A] border border-white/60 flex items-center justify-center shadow-md hover:bg-gray-100"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      {open && createPortal(modal, document.body)}
    </div>
  );
}
