import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Particles({ count = 2000 }) {
  const pointsRef = useRef();

  // Create random positions and colors
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    const colorGen = new THREE.Color();
    const palettes = ['#B7222D', '#0E7C42', '#FBDE44', '#ffffff'];

    for (let i = 0; i < count; i++) {
        // Spherical distribution
        const r = 20 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);

        // Colors
        colorGen.set(palettes[Math.floor(Math.random() * palettes.length)]);
        col[i * 3] = colorGen.r;
        col[i * 3 + 1] = colorGen.g;
        col[i * 3 + 2] = colorGen.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial 
        transparent 
        vertexColors 
        size={0.15} 
        sizeAttenuation={true} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function Background3D() {
  const containerRef = useRef(null);

  useEffect(() => {
      // Connect GSAP ScrollTrigger to the camera or container
      const q = gsap.utils.selector(containerRef.current);
      
      gsap.to(containerRef.current, {
          y: '30%',
          opacity: 0,
          ease: "none",
          scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true
          }
      });
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Particles count={3000} />
      </Canvas>
    </div>
  );
}
