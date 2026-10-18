import { formatEventWhen, formatSeats, type NewsAd, type NewsStory } from "@/entities/newsIssue";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { Link } from "react-router";
import StoryImage from "../storyImage/StoryImage";
import StoryBody from "./StoryBody";

interface IProps {
  stories: NewsStory[];
  ads: NewsAd[];
  matches: (rubric: NewsStory["rubric"]) => boolean;
}

const kicker = "text-micro tracking-[0.24em] uppercase";
const titleLink = "text-ink no-underline hover:text-primary-500";

/** Широкий материал с иллюстрацией и текстом в две колонки */
const FeatureStory: FC<{ story: NewsStory }> = ({ story }) => (
  <>
    <span className={kicker}>{story.kicker}</span>
    <h2 className="m-0 font-paper-display text-[clamp(36px,2.6vw,48px)] leading-[1.05] font-normal">
      <Link to={ROUTES.article(story.slug)} className={titleLink}>
        {story.title}
      </Link>
    </h2>
    {story.image && <StoryImage image={story.image} developDelay={1.1} className="aspect-[1000/661]" />}
    <StoryBody paragraphs={story.body} columns={2} />
  </>
);

/** Узкая колонка: анонс события с квадратной иллюстрацией и плашкой «когда и сколько мест» */
const ColumnStory: FC<{ story: NewsStory }> = ({ story }) => (
  <>
    <span className={kicker}>{story.kicker}</span>
    <h2 className="m-0 font-paper-display text-[clamp(28px,1.8vw,34px)] leading-[1.08] font-normal">
      <Link to={ROUTES.article(story.slug)} className={titleLink}>
        {story.title}
      </Link>
    </h2>
    {story.image && <StoryImage image={story.image} developDelay={1.7} withCaption={false} className="aspect-square" />}
    {story.body.map((paragraph, index) => (
      <p key={index} className="m-0 text-justify text-caption leading-[1.6] hyphens-auto">
        {paragraph}
      </p>
    ))}
    {story.event && (
      <div className="border border-ink px-3 py-2.5 text-center text-micro leading-[1.5]">
        Когда: {formatEventWhen(story.event.startsAt)}
        <br />
        Мест: {formatSeats(story.event.seats)} · по предварительной записи
      </div>
    )}
  </>
);

const Ad: FC<{ ad: NewsAd }> = ({ ad }) => (
  <div
    className={cn(
      "flex flex-col items-center gap-1.5 p-3.5 text-center",
      ad.emphasis ? "border-[3px] border-double border-ink" : "border border-ink"
    )}
  >
    {ad.image && <img src={ad.image} alt="" loading="lazy" className="size-37.5 object-contain mix-blend-multiply" />}
    {ad.kicker && <span className="text-[13px] tracking-[0.22em] uppercase">{ad.kicker}</span>}
    <span className="font-paper-display text-lg leading-[1.1]">{ad.title}</span>
    <span className="text-sm leading-[1.5]">{ad.text}</span>
  </div>
);

/** Вторая полоса: широкий материал, колонка-анонс и объявления */
const SecondPage: FC<IProps> = ({ stories, ads, matches }) => {
  const [feature, column] = stories;
  const dim = (story: NewsStory | undefined) => ({ "opacity-30": story !== undefined && !matches(story.rubric) });

  return (
    <div className="mt-7.5 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] border-t-4 border-double border-ink">
      <section className={cn("flex flex-col gap-3 pt-5.5 pr-7 transition-opacity duration-300", dim(feature))}>
        {feature && <FeatureStory story={feature} />}
      </section>
      <section className={cn("flex flex-col gap-3 border-l border-ink px-7 pt-5.5 transition-opacity duration-300", dim(column))}>
        {column && <ColumnStory story={column} />}
      </section>
      <section className="flex flex-col gap-3.5 border-l border-ink pt-5.5 pl-7">
        <h3 className="m-0 border-y border-ink py-1 text-center font-paper-display text-[34px] font-normal">Объявления</h3>
        {ads.map((ad) => (
          <Ad key={ad.title} ad={ad} />
        ))}
      </section>
    </div>
  );
};

export default SecondPage;
