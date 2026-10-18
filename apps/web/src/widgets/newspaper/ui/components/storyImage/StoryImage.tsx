import type { NewsStory } from "@/entities/newsIssue";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";

interface IProps {
  image: NonNullable<NewsStory["image"]>;
  /** Задержка «проявки» в секундах — иллюстрации на полосе проявляются по очереди */
  developDelay?: number;
  className?: string;
  withCaption?: boolean;
}

/** Газетная иллюстрация: печатается «в краску» (multiply) и проявляется, как фотография */
const StoryImage: FC<IProps> = ({ image, developDelay = 0, className, withCaption = true }) => {
  const img = (
    <img
      src={image.src}
      alt={image.alt}
      loading="lazy"
      className={cn("block w-full animate-develop border border-ink object-cover mix-blend-multiply", className)}
      style={{ animationDelay: `${developDelay}s` }}
    />
  );

  if (!withCaption || !image.caption) return img;

  return (
    <figure className="m-0 mt-1.5">
      {img}
      <figcaption className="mt-2 text-[17px] italic">{image.caption}</figcaption>
    </figure>
  );
};

export default StoryImage;
