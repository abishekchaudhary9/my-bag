type ProductQuestionsSectionProps = {
  questions: any[];
};

export default function ProductQuestionsSection({ questions }: ProductQuestionsSectionProps) {
  return (
    <section className="py-24 bg-secondary/5">
      <div className="container-luxe space-y-8">
        <div>
          <div className="eyebrow">FAQ</div>
          <h2 className="font-display text-4xl tracking-tight">Questions answered for you.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {questions.slice(0, 4).map((question) => (
            <div key={question.id} className="p-6 bg-background border border-border rounded-3xl">
              <p className="text-sm font-semibold">{question.question}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{question.answer || "Awaiting an expert reply."}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
