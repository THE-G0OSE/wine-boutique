import { ReviewLetters } from "@/widgets/reviewLetters";
import { PageBackground } from "uikit;/";

const ReviewsPage = () => {
  return (
    <div className="relative isolate pt-22 pb-10 lg:pt-42 lg:pb-30">
      <title>Отзывы — письма гостей · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Письма гостей винного бутика о дегустациях, подарках, брони и вечерах в погребе. Напишите нам — каждое письмо читает сомелье."
      />
      <PageBackground />
      <ReviewLetters />
    </div>
  );
};

export default ReviewsPage;
