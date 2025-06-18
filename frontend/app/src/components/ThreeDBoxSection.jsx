import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function createQRTexture(qrValue) {
  // Create a canvas and draw the QR code into it
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  // Render QR code to a temporary React element, then draw to canvas
  // We'll use qrcode.react to render to a hidden div, then draw to canvas
  // But for simplicity, use a workaround: generate a data URL and draw it
  const qrDiv = document.createElement('div');
  document.body.appendChild(qrDiv);
  const qr = document.createElement('img');
  qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrValue)}`;
  return new Promise((resolve) => {
    qr.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(qr, 0, 0, size, size);
      document.body.removeChild(qrDiv);
      resolve(new THREE.CanvasTexture(canvas));
    };
    qrDiv.appendChild(qr);
  });
}

const BOX_SIZE = 2;

export default function ThreeDBoxSection() {
  const { t } = useTranslation();
  const mountRef = useRef();
  const qrValue = 'https://spp-demo-nft.com/free-nft';

  useEffect(() => {
    let frameId;
    let renderer, scene, camera, box, qrTexture;
    let width = 350, height = 350;
    let lastScrollY = 0;

    const init = async () => {
      if (!mountRef.current) return;
      
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 5);

      // Box with 6 materials, one is QR
      const materials = [];
      for (let i = 0; i < 6; i++) {
        if (i === 4) {
          // QR code on one face
          qrTexture = await createQRTexture(qrValue);
          materials.push(new THREE.MeshBasicMaterial({ map: qrTexture }));
        } else {
          // Use different colors for different faces to make it more interesting
          const colors = [0x4f46e5, 0x6366f1, 0x7c3aed, 0x8b5cf6, 0x9333ea, 0xa855f7];
          materials.push(new THREE.MeshStandardMaterial({ 
            color: colors[i], 
            metalness: 0.3,
            roughness: 0.4
          }));
        }
      }
      const geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
      box = new THREE.Mesh(geometry, materials);
      box.castShadow = true;
      box.receiveShadow = true;
      scene.add(box);
      console.log('Box created and added to scene:', box);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(5, 5, 5);
      dir.castShadow = true;
      scene.add(dir);

      // Add a subtle point light for better illumination
      const pointLight = new THREE.PointLight(0x4f46e5, 0.5, 10);
      pointLight.position.set(0, 2, 2);
      scene.add(pointLight);

      console.log('Scene initialized with box, lights, and camera');
      animate();
    };

    const animate = () => {
      // Calculate scrollY (0..1) for this section
      let scrollY = 0;
      if (mountRef.current) {
        const rect = mountRef.current.getBoundingClientRect();
        const windowH = window.innerHeight;
        if (rect.top < windowH && rect.bottom > 0) {
          scrollY = 1 - (rect.bottom - windowH) / (rect.height + windowH);
          scrollY = Math.max(0, Math.min(1, scrollY));
        }
      }
      lastScrollY = scrollY;
      // Animate box rotation and position
      if (box && renderer) {
        // Add constant rotation when not scrolling
        const time = Date.now() * 0.001;
        const constantRotation = scrollY < 0.1 ? Math.sin(time * 0.5) * 0.1 : 0;
        
        box.rotation.y = scrollY * Math.PI * 2 + constantRotation;
        box.rotation.x = 0.2 + scrollY * 0.5 + constantRotation * 0.5;
        box.position.x = scrollY * 2.5;
        box.position.y = -scrollY * 1.5;
        renderer.render(scene, camera);
        // Debug animation every 60 frames (1 second at 60fps)
        if (Math.floor(scrollY * 100) % 10 === 0) {
          console.log('Box animation - scrollY:', scrollY, 'rotation:', box.rotation, 'position:', box.position);
        }
      }
      frameId = requestAnimationFrame(animate);
    };

    init();
    window.addEventListener('scroll', animate);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', animate);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      if (qrTexture) qrTexture.dispose();
      if (box) box.geometry.dispose();
      if (box && box.material) {
        if (Array.isArray(box.material)) box.material.forEach(m => m.dispose());
        else box.material.dispose();
      }
    };
  }, []);

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
            {t('3d_demo_title', '3D NFT Demo: Scan & Claim!')}
          </h2>
          <p className="text-lg text-gray-200 mb-8 text-center max-w-2xl">
            {t('3d_demo_desc', 'Спробуйте наші можливості: обертайте 3D коробку, проскануйте QR-код та отримайте тестовий NFT. Це демонстрація для виробників, драйверів, споживачів. NFT безкоштовний!')}
          </p>
          <div className="w-full flex flex-col items-center">
            <div ref={mountRef} className="w-[350px] h-[350px] bg-transparent rounded-2xl shadow-2xl overflow-visible" />
          </div>
          <div className="mt-8 text-center text-gray-300 text-base max-w-xl">
            <strong>{t('3d_demo_nft_title', 'Тестове NFT:')}</strong> {t('3d_demo_nft_desc', 'Виробник: SPP Demo | Категорія: драйвери | Для тесту — відскануйте QR-код та отримайте NFT у свій гаманець Solana.')}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 