import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { uuidv7 } from 'uuidv7';
import { auth } from '@/lib/auth';
import { env } from '@/config/env';
import * as schema from '@/db/schemas';

const db = drizzle(env.databaseUrl, { schema });

const PASSWORD = '@Minhasenha123';

const FIXED_DATES = {
  monday: new Date('2026-03-02T10:00:00Z'),
  tuesday: new Date('2026-03-03T10:00:00Z'),
  wednesday: new Date('2026-03-04T10:00:00Z'),
  thursday: new Date('2026-03-05T10:00:00Z'),
  friday: new Date('2026-03-06T10:00:00Z'),
  saturday: new Date('2026-03-07T10:00:00Z'),
  sunday: new Date('2026-03-08T10:00:00Z'),
};

const WORKOUT_IMAGES = {
  benchPress: 'https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=1600',
  squat: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1600',
  deadlift: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600',
  shoulderPress: 'https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=1600',
  pullUp: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600',
  row: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600',
  abs: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1600',
  cardio: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600',
  hiit: 'https://images.pexels.com/photos/4765369/pexels-photo-4765369.jpeg?auto=compress&cs=tinysrgb&w=1600',
  rest: 'https://images.pexels.com/photos/3823519/pexels-photo-3823519.jpeg?auto=compress&cs=tinysrgb&w=1600',
  stretch: 'https://images.pexels.com/photos/3823519/pexels-photo-3823519.jpeg?auto=compress&cs=tinysrgb&w=1600',
  functional: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1600',
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const USERS_CONFIG = [
  {
    name: 'Rafael Oliveira',
    email: 'rafael.oliveira@example.com',
    image: avatar('rafael-power'),
  },
  {
    name: 'Fernanda Castro',
    email: 'fernanda.castro@example.com',
    image: avatar('fernanda-funcional'),
  },
  {
    name: 'Lucas Mendonça',
    email: 'lucas.mendonca@example.com',
    image: avatar('lucas-hipertrofia'),
  },
  {
    name: 'Beatriz Lima',
    email: 'beatriz.lima@example.com',
    image: avatar('beatriz-hiit'),
  },
  {
    name: 'Carlos Santos',
    email: 'carlos.santos@example.com',
    image: avatar('carlos-iniciante'),
  },
] as const;

async function seed() {
  console.log('Limpando banco de dados...');
  try {
    await db.execute(sql`
      TRUNCATE TABLE "workout_exercises", "workout_days", "workout_plans",
                     "user_workout_sessions", "session", "account",
                     "verification", "user"
      RESTART IDENTITY CASCADE;
    `);
    console.log('✓ Banco limpo com sucesso\n');
  } catch (err) {
    console.error('Aviso ao limpar banco:', err);
  }

  console.log('Iniciando seed...\n');

  console.log('Criando usuários...');
  const createdUsers: Record<string, string> = {};

  for (const user of USERS_CONFIG) {
    try {
      try {
        await auth.api.signUpEmail({
          body: {
            email: user.email,
            password: PASSWORD,
            name: user.name,
            image: user.image,
          },
        });
      } catch (err: any) {
        if (!err?.message?.includes('already exists') && err?.code !== 'USER_ALREADY_EXISTS') {
          throw err;
        }
      }

      const [dbUser] = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(sql`${schema.user.email} = ${user.email}`)
        .limit(1);

      if (!dbUser?.id) {
        throw new Error(`Falha ao criar usuário ${user.email}`);
      }

      createdUsers[user.email] = dbUser.id;

      await db
        .update(schema.user)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(sql`${schema.user.email} = ${user.email}`);

      console.log(`  ✓ ${user.name}`);
    } catch (err: any) {
      console.error(`  ✗ Erro ao criar ${user.name}:`, err.message);
      throw err;
    }
  }

  console.log(`Total: ${Object.keys(createdUsers).length} usuários\n`);

  console.log('Criando planos de treino...');

  const plansData = [
    {
      id: uuidv7(),
      name: 'Powerlifting Elite',
      userId: createdUsers['rafael.oliveira@example.com'],
    },
    {
      id: uuidv7(),
      name: 'Funcional Performance',
      userId: createdUsers['fernanda.castro@example.com'],
    },
    {
      id: uuidv7(),
      name: 'PPL Hipertrofia',
      userId: createdUsers['lucas.mendonca@example.com'],
    },
    {
      id: uuidv7(),
      name: 'HIIT Revolution',
      userId: createdUsers['beatriz.lima@example.com'],
    },
    {
      id: uuidv7(),
      name: 'Full Body Iniciante',
      userId: createdUsers['carlos.santos@example.com'],
    },
  ];

  const plans = plansData.map(p => ({
    ...p,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(schema.workoutPlans).values(plans);
  console.log(`✓ ${plans.length} planos criados\n`);

  const plansByEmail = new Map<string, string>();
  plans.forEach((plan, idx) => {
    plansByEmail.set(USERS_CONFIG[idx].email, plan.id);
  });

  console.log('Criando dias de treino...');

  const daysData = [
    {
      name: 'Leg Day',
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      weekDay: 'monday' as const,
      isRest: false,
      estimatedDurationInSeconds: 5400,
      coverImageUrl: WORKOUT_IMAGES.squat,
    },
    {
      name: 'Bench Day',
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      weekDay: 'tuesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 5400,
      coverImageUrl: WORKOUT_IMAGES.benchPress,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      weekDay: 'wednesday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Deadlift Day',
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      weekDay: 'thursday' as const,
      isRest: false,
      estimatedDurationInSeconds: 6000,
      coverImageUrl: WORKOUT_IMAGES.deadlift,
    },
    {
      name: 'Overhead Press',
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      weekDay: 'friday' as const,
      isRest: false,
      estimatedDurationInSeconds: 4800,
      coverImageUrl: WORKOUT_IMAGES.shoulderPress,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      weekDay: 'saturday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      weekDay: 'sunday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Upper Body Functional',
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      weekDay: 'monday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3600,
      coverImageUrl: WORKOUT_IMAGES.functional,
    },
    {
      name: 'Lower Body + Glutes',
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      weekDay: 'tuesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3600,
      coverImageUrl: WORKOUT_IMAGES.squat,
    },
    {
      name: 'Core + Stability',
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      weekDay: 'wednesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 2700,
      coverImageUrl: WORKOUT_IMAGES.abs,
    },
    {
      name: 'Mobility and Stretching',
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      weekDay: 'thursday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.stretch,
    },
    {
      name: 'Cardio + Conditioning',
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      weekDay: 'friday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3000,
      coverImageUrl: WORKOUT_IMAGES.cardio,
    },
    {
      name: 'Active Rest',
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      weekDay: 'saturday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      weekDay: 'sunday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Push A - Chest, Shoulders, Triceps',
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      weekDay: 'monday' as const,
      isRest: false,
      estimatedDurationInSeconds: 4200,
      coverImageUrl: WORKOUT_IMAGES.benchPress,
    },
    {
      name: 'Pull A - Back, Biceps',
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      weekDay: 'tuesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 4200,
      coverImageUrl: WORKOUT_IMAGES.pullUp,
    },
    {
      name: 'Legs A - Quads, Hamstrings',
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      weekDay: 'wednesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 4800,
      coverImageUrl: WORKOUT_IMAGES.squat,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      weekDay: 'thursday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Push B - Volume Focus',
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      weekDay: 'friday' as const,
      isRest: false,
      estimatedDurationInSeconds: 4500,
      coverImageUrl: WORKOUT_IMAGES.shoulderPress,
    },
    {
      name: 'Pull B - Thickness Focus',
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      weekDay: 'saturday' as const,
      isRest: false,
      estimatedDurationInSeconds: 4500,
      coverImageUrl: WORKOUT_IMAGES.row,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      weekDay: 'sunday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'HIIT Full Body Metabolic',
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      weekDay: 'monday' as const,
      isRest: false,
      estimatedDurationInSeconds: 2400,
      coverImageUrl: WORKOUT_IMAGES.hiit,
    },
    {
      name: 'Mobility + Yoga Flow',
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      weekDay: 'tuesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3000,
      coverImageUrl: WORKOUT_IMAGES.stretch,
    },
    {
      name: 'HIIT Lower Body',
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      weekDay: 'wednesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 2400,
      coverImageUrl: WORKOUT_IMAGES.hiit,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      weekDay: 'thursday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'HIIT Upper Body',
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      weekDay: 'friday' as const,
      isRest: false,
      estimatedDurationInSeconds: 2700,
      coverImageUrl: WORKOUT_IMAGES.hiit,
    },
    {
      name: 'Deep Mobility',
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      weekDay: 'saturday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3600,
      coverImageUrl: WORKOUT_IMAGES.stretch,
    },
    {
      name: 'Active Rest',
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      weekDay: 'sunday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Full Body A',
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      weekDay: 'monday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3000,
      coverImageUrl: WORKOUT_IMAGES.functional,
    },
    {
      name: 'Full Body B',
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      weekDay: 'tuesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3000,
      coverImageUrl: WORKOUT_IMAGES.functional,
    },
    {
      name: 'Full Body C',
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      weekDay: 'wednesday' as const,
      isRest: false,
      estimatedDurationInSeconds: 3000,
      coverImageUrl: WORKOUT_IMAGES.functional,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      weekDay: 'thursday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Light Cardio',
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      weekDay: 'friday' as const,
      isRest: false,
      estimatedDurationInSeconds: 1800,
      coverImageUrl: WORKOUT_IMAGES.cardio,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      weekDay: 'saturday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
    {
      name: 'Descanso',
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      weekDay: 'sunday' as const,
      isRest: true,
      estimatedDurationInSeconds: null,
      coverImageUrl: WORKOUT_IMAGES.rest,
    },
  ];

  const days = daysData.map(d => ({
    ...d,
    id: uuidv7(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(schema.workoutDays).values(days);
  console.log(`✓ ${days.length} dias criados\n`);

  const daysByPlanAndWeek = new Map<string, Map<string, string>>();
  days.forEach(day => {
    if (!daysByPlanAndWeek.has(day.workoutPlanId)) {
      daysByPlanAndWeek.set(day.workoutPlanId, new Map());
    }
    daysByPlanAndWeek.get(day.workoutPlanId)!.set(day.weekDay, day.id);
  });

  console.log('Criando exercícios...');

  const exercisesData = [
    {
      name: 'Barbell Squat',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 240,
      workoutDayId: days.find(d => d.name === 'Leg Day')!.id,
      order: 1,
    },
    {
      name: 'Front Squat',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: days.find(d => d.name === 'Leg Day')!.id,
      order: 2,
    },
    {
      name: 'Leg Press',
      sets: 4,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: days.find(d => d.name === 'Leg Day')!.id,
      order: 3,
    },
    {
      name: 'Leg Extension',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Leg Day')!.id,
      order: 4,
    },
    {
      name: 'Leg Curl',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Leg Day')!.id,
      order: 5,
    },
    {
      name: 'Standing Calf Raise',
      sets: 4,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Leg Day')!.id,
      order: 6,
    },
    {
      name: 'Bench Press',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 240,
      workoutDayId: days.find(d => d.name === 'Bench Day')!.id,
      order: 1,
    },
    {
      name: 'Incline Dumbbell Press',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: days.find(d => d.name === 'Bench Day')!.id,
      order: 2,
    },
    {
      name: 'Chest Fly',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: days.find(d => d.name === 'Bench Day')!.id,
      order: 3,
    },
    {
      name: 'Skull Crusher',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Bench Day')!.id,
      order: 4,
    },
    {
      name: 'Rope Tricep Extension',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Bench Day')!.id,
      order: 5,
    },
    {
      name: 'Deadlift',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 300,
      workoutDayId: days.find(d => d.name === 'Deadlift Day')!.id,
      order: 1,
    },
    {
      name: 'Bent Over Row',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: days.find(d => d.name === 'Deadlift Day')!.id,
      order: 2,
    },
    {
      name: 'Wide Grip Lat Pulldown',
      sets: 4,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: days.find(d => d.name === 'Deadlift Day')!.id,
      order: 3,
    },
    {
      name: 'Straight Bar Curl',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Deadlift Day')!.id,
      order: 4,
    },
    {
      name: 'Hammer Curl',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Deadlift Day')!.id,
      order: 5,
    },
    {
      name: 'Military Press',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 240,
      workoutDayId: days.find(d => d.name === 'Overhead Press')!.id,
      order: 1,
    },
    {
      name: 'Arnold Press',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: days.find(d => d.name === 'Overhead Press')!.id,
      order: 2,
    },
    {
      name: 'Lateral Raise',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 120,
      workoutDayId: days.find(d => d.name === 'Overhead Press')!.id,
      order: 3,
    },
    {
      name: 'Front Raise',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Overhead Press')!.id,
      order: 4,
    },
    {
      name: 'Barbell Shrug',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Overhead Press')!.id,
      order: 5,
    },
    {
      name: 'Diamond Push-up',
      sets: 4,
      reps: 12,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Upper Body Functional')!.id,
      order: 1,
    },
    {
      name: 'Low Row Triangle',
      sets: 4,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Upper Body Functional')!.id,
      order: 2,
    },
    {
      name: 'Dumbbell Press',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Upper Body Functional')!.id,
      order: 3,
    },
    {
      name: 'Close Grip Lat Pulldown',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Upper Body Functional')!.id,
      order: 4,
    },
    {
      name: 'Lateral Raise',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Upper Body Functional')!.id,
      order: 5,
    },
    {
      name: 'Cable Tricep',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Upper Body Functional')!.id,
      order: 6,
    },
    {
      name: 'Goblet Squat',
      sets: 4,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Lower Body + Glutes')!.id,
      order: 1,
    },
    {
      name: 'Dumbbell Lunge',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Lower Body + Glutes')!.id,
      order: 2,
    },
    {
      name: 'Hip Thrust',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Lower Body + Glutes')!.id,
      order: 3,
    },
    {
      name: 'Abductor Machine',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Lower Body + Glutes')!.id,
      order: 4,
    },
    {
      name: 'Leg Curl',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Lower Body + Glutes')!.id,
      order: 5,
    },
    {
      name: 'Standing Calf Raise',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Lower Body + Glutes')!.id,
      order: 6,
    },
    {
      name: 'Plank',
      sets: 4,
      reps: 60,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Core + Stability')!.id,
      order: 1,
    },
    {
      name: 'Ab Machine',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Core + Stability')!.id,
      order: 2,
    },
    {
      name: 'Side Plank',
      sets: 3,
      reps: 45,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Core + Stability')!.id,
      order: 3,
    },
    {
      name: 'Lower Ab Crunch',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Core + Stability')!.id,
      order: 4,
    },
    {
      name: 'Plank Shoulder Tap',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Core + Stability')!.id,
      order: 5,
    },
    {
      name: 'V-up Crunch',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Core + Stability')!.id,
      order: 6,
    },
    {
      name: 'Jumping Jacks',
      sets: 3,
      reps: 60,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'Cardio + Conditioning')!.id,
      order: 1,
    },
    {
      name: 'Mountain Climbers',
      sets: 3,
      reps: 45,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'Cardio + Conditioning')!.id,
      order: 2,
    },
    {
      name: 'Box Jumps',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Cardio + Conditioning')!.id,
      order: 3,
    },
    {
      name: 'Jump Rope',
      sets: 3,
      reps: 60,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'Cardio + Conditioning')!.id,
      order: 4,
    },
    {
      name: 'Bench Press',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: days.find(d => d.name === 'Push A - Chest, Shoulders, Triceps')!.id,
      order: 1,
    },
    {
      name: 'Dumbbell Press',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: days.find(d => d.name === 'Push A - Chest, Shoulders, Triceps')!.id,
      order: 2,
    },
    {
      name: 'Incline Chest Fly',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Push A - Chest, Shoulders, Triceps')!.id,
      order: 3,
    },
    {
      name: 'Rope Tricep',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Push A - Chest, Shoulders, Triceps')!.id,
      order: 4,
    },
    {
      name: 'Lateral Raise',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Push A - Chest, Shoulders, Triceps')!.id,
      order: 5,
    },
    {
      name: 'Wide Grip Lat Pulldown',
      sets: 4,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: days.find(d => d.name === 'Pull A - Back, Biceps')!.id,
      order: 1,
    },
    {
      name: 'Bent Over Row',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 150,
      workoutDayId: days.find(d => d.name === 'Pull A - Back, Biceps')!.id,
      order: 2,
    },
    {
      name: 'Straight Bar Curl',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Pull A - Back, Biceps')!.id,
      order: 3,
    },
    {
      name: 'Low Row',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Pull A - Back, Biceps')!.id,
      order: 4,
    },
    {
      name: 'Hammer Curl',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Pull A - Back, Biceps')!.id,
      order: 5,
    },
    {
      name: 'Barbell Squat',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: days.find(d => d.name === 'Legs A - Quads, Hamstrings')!.id,
      order: 1,
    },
    {
      name: 'Leg Press',
      sets: 4,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: days.find(d => d.name === 'Legs A - Quads, Hamstrings')!.id,
      order: 2,
    },
    {
      name: 'Leg Extension',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Legs A - Quads, Hamstrings')!.id,
      order: 3,
    },
    {
      name: 'Leg Curl',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: days.find(d => d.name === 'Legs A - Quads, Hamstrings')!.id,
      order: 4,
    },
    {
      name: 'Standing Calf Raise',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Legs A - Quads, Hamstrings')!.id,
      order: 5,
    },
    {
      name: 'Burpees',
      sets: 5,
      reps: 15,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'HIIT Full Body Metabolic')!.id,
      order: 1,
    },
    {
      name: 'Mountain Climbers',
      sets: 5,
      reps: 30,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'HIIT Full Body Metabolic')!.id,
      order: 2,
    },
    {
      name: 'Jump Squats',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'HIIT Full Body Metabolic')!.id,
      order: 3,
    },
    {
      name: 'Jumping Jacks',
      sets: 4,
      reps: 40,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'HIIT Full Body Metabolic')!.id,
      order: 4,
    },
    {
      name: 'Jump Rope',
      sets: 5,
      reps: 60,
      restTimeInSeconds: 30,
      workoutDayId: days.find(d => d.name === 'HIIT Full Body Metabolic')!.id,
      order: 5,
    },
    {
      name: 'Bodyweight Squat',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Full Body A')!.id,
      order: 1,
    },
    {
      name: 'Push-up',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Full Body A')!.id,
      order: 2,
    },
    {
      name: 'Dumbbell Row',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Full Body A')!.id,
      order: 3,
    },
    {
      name: 'Dumbbell Press',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 60,
      workoutDayId: days.find(d => d.name === 'Full Body A')!.id,
      order: 4,
    },
    {
      name: 'Plank',
      sets: 3,
      reps: 30,
      restTimeInSeconds: 45,
      workoutDayId: days.find(d => d.name === 'Full Body A')!.id,
      order: 5,
    },
  ];

  const exercises = exercisesData.map(e => ({
    id: uuidv7(),
    ...e,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(schema.workoutExercises).values(exercises);
  console.log(`✓ ${exercises.length} exercícios criados\n`);

  console.log('Criando sessões de treino...');

  const sessionsData: Array<{
    userId: string;
    workoutPlanId: string;
    workoutDayId: string;
    startedAt: Date;
    completedAt: Date | null;
  }> = [
    {
      userId: createdUsers['rafael.oliveira@example.com'],
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('rafael.oliveira@example.com')!)!.get('monday')!,
      startedAt: FIXED_DATES.monday,
      completedAt: new Date(FIXED_DATES.monday.getTime() + 88 * 60 * 1000),
    },
    {
      userId: createdUsers['rafael.oliveira@example.com'],
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('rafael.oliveira@example.com')!)!.get('tuesday')!,
      startedAt: FIXED_DATES.tuesday,
      completedAt: new Date(FIXED_DATES.tuesday.getTime() + 85 * 60 * 1000),
    },
    {
      userId: createdUsers['rafael.oliveira@example.com'],
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('rafael.oliveira@example.com')!)!.get('thursday')!,
      startedAt: FIXED_DATES.thursday,
      completedAt: new Date(FIXED_DATES.thursday.getTime() + 92 * 60 * 1000),
    },
    {
      userId: createdUsers['rafael.oliveira@example.com'],
      workoutPlanId: plansByEmail.get('rafael.oliveira@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('rafael.oliveira@example.com')!)!.get('friday')!,
      startedAt: FIXED_DATES.friday,
      completedAt: null,
    },
    {
      userId: createdUsers['fernanda.castro@example.com'],
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('fernanda.castro@example.com')!)!.get('monday')!,
      startedAt: FIXED_DATES.monday,
      completedAt: new Date(FIXED_DATES.monday.getTime() + 55 * 60 * 1000),
    },
    {
      userId: createdUsers['fernanda.castro@example.com'],
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('fernanda.castro@example.com')!)!.get('tuesday')!,
      startedAt: FIXED_DATES.tuesday,
      completedAt: new Date(FIXED_DATES.tuesday.getTime() + 58 * 60 * 1000),
    },
    {
      userId: createdUsers['fernanda.castro@example.com'],
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('fernanda.castro@example.com')!)!.get('wednesday')!,
      startedAt: FIXED_DATES.wednesday,
      completedAt: new Date(FIXED_DATES.wednesday.getTime() + 43 * 60 * 1000),
    },
    {
      userId: createdUsers['fernanda.castro@example.com'],
      workoutPlanId: plansByEmail.get('fernanda.castro@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('fernanda.castro@example.com')!)!.get('friday')!,
      startedAt: FIXED_DATES.friday,
      completedAt: null,
    },
    {
      userId: createdUsers['lucas.mendonca@example.com'],
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('lucas.mendonca@example.com')!)!.get('monday')!,
      startedAt: FIXED_DATES.monday,
      completedAt: new Date(FIXED_DATES.monday.getTime() + 68 * 60 * 1000),
    },
    {
      userId: createdUsers['lucas.mendonca@example.com'],
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('lucas.mendonca@example.com')!)!.get('tuesday')!,
      startedAt: FIXED_DATES.tuesday,
      completedAt: new Date(FIXED_DATES.tuesday.getTime() + 72 * 60 * 1000),
    },
    {
      userId: createdUsers['lucas.mendonca@example.com'],
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('lucas.mendonca@example.com')!)!.get('wednesday')!,
      startedAt: FIXED_DATES.wednesday,
      completedAt: new Date(FIXED_DATES.wednesday.getTime() + 78 * 60 * 1000),
    },
    {
      userId: createdUsers['lucas.mendonca@example.com'],
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('lucas.mendonca@example.com')!)!.get('friday')!,
      startedAt: FIXED_DATES.friday,
      completedAt: new Date(FIXED_DATES.friday.getTime() + 75 * 60 * 1000),
    },
    {
      userId: createdUsers['lucas.mendonca@example.com'],
      workoutPlanId: plansByEmail.get('lucas.mendonca@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('lucas.mendonca@example.com')!)!.get('saturday')!,
      startedAt: FIXED_DATES.saturday,
      completedAt: null,
    },
    {
      userId: createdUsers['beatriz.lima@example.com'],
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('beatriz.lima@example.com')!)!.get('monday')!,
      startedAt: FIXED_DATES.monday,
      completedAt: new Date(FIXED_DATES.monday.getTime() + 38 * 60 * 1000),
    },
    {
      userId: createdUsers['beatriz.lima@example.com'],
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('beatriz.lima@example.com')!)!.get('tuesday')!,
      startedAt: FIXED_DATES.tuesday,
      completedAt: new Date(FIXED_DATES.tuesday.getTime() + 48 * 60 * 1000),
    },
    {
      userId: createdUsers['beatriz.lima@example.com'],
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('beatriz.lima@example.com')!)!.get('wednesday')!,
      startedAt: FIXED_DATES.wednesday,
      completedAt: new Date(FIXED_DATES.wednesday.getTime() + 37 * 60 * 1000),
    },
    {
      userId: createdUsers['beatriz.lima@example.com'],
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('beatriz.lima@example.com')!)!.get('friday')!,
      startedAt: FIXED_DATES.friday,
      completedAt: new Date(FIXED_DATES.friday.getTime() + 42 * 60 * 1000),
    },
    {
      userId: createdUsers['beatriz.lima@example.com'],
      workoutPlanId: plansByEmail.get('beatriz.lima@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('beatriz.lima@example.com')!)!.get('saturday')!,
      startedAt: FIXED_DATES.saturday,
      completedAt: null,
    },
    {
      userId: createdUsers['carlos.santos@example.com'],
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('carlos.santos@example.com')!)!.get('monday')!,
      startedAt: FIXED_DATES.monday,
      completedAt: new Date(FIXED_DATES.monday.getTime() + 45 * 60 * 1000),
    },
    {
      userId: createdUsers['carlos.santos@example.com'],
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('carlos.santos@example.com')!)!.get('tuesday')!,
      startedAt: FIXED_DATES.tuesday,
      completedAt: new Date(FIXED_DATES.tuesday.getTime() + 45 * 60 * 1000),
    },
    {
      userId: createdUsers['carlos.santos@example.com'],
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('carlos.santos@example.com')!)!.get('wednesday')!,
      startedAt: FIXED_DATES.wednesday,
      completedAt: new Date(FIXED_DATES.wednesday.getTime() + 45 * 60 * 1000),
    },
    {
      userId: createdUsers['carlos.santos@example.com'],
      workoutPlanId: plansByEmail.get('carlos.santos@example.com')!,
      workoutDayId: daysByPlanAndWeek.get(plansByEmail.get('carlos.santos@example.com')!)!.get('friday')!,
      startedAt: FIXED_DATES.friday,
      completedAt: null,
    },
  ];

  const sessions = sessionsData.map(s => ({
    id: uuidv7(),
    ...s,
  }));

  await db.insert(schema.userWorkoutSessions).values(sessions);
  console.log(`✓ ${sessions.length} sessões criadas\n`);

  console.log('Seed concluído com sucesso!');
  console.log('\nCredenciais:');
  USERS_CONFIG.forEach(user => {
    console.log(`  ${user.name}: ${user.email} / ${PASSWORD}`);
  });
}

seed().catch((err) => {
  console.error('Seed falhou:', err);
  process.exit(1);
});