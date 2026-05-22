type AvatarUserLike = {
  avatarSeed?: string;
  name?: string;
  email?: string;
  avatarCustomUrls?: string[];
};

export function parseAvatarSeed(raw?: string): { style: string; seed: string } {
  if (!raw) return { style: 'avataaars', seed: 'fan' };
  const idx = raw.indexOf(':');
  if (idx <= 0 || idx === raw.length - 1) {
    return { style: 'avataaars', seed: raw };
  }
  return {
    style: raw.slice(0, idx),
    seed: raw.slice(idx + 1),
  };
}

export function buildAvatarSeed(style: string, seed: string): string {
  return `${style}:${seed}`;
}

export function getAvatarUrl(user?: AvatarUserLike): string {
  // If user has custom uploaded images, prefer the first one
  if (user?.avatarCustomUrls && user.avatarCustomUrls.length > 0) {
    return user.avatarCustomUrls[0];
  }
  const fallback = user?.name ?? user?.email ?? 'fan';
  const parsed = parseAvatarSeed(user?.avatarSeed ?? fallback);
  return `https://api.dicebear.com/7.x/${encodeURIComponent(parsed.style)}/svg?seed=${encodeURIComponent(parsed.seed)}`;
}

export const DEFAULT_AVATAR_SEEDS = [
  { label: 'Mascota Alce', style: 'fun-emoji', seed: 'mascot-moose' },
  { label: 'Mascota Jaguar', style: 'fun-emoji', seed: 'mascot-jaguar' },
  { label: 'Mascota Aguila', style: 'bottts', seed: 'mascot-eagle' },
  { label: 'Fan Rojo', style: 'avataaars', seed: 'fan-red-jersey' },
  { label: 'Fan Verde', style: 'avataaars', seed: 'fan-green-jersey' },
  { label: 'Fan Azul', style: 'avataaars', seed: 'fan-blue-jersey' },
  { label: 'Fan Blanco', style: 'avataaars', seed: 'fan-white-jersey' },
];
