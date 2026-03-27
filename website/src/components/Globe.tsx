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
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const AMBER = 0xd4a012;
    const RED = 0xff3333;
    const GREEN = 0x22c55e;

    // ── Core globe wireframe ──────────────────────────────────

    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const wireframe = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: AMBER,
      opacity: 0.12,
      transparent: true,
    });
    const sphere = new THREE.LineSegments(wireframe, wireMat);
    scene.add(sphere);

    // ── Latitude / longitude grid ─────────────────────────────

    const gridGroup = new THREE.Group();
    for (let i = -60; i <= 60; i += 30) {
      const rad = Math.cos((i * Math.PI) / 180);
      const y = Math.sin((i * Math.PI) / 180);
      const curve = new THREE.EllipseCurve(0, 0, rad, rad, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(
        pts.map((p) => new THREE.Vector3(p.x, y, p.y))
      );
      gridGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.3, transparent: true })));
    }
    for (let i = 0; i < 360; i += 30) {
      const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(
        pts.map((p) => {
          const v = new THREE.Vector3(p.x, p.y, 0);
          v.applyAxisAngle(new THREE.Vector3(0, 1, 0), (i * Math.PI) / 180);
          return v;
        })
      );
      gridGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.2, transparent: true })));
    }
    scene.add(gridGroup);

    // ── Shield hexagon overlay ────────────────────────────────

    const shieldGroup = new THREE.Group();

    // Inner hex ring
    for (let ring = 0; ring < 3; ring++) {
      const r = 1.08 + ring * 0.08;
      const hexPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI * 2) / 6 - Math.PI / 6;
        hexPts.push(new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle), 0));
      }
      const hexGeo = new THREE.BufferGeometry().setFromPoints(hexPts);
      const opacity = 0.25 - ring * 0.07;
      shieldGroup.add(
        new THREE.Line(hexGeo, new THREE.LineBasicMaterial({ color: AMBER, opacity, transparent: true }))
      );
    }
    shieldGroup.rotation.x = Math.PI / 8;
    scene.add(shieldGroup);

    // ── Orbiting shield ring ──────────────────────────────────

    const orbitRing = new THREE.Group();
    const ringCurve = new THREE.EllipseCurve(0, 0, 1.35, 1.35, 0, Math.PI * 2, false, 0);
    const ringPts = ringCurve.getPoints(128);
    const ringGeo = new THREE.BufferGeometry().setFromPoints(
      ringPts.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );

    // Dashed orbit line
    const dashMat = new THREE.LineDashedMaterial({
      color: AMBER,
      opacity: 0.3,
      transparent: true,
      dashSize: 0.15,
      gapSize: 0.08,
    });
    const orbitLine = new THREE.Line(ringGeo, dashMat);
    orbitLine.computeLineDistances();
    orbitRing.add(orbitLine);

    // Scanning dot on orbit
    const scanDotGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const scanDotMat = new THREE.MeshBasicMaterial({ color: GREEN, opacity: 0.9, transparent: true });
    const scanDot = new THREE.Mesh(scanDotGeo, scanDotMat);
    orbitRing.add(scanDot);

    // Second scanning dot (opposite side)
    const scanDot2 = new THREE.Mesh(scanDotGeo.clone(), new THREE.MeshBasicMaterial({ color: AMBER, opacity: 0.7, transparent: true }));
    orbitRing.add(scanDot2);

    orbitRing.rotation.x = Math.PI / 2.8;
    orbitRing.rotation.z = 0.3;
    scene.add(orbitRing);

    // ── Surface data points ───────────────────────────────────

    const dotPositions: number[] = [];
    const dotColors: number[] = [];
    for (let i = 0; i < 600; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.005;
      dotPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      // Most dots amber, some red (threats), some green (safe)
      const roll = Math.random();
      if (roll < 0.08) {
        dotColors.push(1, 0.2, 0.2); // red threat
      } else if (roll < 0.2) {
        dotColors.push(0.13, 0.77, 0.37); // green safe
      } else {
        dotColors.push(0.83, 0.63, 0.07); // amber
      }
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(dotColors, 3));
    const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({
      size: 0.015,
      opacity: 0.7,
      transparent: true,
      vertexColors: true,
    }));
    scene.add(dots);

    // ── Threat pulse rings ────────────────────────────────────

    const pulseRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const pulseGeo = new THREE.RingGeometry(0.03, 0.05, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: RED,
        side: THREE.DoubleSide,
        opacity: 0,
        transparent: true,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      // Place on random surface positions
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      pulse.position.set(
        1.02 * Math.sin(phi) * Math.cos(theta),
        1.02 * Math.sin(phi) * Math.sin(theta),
        1.02 * Math.cos(phi)
      );
      pulse.lookAt(0, 0, 0);
      pulse.userData = { phase: i * 2, speed: 0.02 + Math.random() * 0.01 };
      scene.add(pulse);
      pulseRings.push(pulse);
    }

    // ── Lock icon (keyhole shape at top) ──────────────────────

    const lockGroup = new THREE.Group();
    // Lock body (small rectangle)
    const lockBodyPts = [
      new THREE.Vector3(-0.06, -0.04, 0),
      new THREE.Vector3(0.06, -0.04, 0),
      new THREE.Vector3(0.06, 0.04, 0),
      new THREE.Vector3(-0.06, 0.04, 0),
      new THREE.Vector3(-0.06, -0.04, 0),
    ];
    lockGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(lockBodyPts),
      new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.5, transparent: true })
    ));
    // Lock shackle (arc)
    const shackleCurve = new THREE.EllipseCurve(0, 0.04, 0.04, 0.05, 0, Math.PI, false, 0);
    const shacklePts = shackleCurve.getPoints(16);
    lockGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(shacklePts.map(p => new THREE.Vector3(p.x, p.y, 0))),
      new THREE.LineBasicMaterial({ color: AMBER, opacity: 0.5, transparent: true })
    ));
    lockGroup.position.set(0, 1.45, 0);
    lockGroup.scale.setScalar(1.5);
    scene.add(lockGroup);

    // ── Animation ─────────────────────────────────────────────

    let time = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.016;

      // Rotate globe
      sphere.rotation.y += 0.002;
      gridGroup.rotation.y += 0.002;
      dots.rotation.y += 0.002;

      // Shield slowly counter-rotates
      shieldGroup.rotation.z += 0.001;

      // Scan dots orbit
      const orbitAngle = time * 0.8;
      scanDot.position.set(1.35 * Math.cos(orbitAngle), 0, 1.35 * Math.sin(orbitAngle));
      scanDot2.position.set(1.35 * Math.cos(orbitAngle + Math.PI), 0, 1.35 * Math.sin(orbitAngle + Math.PI));

      // Scan dot glow pulse
      (scanDotMat as THREE.MeshBasicMaterial).opacity = 0.5 + 0.4 * Math.sin(time * 4);

      // Threat pulse rings
      pulseRings.forEach((p) => {
        p.userData.phase += p.userData.speed;
        const t = p.userData.phase % 3;
        if (t < 1.5) {
          const scale = 1 + t * 3;
          p.scale.setScalar(scale);
          (p.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - t / 1.5);
        } else {
          (p.material as THREE.MeshBasicMaterial).opacity = 0;
        }
        // Rotate with globe
        p.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.002);
      });

      // Lock subtle float
      lockGroup.position.y = 1.45 + Math.sin(time * 1.5) * 0.02;

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
