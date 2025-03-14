import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // Optional: Log when particles are fully loaded for debugging
    console.log('Particles container loaded:', container);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded} // Optional callback for debugging
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        background: {
          color: {
            value: '#0a192f', // Dark navy background
          },
        },
        fpsLimit: 60, // Cap frame rate to prevent performance spikes
        particles: {
          color: {
            value: '#64ffda', // Cyan particle color
          },
          links: {
            color: '#64ffda',
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1,
            triangles: {
              enable: true,
              opacity: 0.05,
            },
          },
          collisions: {
            enable: true,
            mode: 'bounce', // Ensure collisions don't accelerate particles
          },
          move: {
            enable: true,
            outModes: {
              default: 'bounce', // Particles bounce off edges
            },
            random: true,
            speed: 1, // Fixed speed
            straight: false,
            attract: {
              enable: false, // Disable attract to prevent speed increase over time
              // If you want attract, use lower values: rotateX: 300, rotateY: 600
            },
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80, // Number of particles
          },
          opacity: {
            value: 0.3,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          shape: {
            type: ['circle', 'triangle', 'polygon'], // Added polygon for variety
          },
          size: {
            value: { min: 1, max: 3 },
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false,
            },
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab', // Attracts particles on hover but won't accelerate
            },
            onClick: {
              enable: true,
              mode: 'push', // Adds particles on click without speeding up existing ones
            },
            resize: true, // Ensures particles adapt to window resize without speed changes
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
            push: {
              quantity: 4,
            },
          },
        },
        detectRetina: true,
        // Add a preset to stabilize animation
        preset: 'links', // Use a stable preset to maintain consistency
      }}
      className="fixed inset-0 pointer-events-none" // Prevents interference with other elements
    />
  );
}