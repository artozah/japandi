import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useBreakpoint(): Breakpoint | null {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(null);

  useEffect(() => {
    const mqTablet = window.matchMedia('(min-width: 768px)');
    const mqDesktop = window.matchMedia('(min-width: 1024px)');

    const update = () => {
      if (mqDesktop.matches) setBreakpoint('desktop');
      else if (mqTablet.matches) setBreakpoint('tablet');
      else setBreakpoint('mobile');
    };

    update();
    mqTablet.addEventListener('change', update);
    mqDesktop.addEventListener('change', update);
    return () => {
      mqTablet.removeEventListener('change', update);
      mqDesktop.removeEventListener('change', update);
    };
  }, []);

  return breakpoint;
}
