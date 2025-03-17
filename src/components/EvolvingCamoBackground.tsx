import React, { useEffect, useRef } from 'react';
import { useMobileDetection } from './MobileDetection';

interface CamoBlob {
  x: number;
  y: number;
  size: number;
  points: { angle: number, radius: number }[];
  color: { r: number, g: number, b: number, targetR: number, targetG: number, targetB: number };
  speed: number;
}

const EvolvingCamoBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useMobileDetection();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Tan/Brown camouflage colors
    const camoColors = [
      { r: 140, g: 122, b: 91 },   // Dark tan (#8C7A5B)
      { r: 190, g: 169, b: 135 },  // Medium tan (#BEA987)
      { r: 210, g: 198, b: 168 },  // Light tan (#D2C6A8)
      { r: 30, g: 37, b: 41 },     // Gunmetal (#1E2529)
      { r: 19, g: 26, b: 31 },     // Dark gunmetal (#131A1F)
      { r: 10, g: 10, b: 10 }      // Near black (#0A0A0A)
    ];
    
    // Create array to store all blobs
    const blobs: CamoBlob[] = [];
    
    // Create realistic camouflage pattern
    // Adjust scale for mobile devices
    const patternScale = isMobile ? 0.7 : 0.5; // Larger blobs on mobile
    const baseSize = isMobile ? 80 : 100; // Smaller base size on mobile
    
    // Initialize camouflage blobs
    const initCamoPattern = () => {
      // Clear existing blobs
      blobs.length = 0;
      
      // Create multiple layers of camouflage
      // Fewer layers and blobs on mobile for better performance
      const numLayers = isMobile ? 3 : 4;
      
      for (let layer = 0; layer < numLayers; layer++) {
        // Each layer has its own set of blobs
        // Fewer blobs on mobile for better performance
        const numBlobs = isMobile ? 
          (20 + Math.floor(Math.random() * 15)) : // 20-35 blobs per layer on mobile
          (30 + Math.floor(Math.random() * 20)); // 30-50 blobs per layer on desktop
        
        for (let i = 0; i < numBlobs; i++) {
          // Random position within canvas
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          
          // Random size for this blob
          const size = baseSize * (0.8 + Math.random() * 0.8) * patternScale;
          
          // Random color from our palette
          const initialColor = camoColors[Math.floor(Math.random() * camoColors.length)];
          const targetColor = camoColors[Math.floor(Math.random() * camoColors.length)];
          
          // Create points for the blob shape
          // Simpler shapes on mobile for better performance
          const numPoints = isMobile ? 
            (5 + Math.floor(Math.random() * 3)) : // 5-7 points on mobile
            (6 + Math.floor(Math.random() * 4)); // 6-9 points on desktop
          
          const points = [];
          
          for (let j = 0; j < numPoints; j++) {
            const angle = (j / numPoints) * Math.PI * 2;
            const radius = size * (0.7 + Math.random() * 0.6);
            points.push({ angle, radius });
          }
          
          // Create blob object
          // Slower transitions on mobile for better performance
          const blob: CamoBlob = {
            x,
            y,
            size,
            points,
            color: {
              r: initialColor.r,
              g: initialColor.g,
              b: initialColor.b,
              targetR: targetColor.r,
              targetG: targetColor.g,
              targetB: targetColor.b
            },
            speed: isMobile ? 
              (0.003 + Math.random() * 0.01) : // Slower on mobile
              (0.005 + Math.random() * 0.015) // Normal speed on desktop
          };
          
          blobs.push(blob);
        }
      }
    };
    
    // Draw a single camouflage blob
    const drawCamoBlob = (blob: CamoBlob) => {
      if (!ctx) return;
      
      const { r, g, b } = blob.color;
      ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      
      // Create an irregular blob shape
      ctx.beginPath();
      
      // First point
      const firstPoint = blob.points[0];
      const startX = blob.x + Math.cos(firstPoint.angle) * firstPoint.radius;
      const startY = blob.y + Math.sin(firstPoint.angle) * firstPoint.radius;
      
      ctx.moveTo(startX, startY);
      
      // Create the rest of the points
      for (let i = 1; i <= blob.points.length; i++) {
        const currentPoint = blob.points[i % blob.points.length];
        const nextPoint = blob.points[(i + 1) % blob.points.length];
        
        const pointX = blob.x + Math.cos(currentPoint.angle) * currentPoint.radius;
        const pointY = blob.y + Math.sin(currentPoint.angle) * currentPoint.radius;
        
        // Use bezier curves for smoother, more organic shapes
        // Simpler curves on mobile for better performance
        if (isMobile) {
          // Use quadratic curves on mobile (simpler, better performance)
          const controlX = blob.x + Math.cos(currentPoint.angle - 0.2) * currentPoint.radius * 1.1;
          const controlY = blob.y + Math.sin(currentPoint.angle - 0.2) * currentPoint.radius * 1.1;
          ctx.quadraticCurveTo(controlX, controlY, pointX, pointY);
        } else {
          // Use bezier curves on desktop (more complex, better looking)
          const controlX1 = blob.x + Math.cos(currentPoint.angle - 0.2) * currentPoint.radius * 1.2;
          const controlY1 = blob.y + Math.sin(currentPoint.angle - 0.2) * currentPoint.radius * 1.2;
          const controlX2 = blob.x + Math.cos(currentPoint.angle - 0.1) * currentPoint.radius * 0.8;
          const controlY2 = blob.y + Math.sin(currentPoint.angle - 0.1) * currentPoint.radius * 0.8;
          ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, pointX, pointY);
        }
      }
      
      // Close the path
      ctx.closePath();
      ctx.fill();
    };
    
    // Update blob colors
    const updateBlobColors = () => {
      blobs.forEach(blob => {
        // Smoothly transition current color to target color
        blob.color.r += (blob.color.targetR - blob.color.r) * blob.speed;
        blob.color.g += (blob.color.targetG - blob.color.g) * blob.speed;
        blob.color.b += (blob.color.targetB - blob.color.b) * blob.speed;
        
        // If we're close to the target color, set a new target
        const colorDiff = 
          Math.abs(blob.color.r - blob.color.targetR) + 
          Math.abs(blob.color.g - blob.color.targetG) + 
          Math.abs(blob.color.b - blob.color.targetB);
        
        if (colorDiff < 5) {
          const newTarget = camoColors[Math.floor(Math.random() * camoColors.length)];
          blob.color.targetR = newTarget.r;
          blob.color.targetG = newTarget.g;
          blob.color.targetB = newTarget.b;
        }
      });
    };
    
    // Animation function
    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas with a dark base color
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update blob colors
      updateBlobColors();
      
      // Draw all blobs
      blobs.forEach(drawCamoBlob);
      
      // Continue animation loop
      requestAnimationFrame(animate);
    };
    
    // Initialize and start animation
    initCamoPattern();
    const animationFrame = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [isMobile]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0"
      style={{ 
        opacity: 0.5, 
        mixBlendMode: 'normal'
      }}
    />
  );
};

export default EvolvingCamoBackground;