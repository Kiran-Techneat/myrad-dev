import { Icon } from '@/components/common/Icon';
import { useAppNavigate } from '@/hooks/useAppNavigate';

interface NotFoundProps {
  title?: string;
  message?: string;
}

/**
 * Lightweight 404 shown when a screen is opened without the data it needs
 * (e.g. `/notify` reached via a direct URL / refresh with no navigate state).
 */
export function NotFound({
  title = 'Page Not Found',
  message = "The page you're looking for isn't available. It may have been moved, or you opened this link without the required details.",
}: NotFoundProps) {
  const nav = useAppNavigate();

  return (
    <div className="wrap" style={{ maxWidth: 560 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          padding: '64px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--wash, #f3f4f6)',
            color: 'var(--ink2)',
          }}
        >
          <Icon name="search" sw={1.8} />
        </div>
        <div className="h1 serif" style={{ fontSize: 26 }}>
          {title}
        </div>
        <p style={{ color: 'var(--ink2)', fontSize: 15, margin: 0 }}>{message}</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 8 }}
          onClick={() => nav.go('home')}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;
