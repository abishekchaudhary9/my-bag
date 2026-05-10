type ProductReviewsSectionProps = {
  rating: number;
  reviews: number;
  reviewList: any[];
};

export default function ProductReviewsSection({ rating, reviews, reviewList }: ProductReviewsSectionProps) {
  return (
    <section className="py-24">
      <div className="container-luxe space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">What buyers say</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">Loved for its quiet luxury.</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold">{rating.toFixed(1)}</p>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Based on {reviews} reviews</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {reviewList.slice(0, 4).map((review) => (
            <div key={review.id} className="p-6 bg-background border border-border rounded-3xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="font-semibold">{review.author}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{review.stars}★</div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{review.message}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
