import { useMousePosition, proximity } from "../../hooks";
import "../../css/shimmer.css";

type ShapeType = "line" | "circle" | "rect";

interface ShapeConfig {
  type: ShapeType;
  width?: string;
  height?: string;
}

type PresetKey = "card" | "list-item" | "profile" | "paragraph";

const PRESETS: Record<PresetKey, ShapeConfig[]> = {
  card: [
    { type: "rect", width: "100%", height: "180px" },
    { type: "line", width: "70%", height: "16px" },
    { type: "line", width: "90%", height: "12px" },
    { type: "line", width: "50%", height: "12px" },
  ],
  "list-item": [
    { type: "circle", width: "48px", height: "48px" },
    { type: "line", width: "60%", height: "14px" },
    { type: "line", width: "80%", height: "12px" },
  ],
  profile: [
    { type: "circle", width: "80px", height: "80px" },
    { type: "line", width: "40%", height: "18px" },
    { type: "line", width: "60%", height: "12px" },
    { type: "line", width: "30%", height: "12px" },
  ],
  paragraph: [
    { type: "line", width: "100%", height: "14px" },
    { type: "line", width: "95%", height: "14px" },
    { type: "line", width: "88%", height: "14px" },
    { type: "line", width: "75%", height: "14px" },
    { type: "line", width: "60%", height: "14px" },
  ],
};

interface ShimmerSkeletonProps {
  layout?: ShapeConfig[];
  preset?: PresetKey;
  dark?: boolean;
  className?: string;
}

export default function ShimmerSkeleton({
  layout,
  preset,
  dark = true,
  className = "",
}: ShimmerSkeletonProps) {
  const shapes = layout ?? (preset ? PRESETS[preset] : PRESETS.paragraph);
  const { position, handlers } = useMousePosition({ scope: "element", mode: "state" });

  // Proximity to container center to speed up shimmer
  const containerWidth = 400;
  const containerHeight = 200;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const { force } = proximity(
    { x: position.x, y: position.y },
    { x: centerX, y: centerY },
    { radius: 300, easing: "quadratic" },
  );

  const animationDuration = 1.5 - force * 0.9; // speeds up near cursor

  return (
    <div
      className={`flex flex-col gap-3 p-4 ${className}`}
      {...handlers}
    >
      {shapes.map((shape, i) => {
        const isCircle = shape.type === "circle";
        const isLine = shape.type === "line";

        return (
          <div
            key={i}
            className={`fx-shimmer ${dark ? "fx-shimmer-dark" : "fx-shimmer-light"} ${isLine ? "fx-shimmer-line" : ""} ${isCircle ? "fx-shimmer-circle" : ""}`}
            style={{
              width: shape.width ?? (isCircle ? "48px" : "100%"),
              height: shape.height ?? (isLine ? "1em" : "48px"),
              borderRadius: isCircle ? "50%" : isLine ? 4 : 8,
              animationDuration: `${animationDuration}s`,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}
