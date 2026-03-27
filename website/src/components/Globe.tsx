"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const AMBER = 0xd4a012;

    // Wireframe sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const wireframe = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: AMBER,
      opacity: 0.15,
      transparent: true,
    });
    const sphere = new THREE.LineSegments(wireframe, wireMat);
    scene.add(sphere);

    // Latitude lines
    for (let i = -60; i <= 60; i += 30) {
      const rad = Math.cos((i * Math.PI) / 180);
      const y = Math.sin((i * Math.PI) / 180);
      const curve = new THREE.EllipseCurve(0, 0, rad, rad, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, y, p.y))
      );
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.4, transparent: true })
      );
      scene.add(line);
    }

    // Longitude lines
    for (let i = 0; i < 360; i += 30) {
      const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => {
          const v = new THREE.Vector3(p.x, p.y, 0);
          v.applyAxisAngle(new THREE.Vector3(0, 1, 0), (i * Math.PI) / 180);
          return v;
        })
      );
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.25, transparent: true })
      );
      scene.add(line);
    }

    // Dots on surface
    const dotGeo = new THREE.BufferGeometry();
    const dotPositions: number[] = [];
    for (let i = 0; i < 800; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.005;
      dotPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: AMBER,
      size: 0.012,
      opacity: 0.6,
      transparent: true,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    // Outer glow ring
    const ringGeo = new THREE.RingGeometry(1.15, 1.18, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: AMBER,
      side: THREE.DoubleSide,
      opacity: 0.2,
      transparent: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Animation
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      sphere.rotation.y += 0.003;
      dots.rotation.y += 0.003;
      ring.rotation.z += 0.001;

      // Rotate latitude/longitude with sphere
      scene.children.forEach((child) => {
        if (child instanceof THREE.Line && child !== sphere) {
          child.rotation.y += 0.003;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
