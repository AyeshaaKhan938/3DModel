
import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import "./ModelViewer.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Model component with enhanced texture handling
function Model({ path, texture, color, rotation, scale = 1 }) {
  const group = useRef();
  const { scene } = useGLTF(path);

  // Rotate the model slowly for a more engaging display
  useFrame((state) => {
    if (group.current && !state.pointer.down) {
      group.current.rotation.y += 0.002;
    }
  });

  // Apply texture and color to all materials
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (texture) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        } else {
          child.material.map = null;
          child.material.color.set(color || 0xcccccc);
        }
      }
    });
  }, [scene, texture, color]);


  return (
    <group ref={group} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

// Main component
export default function ModelViewer() {
  const [currentTexture, setCurrentTexture] = useState(null);
  const [currentColor, setCurrentColor] = useState(null);
  const [modelRotation] = useState([0, 0, 0]);
  const [modelPath] = useState("/assets/shoes.glb");
  const [textureLoading, setTextureLoading] = useState(false);

  // Texture loading function
  const loadTexture = (path) => {
    if (!path) return Promise.resolve(null);

    setTextureLoading(true);
    const textureLoader = new THREE.TextureLoader();
    return new Promise((resolve) => {
      textureLoader.load(
        path,
        (texture) => {
          texture.flipY = false;
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1); // Less repetition
          texture.anisotropy = 16; // Sharper textures at angles
          texture.needsUpdate = true;
          setTextureLoading(false);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error("Error loading texture:", error);
          setTextureLoading(false);
          resolve(null);
        }
      );
    });
  };

  // Handle texture selection
  const handleTextureSelect = async (texturePath) => {
    setCurrentColor(null); // Reset color when selecting a texture

    const texture = await loadTexture(texturePath);
    setCurrentTexture(texture);
  };

  // Handle color selection
  const handleColorSelect = (hexColor) => {
    setCurrentTexture(null); // Reset texture when selecting a color
    setCurrentColor(hexColor);
  };

  // Available textures with proper paths
  const textureOptions = [
    { name: "Leather", path: "/assets/leather-texture.jpg" },
    { name: "Fabric", path: "/assets/fabric.jpg" },
    { name: "Denim", path: "/assets/denim.jpg" },
    { name: "Canvas", path: "/assets/canvas.jpg" },
    { name: "Suede", path: "/assets/suede.jpg" }
  ];

  // Color options
  const colorOptions = [
    { name: "Red", hex: "#FF0000" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Green", hex: "#00FF00" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Purple", hex: "#800080" },
    { name: "Black", hex: "#000000" },
    { "name": "Royal Blue", "hex": "#4169E1" }

  ];
  return (
    <div style={{
      width: "100%",

      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "rgb(6, 56, 56)",
      fontFamily: "'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        width: "200%",
        padding: "20px 0",
        textAlign: "center",
        backgroundColor: "white",
        borderBottom: "1px solid #eaeaea"
      }}>
        <h1 className="heading">3D Shoes</h1>
      </header>
      {/* Main content */}
      <main style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
        {/* Canvas wrapper */}
        <div style={{
          width: "100%",
          height: "500px",
          position: "relative",
          overflow: "hidden",
          borderRadius: "8px",
          margin: "20px 0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>

          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 2]}
            style={{ background: "#f2f2f2" }}
            onCreated={({ gl }) => {
              gl.setClearColor(new THREE.Color("#f2f2f2"));
            }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
            <spotLight position={[-5, 5, 5]} intensity={0.8} castShadow />
            <Suspense fallback={null}>
              <Model
                path={modelPath}
                texture={currentTexture}
                color={currentColor}
                rotation={modelRotation}
                scale={0.5}
              />
              <Environment preset="studio" />
              <ContactShadows
                position={[0, -1, 0]}
                opacity={0.5}
                scale={10}
                blur={1.5}
                far={1}
              />
              <OrbitControls
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
                enableZoom={true}
                enablePan={false}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Material & Color controls */}
        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          width: "80%",
          maxWidth: "600px",

        }}>
          <h3 style={{ margin: "0 0 15px", color: "#333", fontSize: "18px", textAlign: "center" }}>Material Selection</h3>
          <div style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
            position: "relative",
            marginBottom: "30px"
          }}>
            {textureLoading && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.7)",
                zIndex: 2,
                borderRadius: "8px"
              }}>
                <p>Loading texture...</p>
              </div>
            )}

            {textureOptions.map((texture) => (
              <button
                key={texture.name}
                onClick={() => handleTextureSelect(texture.path)}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: currentTexture && texture.path ? "2px solid #3498db" : "2px solid #dedede",
                  transition: "transform 0.2s ease, border 0.2s ease",
                  backgroundSize: 'cover',
                  backgroundImage: `url(${texture.path})`,
                  position: "relative",
                  transform: currentTexture && texture.path ? 'scale(1.05)' : 'scale(1)'
                }}
                title={texture.name}
              >
                <span style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "12px",
                  whiteSpace: "nowrap"
                }}>
                  {texture.name}
                </span>
              </button>
            ))}
          </div>
          <h3 style={{ margin: "30px 0 15px", color: "#333", fontSize: "18px", textAlign: "center" }}>Color Selection</h3>
          <div style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
            position: "relative"
          }}>
            {colorOptions.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorSelect(color.hex)}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: color.hex,
                  border: currentColor === color.hex ? "3px solid #3498db" : "2px solid #dedede",
                  transition: "transform 0.2s ease, border 0.2s ease",
                  position: "relative",
                  transform: currentColor === color.hex ? 'scale(1.05)' : 'scale(1)'
                }}
                title={color.name}
              >
                <span style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "12px",
                  whiteSpace: "nowrap"
                }}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          width: "80%",
          maxWidth: "600px",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 10px", color: "#333", fontSize: "16px" }}>Instructions</h3>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px"
          }}>
            <li style={{ fontSize: "14px", color: "#666" }}>
              <strong>Rotate:</strong> Click and drag with left mouse button
            </li>
            <li style={{ fontSize: "14px", color: "#666" }}>
              <strong>Zoom:</strong> Scroll wheel or pinch on touchscreen
            </li>
            <li style={{ fontSize: "14px", color: "#666" }}>
              <strong>Customize:</strong> Choose a material texture or color
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}