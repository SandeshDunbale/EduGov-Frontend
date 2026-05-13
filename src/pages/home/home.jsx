// src/pages/home/Home.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows } from '@react-three/drei';
import {
  ArrowRight, BookOpen, FileText, ShieldCheck,
  BarChart, ChevronLeft, ChevronRight, Users, Building, Globe
} from 'lucide-react';
import * as THREE from 'three';
import './home.css';

// --- Education-Themed Glass Shapes ---
const EducationShape = ({ position, type, scale = 1, floatSpeed = 1, rotationSpeed = 1 }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += 0.003 * rotationSpeed;
    groupRef.current.rotation.y += 0.005 * rotationSpeed;
    
    // Smooth, subtle mouse follow
    const targetX = position[0] + (state.mouse.x * 1.5);
    const targetY = position[1] + (state.mouse.y * 1.5);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.02);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.02);
  });

  const glassProps = {
    transmission: 1,
    roughness: 0.1,
    thickness: 1.2,
    ior: 1.5,
    chromaticAberration: 0.04,
    iridescence: 1,
    iridescenceIOR: 1.3,
    clearcoat: 1,
    color: "#ffffff"
  };

  return (
    <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} scale={scale}>
        {/* 🎓 GRADUATION CAP */}
        {type === 'cap' && (
          <group>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[2.2, 0.1, 2.2]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.7, 0.7, 0.8, 32]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
          </group>
        )}

        {/* 📖 OPEN BOOK */}
        {type === 'book' && (
          <group rotation={[0, 0, 0.2]}>
            <mesh position={[-0.55, 0, 0]} rotation={[0, -0.4, 0]}>
              <boxGeometry args={[1.1, 1.6, 0.15]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
            <mesh position={[0.55, 0, 0]} rotation={[0, 0.4, 0]}>
              <boxGeometry args={[1.1, 1.6, 0.15]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
          </group>
        )}

        {/* 🏛️ GOVERNANCE PILLAR */}
        {type === 'pillar' && (
          <group>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 2, 32]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[1.2, 0.2, 1.2]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
            <mesh position={[0, -1.1, 0]}>
              <boxGeometry args={[1.2, 0.2, 1.2]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
          </group>
        )}

        {/* 🌎 GLOBAL EDUCATION (Globe) */}
        {type === 'globe' && (
          <group>
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.2, 0.05, 16, 100]} />
              <meshPhysicalMaterial {...glassProps} />
            </mesh>
          </group>
        )}
      </group>
    </Float>
  );
};

// --- Carousel Content Data ---
const carouselSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop",
    title: "Global University Network",
    subtitle: "Trusted by the world's leading academic institutions to standardize operations."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    title: "Data-Driven Intelligence",
    subtitle: "Real-time analytics dashboards for complete administrative and financial oversight."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop",
    title: "Modern Infrastructure",
    subtitle: "Cloud-native architecture ensuring seamless compliance and military-grade security."
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play Carousel with Pause on Hover
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const nextSlide = () => setCurrentSlide(currentSlide === carouselSlides.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? carouselSlides.length - 1 : currentSlide - 1);

  return (
    <div className="premium-3d-wrapper">
      
      {/* 1. THE 3D CANVAS */}
      <div className="canvas-background">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#3B82F6" />
          <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={2} color="#F43F5E" />
          <Environment preset="city" />
          
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.2, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <EducationShape type="pillar" position={[-5, 2, -2]} scale={0.8} floatSpeed={1.5} />
            <EducationShape type="cap" position={[6, -2, -4]} scale={1} floatSpeed={1.2} />
            <EducationShape type="book" position={[-6, -3, -5]} scale={1.1} floatSpeed={2} />
            <EducationShape type="globe" position={[5, 4, -3]} scale={0.9} floatSpeed={1.4} />
            <EducationShape type="cap" position={[0, -6, -8]} scale={1.5} floatSpeed={1} />
          </PresentationControls>

          <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={20} blur={2} far={10} />
        </Canvas>
      </div>

      {/* 2. THE UI OVERLAY */}
      <div className="ui-overlay">
        
        {/* HERO */}
        <div className="premium-hero">
          <div className="hero-badge">Next-Generation Platform</div>
          <h1 className="hero-title">
            Transforming Academic<br/> Governance.
          </h1>
          <p className="hero-subtitle">
            An intelligent, unified ecosystem for the modern university. Unify your data, automate compliance, and empower your institution.
          </p>
          <div className="hero-actions">
            <Link to="/demo" className="btn-premium-glass">
              Enter Workspace <ArrowRight className="btn-icon-right" />
            </Link>
            <p className="hero-hint">Interact with the digital space to explore ✦</p>
          </div>
        </div>

        {/* 📊 IMPACT METRICS BANNER */}
        <div className="impact-metrics-banner">
          <div className="metric">
            <Building className="metric-icon" />
            <h2>500+</h2>
            <p>Institutions</p>
          </div>
          <div className="metric">
            <Users className="metric-icon" />
            <h2>2.5M+</h2>
            <p>Students Managed</p>
          </div>
          <div className="metric">
            <Globe className="metric-icon" />
            <h2>12</h2>
            <p>Countries</p>
          </div>
        </div>

        {/* 📍 PREMIUM GLASS CAROUSEL */}
        <div 
          className="glass-carousel-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {carouselSlides.map((slide) => (
              <div key={slide.id} className="carousel-slide">
                <img src={slide.image} alt={slide.title} className="carousel-img" />
                <div className="carousel-glass-caption">
                  <h3>{slide.title}</h3>
                  <p>{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous slide">
            <ChevronLeft size={24} />
          </button>
          <button className="carousel-btn next" onClick={nextSlide} aria-label="Next slide">
            <ChevronRight size={24} />
          </button>
          
          <div className="carousel-dots">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* BENTO/GLASS GRID */}
        <div className="section-header">
          <h2>Core Capabilities</h2>
          <p>Everything you need to govern effectively.</p>
        </div>

        <div className="premium-glass-grid">
          <div className="glass-panel">
            <div className="panel-icon-wrap"><BookOpen /></div>
            <h3>Curriculum Design</h3>
            <p>Agile workflows and seamless routing for new program approvals and syllabus tracking.</p>
          </div>
          
          <div className="glass-panel">
            <div className="panel-icon-wrap"><FileText /></div>
            <h3>Grant Management</h3>
            <p>Optimized financial oversight, fund allocation, and real-time infrastructure ledgers.</p>
          </div>

          <div className="glass-panel">
            <div className="panel-icon-wrap"><ShieldCheck /></div>
            <h3>Automated Compliance</h3>
            <p>Military-grade encryption ensuring constant regional, state, and federal audit readiness.</p>
          </div>

          <div className="glass-panel">
            <div className="panel-icon-wrap"><BarChart /></div>
            <h3>Predictive Analytics</h3>
            <p>Data-driven insights guiding strategic institutional decisions and student success models.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;