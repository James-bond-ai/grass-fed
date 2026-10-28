// Mounts the 3D pasture into the hero. Imported lazily by Hero.astro only
// after the capability check passes, so phones never download three.js.
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import PastureScene from './PastureScene.jsx';

function Live({ host, low }) {
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.01 });
    io.observe(host);
    return () => io.disconnect();
  }, [host]);
  return (
    <PastureScene
      low={low}
      reducedMotion={!onScreen}
      onReady={() => host.classList.add('is-live')}
    />
  );
}

export function mount(host, { low = false } = {}) {
  const root = createRoot(host);
  root.render(<Live host={host} low={low} />);
  return () => root.unmount();
}
