import { useEffect, useState } from 'react';

export function ProductImage({ src, name, className = '' }: { src: string | null; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <div className={`product-image ${className}`}>
      {src && !failed ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="product-image-fallback" role="img" aria-label={`Imagem indisponível: ${name}`}>
          <span className="fallback-orbit" aria-hidden="true" />
          <span className="fallback-mark" aria-hidden="true">E<span>×</span>L</span>
        </div>
      )}
    </div>
  );
}
