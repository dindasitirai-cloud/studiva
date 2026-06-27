import { ProfileCard } from "./profile-card";

export default function DemoOne() {
  return (
    <ProfileCard
      name="Bunda Sari"
      title="Tier 1 Parent at Studiva"
      childrenCount={1}
      updatesCount={5}
      consultationsCount={2}
      subscriptionProgress={42}
    />
  );
}
