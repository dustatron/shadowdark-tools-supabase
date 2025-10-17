'use client';

import { useState } from 'react';
import {
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Text,
  SimpleGrid,
  Switch,
  ActionIcon,
  Divider,
  Select,
  MultiSelect,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { IconSelector } from '../ui/IconSelector';
import { createMonsterSchema } from '@/lib/validations/monster';

// Shadowdark-specific constants
const MOVEMENT_SPEEDS = [
  { value: 'near', label: 'Near (30ft)' },
  { value: 'close', label: 'Close (60ft)' },
  { value: 'far', label: 'Far (120ft+)' },
  { value: 'custom', label: 'Custom' },
];

const ATTACK_TYPES = [
  { value: 'melee', label: 'Melee' },
  { value: 'ranged', label: 'Ranged' },
  { value: 'spell', label: 'Spell' },
];

const COMMON_TAGS = {
  type: [
    'Aberration',
    'Beast',
    'Celestial',
    'Construct',
    'Dragon',
    'Elemental',
    'Fey',
    'Fiend',
    'Giant',
    'Humanoid',
    'Monstrosity',
    'Ooze',
    'Plant',
    'Undead',
  ],
  location: [
    'Dungeon',
    'Forest',
    'Mountain',
    'Swamp',
    'Desert',
    'Ocean',
    'City',
    'Underground',
    'Planar',
    'Arctic',
  ],
};

interface MonsterCreateEditFormProps {
  initialData?: z.infer<typeof createMonsterSchema> & { id?: string };
  onSubmit?: (data: z.infer<typeof createMonsterSchema>) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export function MonsterCreateEditForm({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}: MonsterCreateEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSpeed, setCustomSpeed] = useState(false);

  const form = useForm({
    initialValues: {
      name: initialData?.name || '',
      challenge_level: initialData?.challenge_level || 1,
      hit_points: initialData?.hit_points || 10,
      armor_class: initialData?.armor_class || 10,
      speed: initialData?.speed || 'near',
      customSpeed: '',
      attacks: initialData?.attacks || [],
      abilities: initialData?.abilities || [],
      treasure: initialData?.treasure || null,
      tags: initialData?.tags || { type: [], location: [] },
      source: initialData?.source || 'Custom',
      author_notes: initialData?.author_notes || '',
      icon_url: initialData?.icon_url || '',
      is_public: initialData?.is_public ?? false,
    },
    validate: (values) => {
      try {
        // Transform empty icon_url to undefined for validation
        const validationData = {
          ...values,
          icon_url: values.icon_url || undefined,
        };

        const validationSchema = createMonsterSchema.extend({
          customSpeed: z.string().optional(),
        });
        validationSchema.parse(validationData);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          error.issues.forEach((err) => {
            if (err.path.length > 0) {
              const path = err.path.join('.');
              errors[path] = err.message;
            }
          });
          return errors;
        }
        return {};
      }
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);

    try {
      // Prepare the data
      const submitData = {
        ...values,
        speed: values.speed === 'custom' ? values.customSpeed : values.speed,
        icon_url: values.icon_url || undefined, // Transform empty string to undefined
      };

      // Remove customSpeed field
      const { customSpeed, ...finalData } = submitData;

      if (onSubmit) {
        // Use provided submit handler
        await onSubmit(finalData as z.infer<typeof createMonsterSchema>);
      } else {
        // Default API submission
        const url = mode === 'edit' && initialData?.id
          ? `/api/monsters/${initialData.id}`
          : '/api/monsters';

        const method = mode === 'edit' ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to ${mode} monster`);
        }

        const monster = await response.json();

        notifications.show({
          title: 'Success',
          message: `Monster ${mode === 'create' ? 'created' : 'updated'} successfully!`,
          color: 'green',
          icon: <IconCheck />,
        });

        // Redirect to monster detail page
        router.push(`/monsters/${monster.id}`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing monster:`, error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : `Failed to ${mode} monster`,
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttack = () => {
    form.insertListItem('attacks', {
      name: '',
      type: 'melee',
      damage: '',
      range: '',
      description: '',
    });
  };

  const addAbility = () => {
    form.insertListItem('abilities', {
      name: '',
      description: '',
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Title order={3} mb="md">
            Basic Information
          </Title>

          <Stack gap="md">
            <TextInput
              label="Monster Name"
              placeholder="Enter monster name"
              required
              {...form.getInputProps('name')}
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <NumberInput
                label="Challenge Level"
                placeholder="1-20"
                min={1}
                max={20}
                required
                {...form.getInputProps('challenge_level')}
              />

              <NumberInput
                label="Hit Points"
                placeholder="Minimum 1"
                min={1}
                required
                {...form.getInputProps('hit_points')}
              />

              <NumberInput
                label="Armor Class"
                placeholder="1-21"
                min={1}
                max={21}
                required
                {...form.getInputProps('armor_class')}
              />
            </SimpleGrid>

            <div>
              <Select
                label="Movement Speed"
                placeholder="Select speed"
                data={MOVEMENT_SPEEDS}
                required
                value={customSpeed ? 'custom' : form.values.speed}
                onChange={(value) => {
                  if (value === 'custom') {
                    setCustomSpeed(true);
                  } else {
                    setCustomSpeed(false);
                    form.setFieldValue('speed', value || 'near');
                  }
                }}
              />
              {customSpeed && (
                <TextInput
                  mt="xs"
                  placeholder="e.g., fly 60ft, swim 30ft"
                  {...form.getInputProps('customSpeed')}
                />
              )}
            </div>

            <IconSelector
              label="Monster Icon"
              value={form.values.icon_url}
              onChange={(icon) => form.setFieldValue('icon_url', icon || '')}
            />
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Attacks</Title>
            <Button
              size="sm"
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addAttack}
            >
              Add Attack
            </Button>
          </Group>

          {form.values.attacks.length === 0 && (
            <Alert variant="light" color="gray">
              No attacks added yet. Click "Add Attack" to create one.
            </Alert>
          )}

          <Stack gap="md">
            {form.values.attacks.map((_, index) => (
              <Paper key={index} p="sm" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    Attack #{index + 1}
                  </Text>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => form.removeListItem('attacks', index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    placeholder="Attack name"
                    {...form.getInputProps(`attacks.${index}.name`)}
                  />
                  <Select
                    placeholder="Attack type"
                    data={ATTACK_TYPES}
                    {...form.getInputProps(`attacks.${index}.type`)}
                  />
                  <TextInput
                    placeholder="Damage (e.g., 1d6+2)"
                    {...form.getInputProps(`attacks.${index}.damage`)}
                  />
                  <TextInput
                    placeholder="Range (e.g., reach 5ft)"
                    {...form.getInputProps(`attacks.${index}.range`)}
                  />
                </SimpleGrid>
                <Textarea
                  mt="xs"
                  placeholder="Additional description (optional)"
                  {...form.getInputProps(`attacks.${index}.description`)}
                />
              </Paper>
            ))}
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Abilities</Title>
            <Button
              size="sm"
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addAbility}
            >
              Add Ability
            </Button>
          </Group>

          {form.values.abilities.length === 0 && (
            <Alert variant="light" color="gray">
              No abilities added yet. Click "Add Ability" to create one.
            </Alert>
          )}

          <Stack gap="md">
            {form.values.abilities.map((_, index) => (
              <Paper key={index} p="sm" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    Ability #{index + 1}
                  </Text>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => form.removeListItem('abilities', index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>

                <TextInput
                  placeholder="Ability name"
                  mb="xs"
                  {...form.getInputProps(`abilities.${index}.name`)}
                />
                <Textarea
                  placeholder="Ability description"
                  {...form.getInputProps(`abilities.${index}.description`)}
                />
              </Paper>
            ))}
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Title order={3} mb="md">
            Additional Details
          </Title>

          <Stack gap="md">
            <Textarea
              label="Treasure"
              placeholder="Treasure description (optional)"
              {...form.getInputProps('treasure')}
              onChange={(e) => form.setFieldValue('treasure', e.target.value || null)}
            />

            <MultiSelect
              label="Type Tags"
              placeholder="Select or type monster types"
              data={COMMON_TAGS.type}
              searchable
              clearable
              {...form.getInputProps('tags.type')}
            />

            <MultiSelect
              label="Location Tags"
              placeholder="Select or type locations"
              data={COMMON_TAGS.location}
              searchable
              clearable
              {...form.getInputProps('tags.location')}
            />

            <TextInput
              label="Source"
              placeholder="e.g., Homebrew, Campaign Name"
              {...form.getInputProps('source')}
            />

            <Textarea
              label="Author Notes"
              placeholder="Additional notes or context (optional)"
              {...form.getInputProps('author_notes')}
            />

            <Switch
              label="Make this monster public"
              description="Allow other users to view and use this monster"
              {...form.getInputProps('is_public', { type: 'checkbox' })}
            />
          </Stack>
        </Paper>

        <Group justify="flex-end">
          <Button
            variant="subtle"
            onClick={onCancel || (() => router.back())}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Create Monster' : 'Save Changes'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}