import { useTypewriter } from "../../hooks";

interface Props {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export default function TypewriterText({
  phrases,
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseDuration = 2000,
}: Props) {
  const { text, phase } = useTypewriter({
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop: phrases.length > 1,
  });

  return (
    <span className="inline-flex items-center">
      <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
        {text}
      </span>
      <span
        className="inline-block w-[2px] h-[1.1em] ml-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500"
        style={{
          animation: "cursor-blink 0.8s ease-in-out infinite",
        }}
      />
    </span>
  );
}
