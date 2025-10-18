"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Title, LoadingOverlay, Alert } from "@mantine/core";
import { createClient } from "@/lib/supabase/client";
import { IconInfoCircle } from "@tabler/icons-react";

export default function CreateSpellPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login with return URL
        router.push(
          "/auth/login?redirect=" + encodeURIComponent("/spells/create"),
        );
      } else {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <Container size="lg" py="xl" pos="relative" mih={400}>
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect, so don't render anything
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Create Custom Spell
      </Title>
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Coming Soon"
        color="blue"
      >
        The spell creation form is not yet implemented. This page is reserved
        for future development.
      </Alert>
      {/* TODO: Add SpellCreateEditForm component when available */}
      {/* <SpellCreateEditForm mode="create" /> */}
    </Container>
  );
}
