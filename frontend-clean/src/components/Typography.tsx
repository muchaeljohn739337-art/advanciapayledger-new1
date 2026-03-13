import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TypographyProps {
  variant?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  marketingVariant?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold";
  leading?: "tight" | "normal" | "relaxed";
  family?: "sans" | "mono" | "display";
  className?: string;
  children: ReactNode;
  as?: ElementType;
}

export function Typography({
  variant,
  marketingVariant,
  weight = "normal",
  leading = "normal",
  family = "sans",
  className,
  children,
  as: Component = "span",
}: TypographyProps) {
  const getVariantClasses = () => {
    if (marketingVariant) {
      return `marketing-${marketingVariant}`;
    }
    if (variant) {
      return `text-${variant}`;
    }
    return "text-base";
  };

  const classes = cn(
    getVariantClasses(),
    `font-${weight}`,
    `leading-${leading}`,
    `font-${family}`,
    className
  );

  return <Component className={classes}>{children}</Component>;
}

// Specialized typography components
type HeadingProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  marketing?: boolean;
  className?: string;
  children: ReactNode;
};

export function Heading({
  level,
  marketing = false,
  className,
  children,
}: HeadingProps) {
  const getHeadingClasses = () => {
    if (marketing) {
      switch (level) {
        case 1:
          return "marketing-5xl font-bold leading-tight";
        case 2:
          return "marketing-3xl font-semibold leading-tight";
        case 3:
          return "marketing-xl font-semibold leading-tight";
        case 4:
          return "marketing-lg font-medium leading-tight";
        case 5:
          return "marketing-base font-medium leading-normal";
        case 6:
          return "marketing-sm font-medium leading-normal";
        default:
          return "marketing-3xl font-semibold leading-tight";
      }
    } else {
      switch (level) {
        case 1:
          return "text-3xl font-bold leading-tight";
        case 2:
          return "text-2xl font-semibold leading-tight";
        case 3:
          return "text-xl font-semibold leading-tight";
        case 4:
          return "text-lg font-medium leading-tight";
        case 5:
          return "text-base font-medium leading-normal";
        case 6:
          return "text-sm font-medium leading-normal";
        default:
          return "text-2xl font-semibold leading-tight";
      }
    }
  };

  const Component = `h${level}` as ElementType;
  const classes = cn(getHeadingClasses(), className);

  return <Component className={classes}>{children}</Component>;
}

type BodyProps = {
  size?: "sm" | "base" | "lg";
  marketing?: boolean;
  className?: string;
  children: ReactNode;
};

export function Body({
  size = "base",
  marketing = false,
  className,
  children,
}: BodyProps) {
  const getBodyClasses = () => {
    if (marketing) {
      switch (size) {
        case "sm":
          return "marketing-sm leading-relaxed";
        case "lg":
          return "marketing-lg leading-relaxed";
        default:
          return "marketing-base leading-relaxed";
      }
    } else {
      switch (size) {
        case "sm":
          return "text-sm leading-normal";
        case "lg":
          return "text-lg leading-normal";
        default:
          return "text-base leading-normal";
      }
    }
  };

  const classes = cn(getBodyClasses(), className);

  return <p className={classes}>{children}</p>;
}

type CaptionProps = {
  marketing?: boolean;
  className?: string;
  children: ReactNode;
};

export function Caption({
  marketing = false,
  className,
  children,
}: CaptionProps) {
  const classes = cn(
    marketing ? "marketing-xs" : "text-xs",
    "leading-normal",
    className
  );

  return <span className={classes}>{children}</span>;
}

type LabelProps = {
  marketing?: boolean;
  className?: string;
  children: ReactNode;
};

export function Label({
  marketing = false,
  className,
  children,
}: LabelProps) {
  const classes = cn(
    marketing ? "marketing-sm" : "text-sm",
    "font-medium",
    "leading-normal",
    className
  );

  return <span className={classes}>{children}</span>;
}

// Utility component for readable content
type ReadableContentProps = {
  maxWidth?: "narrow" | "readable" | "wide";
  className?: string;
  children: ReactNode;
};

export function ReadableContent({
  maxWidth = "readable",
  className,
  children,
}: ReadableContentProps) {
  const classes = cn(`text-${maxWidth}`, "leading-relaxed", className);

  return <div className={classes}>{children}</div>;
}

// Marketing-specific components
type MarketingHeadingProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: ReactNode;
};

export function MarketingHeading({
  level,
  className,
  children,
}: MarketingHeadingProps) {
  return (
    <Heading level={level} marketing className={className}>
      {children}
    </Heading>
  );
}

type MarketingBodyProps = {
  size?: "sm" | "base" | "lg";
  className?: string;
  children: ReactNode;
};

export function MarketingBody({
  size = "base",
  className,
  children,
}: MarketingBodyProps) {
  return (
    <Body size={size} marketing className={className}>
      {children}
    </Body>
  );
}

type MarketingCaptionProps = {
  className?: string;
  children: ReactNode;
};

export function MarketingCaption({
  className,
  children,
}: MarketingCaptionProps) {
  return (
    <Caption marketing className={className}>
      {children}
    </Caption>
  );
}

// Platform-specific components
type PlatformHeadingProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: ReactNode;
};

export function PlatformHeading({
  level,
  className,
  children,
}: PlatformHeadingProps) {
  return (
    <Heading level={level} marketing={false} className={className}>
      {children}
    </Heading>
  );
}

type PlatformBodyProps = {
  size?: "sm" | "base" | "lg";
  className?: string;
  children: ReactNode;
};

export function PlatformBody({
  size = "base",
  className,
  children,
}: PlatformBodyProps) {
  return (
    <Body size={size} marketing={false} className={className}>
      {children}
    </Body>
  );
}

type PlatformCaptionProps = {
  className?: string;
  children: ReactNode;
};

export function PlatformCaption({
  className,
  children,
}: PlatformCaptionProps) {
  return (
    <Caption marketing={false} className={className}>
      {children}
    </Caption>
  );
}

export default Typography;
