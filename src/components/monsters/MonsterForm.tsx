'use client';

import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Group,
  MultiSelect,
  Select,
  Card,
  Text,
  ActionIcon,
  Divider,
  Grid,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

interface Attack {
  name: string;
  type: 'melee' | 'ranged';
  damage: string;
  range: string;
  description: string;
}

interface Ability {
  name: string;
  description: string;
}

interface MonsterFormData {
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Attack[];
  abilities: Ability[];
  tags: {
    type: string[];
    location: string[];
  };
  author_notes: string;
}

interface Monster extends MonsterFormData {
  id?: string;
  source?: string;
  monster_type?: 'official' | 'user';
}

interface MonsterFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: MonsterFormData) => Promise<void>;
  monster?: Monster | null;
  loading?: boolean;
}

const MONSTER_TYPES = [
  'beast', 'celestial', 'dragon', 'elemental', 'fey', 'fiend',
  'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'
];

const LOCATIONS = [
  'any', 'cave', 'city', 'coastal', 'desert', 'dungeon',
  'forest', 'mountain', 'plains', 'swamp', 'underground', 'water'
];

const ATTACK_TYPES = [
  { value: 'melee', label: 'Melee' },
  { value: 'ranged', label: 'Ranged' }
];

export function MonsterForm({
  opened,
  onClose,
  onSubmit,
  monster = null,
  loading = false
}: MonsterFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MonsterFormData>({
    initialValues: {
      name: monster?.name || '',
      challenge_level: monster?.challenge_level || 1,
      hit_points: monster?.hit_points || 10,
      armor_class: monster?.armor_class || 10,
      speed: monster?.speed || 'near',
      attacks: monster?.attacks || [],
      abilities: monster?.abilities || [],
      tags: {
        type: monster?.tags?.type || [],
        location: monster?.tags?.location || []
      },
      author_notes: monster?.author_notes || ''
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Name is required' : null),
      challenge_level: (value) => (value < 1 || value > 20 ? 'Challenge level must be 1-20' : null),
      hit_points: (value) => (value < 1 ? 'Hit points must be at least 1' : null),
      armor_class: (value) => (value < 1 || value > 25 ? 'Armor class must be 1-25' : null),
      speed: (value) => (value.length < 1 ? 'Speed is required' : null),
      'tags.type': (value) => (value.length === 0 ? 'At least one monster type is required' : null),
      'tags.location': (value) => (value.length === 0 ? 'At least one location is required' : null)
    }
  });

  const handleSubmit = async (values: MonsterFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(values);
      form.reset();
      onClose();
      notifications.show({
        title: 'Success',
        message: `Monster ${monster ? 'updated' : 'created'} successfully`,
        color: 'green'
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || `Failed to ${monster ? 'update' : 'create'} monster`,
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addAttack = () => {
    form.insertListItem('attacks', {
      name: '',
      type: 'melee' as const,
      damage: '1d6',
      range: 'close',
      description: ''
    });
  };

  const removeAttack = (index: number) => {
    form.removeListItem('attacks', index);
  };

  const addAbility = () => {
    form.insertListItem('abilities', {
      name: '',
      description: ''
    });
  };

  const removeAbility = (index: number) => {
    form.removeListItem('abilities', index);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={monster ? 'Edit Monster' : 'Create Monster'}
      size="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Info */}
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Name"
                placeholder="Monster name"
                required
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Challenge Level"
                placeholder="1-20"
                min={1}
                max={20}
                required
                {...form.getInputProps('challenge_level')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Hit Points"
                placeholder="HP"
                min={1}
                required
                {...form.getInputProps('hit_points')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Armor Class"
                placeholder="AC"
                min={1}
                max={25}
                required
                {...form.getInputProps('armor_class')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Speed"
                placeholder="e.g., near, far, close"
                required
                {...form.getInputProps('speed')}
              />
            </Grid.Col>
          </Grid>

          {/* Tags */}
          <Grid>
            <Grid.Col span={6}>
              <MultiSelect
                label="Monster Types"
                placeholder="Select types"
                data={MONSTER_TYPES}
                required
                {...form.getInputProps('tags.type')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <MultiSelect
                label="Locations"
                placeholder="Select locations"
                data={LOCATIONS}
                required
                {...form.getInputProps('tags.location')}
              />
            </Grid.Col>
          </Grid>

          {/* Attacks */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Attacks</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={addAttack}
              >
                Add Attack
              </Button>
            </Group>

            <Stack gap="xs">
              {form.values.attacks.map((attack, index) => (
                <Card key={index} withBorder p="sm">
                  <Grid>
                    <Grid.Col span={4}>
                      <TextInput
                        placeholder="Attack name"
                        {...form.getInputProps(`attacks.${index}.name`)}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Select
                        data={ATTACK_TYPES}
                        {...form.getInputProps(`attacks.${index}.type`)}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <TextInput
                        placeholder="1d6+2"
                        {...form.getInputProps(`attacks.${index}.damage`)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <TextInput
                        placeholder="Range"
                        {...form.getInputProps(`attacks.${index}.range`)}
                      />
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeAttack(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        placeholder="Attack description (optional)"
                        {...form.getInputProps(`attacks.${index}.description`)}
                      />
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Abilities */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Abilities</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={addAbility}
              >
                Add Ability
              </Button>
            </Group>

            <Stack gap="xs">
              {form.values.abilities.map((ability, index) => (
                <Card key={index} withBorder p="sm">
                  <Grid>
                    <Grid.Col span={11}>
                      <TextInput
                        placeholder="Ability name"
                        mb="xs"
                        {...form.getInputProps(`abilities.${index}.name`)}
                      />
                      <Textarea
                        placeholder="Ability description"
                        autosize
                        minRows={2}
                        {...form.getInputProps(`abilities.${index}.description`)}
                      />
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeAbility(index)}
                        mt="xl"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Notes */}
          <Textarea
            label="Author Notes"
            placeholder="Additional notes about this monster..."
            autosize
            minRows={3}
            {...form.getInputProps('author_notes')}
          />

          <Divider />

          {/* Actions */}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting || loading}
            >
              {monster ? 'Update Monster' : 'Create Monster'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}