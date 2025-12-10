'use client';

import { useEffect, useState } from 'react';

export default function IntroSplash() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeOut 0.2s ease-out 0.8s forwards'
        }}>
            <h1 style={{
                color: 'var(--accent-primary)',
                fontFamily: 'var(--font-unbounded), sans-serif',
                fontSize: '4rem',
                fontWeight: 900,
                letterSpacing: '-0.02em', // Adjusted for Unbounded
                textTransform: 'uppercase',
                margin: 0
            }}>
                moneyball.
            </h1>
            <style jsx>{`
        @keyframes fadeOut {
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>
        </div>
    );
}
