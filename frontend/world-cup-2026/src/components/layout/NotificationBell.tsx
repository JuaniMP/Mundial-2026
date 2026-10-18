import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_BASE = API_BASE_URL;
const POLL_MS = 30_000; // refrescar cada 30 s
const STORAGE_KEY_LAST_SEEN = 'notif_last_seen_id';

interface NotificacionItem {
  id: number;
  mensaje: string;
  canal: string;
  fechaEnvio: string | null;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

function formatRelative(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'hace un momento';
  if (diffSec < 3600) return `hace ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `hace ${Math.floor(diffSec / 3600)} h`;
  return d.toLocaleDateString();
}

/**
 * Campanita del navbar — feed de notificaciones in-app.
 * Lee del endpoint /api/v1/notifications/mis-notificaciones cada 30 s.
 * No usa Firebase; las notificaciones están almacenadas en la BD.
 */
export function NotificationBell(): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificacionItem[]>([]);
  const [lastSeenId, setLastSeenId] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_LAST_SEEN);
    return stored ? parseInt(stored, 10) : 0;
  });
  const isMounted = useRef(true);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      const res = await axios.get<ApiResponse<NotificacionItem[]>>(
        `${API_BASE}/api/v1/notifications/mis-notificaciones`,
      );
      if (!isMounted.current) return;
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setItems(data);
    } catch {
      // silencioso — el usuario podría no estar autenticado
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    // Defer initial fetch to a callback so setState is not called
    // synchronously in the effect body (satisfies react-hooks/set-state-in-effect)
    const initial = window.setTimeout(fetchNotifications, 0);
    const interval = window.setInterval(fetchNotifications, POLL_MS);
    return () => {
      isMounted.current = false;
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [fetchNotifications]);

  const unread = items.filter((n) => n.id > lastSeenId).length;

  const handleOpen = (): void => {
    setOpen((v) => !v);
    if (!open && items.length > 0) {
      const maxId = items[0].id;
      setLastSeenId(maxId);
      localStorage.setItem(STORAGE_KEY_LAST_SEEN, String(maxId));
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        aria-label="Notificaciones"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: '#0D1B2A',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#f0f2f5')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: '#C8102E',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 9999,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 360,
              maxHeight: 480,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 10,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.07)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <strong
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: 14,
                  color: '#0D1B2A',
                }}
              >
                Notificaciones
              </strong>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{items.length} en total</span>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {items.length === 0 ? (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: 13,
                  }}
                >
                  Sin notificaciones por ahora.
                </div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      background: n.id > lastSeenId ? 'rgba(0, 104, 71, 0.05)' : 'transparent',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: '#0D1B2A',
                        lineHeight: 1.4,
                        marginBottom: 4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {n.mensaje}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                      }}
                    >
                      {formatRelative(n.fechaEnvio)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
