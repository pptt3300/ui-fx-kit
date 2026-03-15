import { useScrollProgress } from "../hooks";

interface ParallaxHeroProps {
  layers: Array<{ content: React.ReactNode; speed: number }>;
  height?: string;
  className?: string;
}

export default function ParallaxHero({
  layers,
  height = "200vh",
  className = "",
}: ParallaxHeroProps) {
  const { ref, progress } = useScrollProgress({ scope: "element", steps: 200 });

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {layers.map((layer, i) => {
          // progress 0..1; map to translateY shift based on speed
          // Negative speed = moves up (parallax behind), positive = moves with or ahead
          const translateY = (progress - 0.5) * layer.speed * 100;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateY(${translateY}px)`,
                willChange: "transform",
              }}
            >
              {layer.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
