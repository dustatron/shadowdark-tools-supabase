import { Container, Title } from "@mantine/core";
import { MonsterCreateEditForm } from "@/src/components/monsters/MonsterCreateEditForm";

export default function CreateMonsterPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Create Custom Monster
      </Title>
      <MonsterCreateEditForm mode="create" />
    </Container>
  );
}
