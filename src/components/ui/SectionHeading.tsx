import type { ReactNode } from "react";

type SectionHeadingProps = {
  align?: "left" | "center";
  description?: ReactNode;
  eyebrow: string;
  title: ReactNode;
};

export default function SectionHeading({
  align = "left",
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={["space-y-5", isCenter ? "mx-auto max-w-3xl text-center" : "max-w-3xl"].join(" ")}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-[clamp(2.6rem,5vw,5.8rem)] leading-[0.92] text-ink">
        {title}
      </h2>
      {description ? (
        <div className="text-base leading-7 text-ink-muted md:text-lg">{description}</div>
      ) : null}
    </div>
  );
}
