import { PremiumCard } from "@/components/ui/premium-card";
import { Section, Container } from "@/components/shared";

function ExampleSection() {
  return (
    <Section>
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PremiumCard
            title="Oceanfront Restaurant"
            description="Fine dining with sunset views"
            imageUrl="/images/restaurant-1.jpg"
          />
          <PremiumCard
            title="Championship Golf Course"
            description="18-hole par 72 course"
            imageUrl="/images/golf-1.jpg"
          />
          <PremiumCard
            title="Premium Villa"
            description="5 bedrooms with pool"
            imageUrl="/images/villa-1.jpg"
          />
        </div>
      </Container>
    </Section>
  );
}