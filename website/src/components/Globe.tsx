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
    const globe = new THREE.Group();

    // ── Wireframe sphere (subtle) ─────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    const wire = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: AMBER,
      opacity: 0.08,
      transparent: true,
    });
    globe.add(new THREE.LineSegments(wire, wireMat));

    // ── Clean latitude lines ──────────────────────────────────
    for (let lat = -60; lat <= 60; lat += 30) {
      const r = Math.cos((lat * Math.PI) / 180);
      const y = Math.sin((lat * Math.PI) / 180);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)));
      }
      globe.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.25, transparent: true })
      ));
    }

    // ── Clean longitude lines ─────────────────────────────────
    for (let lon = 0; lon < 360; lon += 30) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const v = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
        v.applyAxisAngle(new THREE.Vector3(0, 1, 0), (lon * Math.PI) / 180);
        pts.push(v);
      }
      globe.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.15, transparent: true })
      ));
    }

    // ── Surface dots ──────────────────────────────────────────
    const dotPos: number[] = [];
    for (let i = 0; i < 500; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      dotPos.push(
        1.005 * Math.sin(phi) * Math.cos(theta),
        1.005 * Math.sin(phi) * Math.sin(theta),
        1.005 * Math.cos(phi)
      );
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPos, 3));
    globe.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
      color: AMBER,
      size: 0.012,
      opacity: 0.5,
      transparent: true,
    })));

    scene.add(globe);

    // ── Single orbit ring ─────────────────────────────────────
    const ringPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(1.25 * Math.cos(a), 0, 1.25 * Math.sin(a)));
    }
    const ringLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.2, transparent: true })
    );
    ringLine.rotation.x = Math.PI / 2.5;
    ringLine.rotation.z = 0.3;
    scene.add(ringLine);

    // ── Animate ───────────────────────────────────────────────
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      ringLine.rotation.z += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
