import type { NewsStory } from "@/entities/newsIssue";
import { ROUTES } from "@/shared/config/routes";
import { plural } from "@/shared/lib/plural";
import type { FC } from "react";
import { Link } from "react-router";
import StoryImage from "../storyImage/StoryImage";
import StoryBody from "./StoryBody";

/** Главный материал первой полосы */
const LeadStory: FC<{ story: NewsStory }> = ({ story }) => (
  <section className="flex flex-col gap-3.5 pr-7.5">
    <span className="text-micro tracking-[0.24em] uppercase">{story.kicker}</span>
    <h2 className="m-0 font-paper-display text-[clamp(48px,4vw,76px)] leading-[1.02] font-normal">
      <Link to={ROUTES.article(story.slug)} className="text-ink no-underline hover:text-primary-500">
        {story.title}
      </Link>
    </h2>
    {story.standfirst && <p className="m-0 text-lg leading-[1.35] italic">{story.standfirst}</p>}
    {(story.byline || story.readingMinutes) && (
      <div className="flex justify-between gap-4 border-y border-ink py-1.5 text-[13px] tracking-[0.16em] uppercase">
        <span>{story.byline}</span>
        {story.readingMinutes && (
          <span>
            Чтение — {story.readingMinutes} {plural(story.readingMinutes, ["минута", "минуты", "минут"])}
          </span>
        )}
      </div>
    )}
    {story.image && <StoryImage image={story.image} developDelay={0.4} className="aspect-[930/652]" />}
    <StoryBody paragraphs={story.body} columns={3} className="mt-2" />
  </section>
);

export default LeadStory;
