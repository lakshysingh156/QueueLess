import { useEffect, useRef } from 'react';

/**
 * Procedural continuous wireframe terrain and ocean swell visualization.
 * Inspired by the Tidecrest ridgeline-to-shoreline landscape.
 *
 * Implements:
 * - 3D perspective projection of continuous undulating contour ridges
 * - Mountain ridgeline elevation on the left and right flanks dipping toward the central horizon
 * - Luminous cyan/blue wireframe lines with depth-attenuated opacity
 * - Fine starlight and lidar data coordinate points
 * - Radial contrast pocket to keep central typography legible
 * - Respects prefers-reduced-motion for static rendering
 * - High-DPI Retina canvas scaling
 */
export default function TerrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let time = 0;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-generate background starlight particles (sky region)
    const starCount = 75;
    const stars: { x: number; y: number; r: number; a: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.6, // Upper 60% of canvas
        r: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.45 + 0.15,
      });
    }

    // Grid configuration for 3D terrain mesh
    const numRows = 38; // Number of contour lines back-to-front
    const numCols = 84; // Samples along each horizontal contour

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx?.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    // Height calculation at continuous coordinate (worldX, worldZ)
    function getElevation(x: number, z: number, t: number): number {
      // Flank ridgelines: terrain climbs higher on left and right edges
      const absX = Math.abs(x);
      const flankClimb = Math.pow(Math.max(0, absX - 0.15), 1.7) * 2.1;

      // Mountain peak ridges with harmonic noise
      const ridgePattern =
        Math.sin(x * 3.4 + z * 0.8) * 0.38 +
        Math.cos(x * 6.8 - z * 1.6 + t * 0.4) * 0.18 +
        Math.sin(x * 13.2 + z * 3.2) * 0.06;

      // Gentle valley ocean swell through the center
      const centerSwell = Math.sin(x * 2.2 + z * 2.0 - t * 0.7) * 0.14;

      // Depth attenuation: mountains fade into the distance
      const depthScale = 0.5 + 0.5 * (1 - z / 6.0);

      return (flankClimb + ridgePattern + centerSwell) * depthScale;
    }

    function render() {
      if (!ctx) return;

      // 1. Clear background to dark void
      ctx.fillStyle = '#02050b';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw subtle star / sensor coordinate dots in sky
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const pulse = 0.8 + 0.2 * Math.sin(time * 1.5 + i);
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${s.a * pulse})`;
        ctx.fill();
      }

      // Camera parameters
      const centerX = width * 0.5;
      const horizonY = height * 0.44;
      const camY = 1.65;
      const fovScale = height * 0.88;

      // 3. Render 3D wireframe contour lines from back (far horizon) to front (foreground)
      for (let r = numRows - 1; r >= 0; r--) {
        const rowNorm = r / (numRows - 1); // 0 (near) to 1 (far)
        const z = 1.0 + rowNorm * 5.2; // depth from 1.0 to 6.2

        // Alpha attenuates with distance
        // Near lines are vibrant cyan; far lines are faint deep blue
        const depthAlpha = Math.pow(1 - rowNorm * 0.75, 1.4);
        const strokeColor =
          rowNorm > 0.65
            ? `rgba(14, 165, 233, ${0.12 * depthAlpha})`
            : rowNorm > 0.35
            ? `rgba(56, 189, 248, ${0.32 * depthAlpha})`
            : `rgba(56, 189, 248, ${0.52 * depthAlpha})`;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = rowNorm < 0.3 ? 1.2 : 0.85;
        ctx.beginPath();

        let started = false;

        // Sample points across column span
        for (let c = 0; c < numCols; c++) {
          const colNorm = (c / (numCols - 1)) * 2 - 1; // -1 to 1
          const x = colNorm * 2.3; // world X span
          const y = getElevation(x, z, time);

          // 3D Perspective Projection
          const projX = centerX + (x * fovScale) / z;
          const projY = horizonY + ((camY - y) * fovScale) / z;

          if (!started) {
            ctx.moveTo(projX, projY);
            started = true;
          } else {
            ctx.lineTo(projX, projY);
          }

          // Subtle lidar point markers along ridges
          if (c % 7 === (r % 3) && rowNorm < 0.8) {
            const dotAlpha = 0.35 * depthAlpha;
            ctx.fillStyle = `rgba(186, 230, 253, ${dotAlpha})`;
            ctx.fillRect(projX - 0.75, projY - 0.75, 1.5, 1.5);
          }
        }

        ctx.stroke();
      }

      // 4. Central soft contrast pocket (radial darkening behind centered headline)
      // Keeps headline text pristine and 100% legible while wireframe ridgelines frame the edges
      const pocketGrad = ctx.createRadialGradient(
        centerX,
        height * 0.42,
        40,
        centerX,
        height * 0.42,
        width * 0.52
      );
      pocketGrad.addColorStop(0, 'rgba(2, 5, 11, 0.88)');
      pocketGrad.addColorStop(0.55, 'rgba(2, 5, 11, 0.55)');
      pocketGrad.addColorStop(1, 'rgba(2, 5, 11, 0)');

      ctx.fillStyle = pocketGrad;
      ctx.fillRect(0, 0, width, height);

      // 5. Horizon subtle cyan light leak
      const horizonGrad = ctx.createRadialGradient(
        centerX,
        horizonY + 20,
        10,
        centerX,
        horizonY + 20,
        width * 0.48
      );
      horizonGrad.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      horizonGrad.addColorStop(1, 'rgba(2, 5, 11, 0)');
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, 0, width, height);

      // Continue animation loop unless prefers-reduced-motion
      if (!prefersReducedMotion) {
        time += 0.005;
        animId = requestAnimationFrame(render);
      }
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}
