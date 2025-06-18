import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function ThreeDBoxSection() {
  const { t } = useTranslation();
  const mountRef = useRef();

  useEffect(() => {
    let frameId;
    let renderer, scene, camera, model, mixer;
    let width = 350, height = 350;

    const init = async () => {
      if (!mountRef.current) return;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, width / height, 1, 100);
      camera.position.set(5, 2, 8);

      // Освітлення
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(5, 5, 5);
      scene.add(dir);

      // Завантаження моделі
      const loader = new GLTFLoader();
      loader.load('/src/assets/LittlestTokyo.glb', (gltf) => {
        model = gltf.scene;
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);
        scene.add(model);

        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          mixer.clipAction(gltf.animations[0]).play();
        }

        animate();
      }, undefined, (error) => {
        console.error('GLTFLoader error:', error);
      });
    };

    const animate = () => {
      if (mixer) mixer.update(0.016);
      if (renderer && scene && camera) renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    init();

    return () => {
      cancelAnimationFrame(frameId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
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
            {t('3d_demo_desc', 'Спробуйте наші можливості: обертайте 3D модель, проскануйте QR-код та отримайте тестовий NFT. Це демонстрація для виробників, драйверів, споживачів. NFT безкоштовний!')}
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