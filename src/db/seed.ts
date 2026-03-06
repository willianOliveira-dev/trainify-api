import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { uuidv7 } from 'uuidv7';
import { auth } from '@/lib/auth';
import { env } from '@/config/env';
import * as schema from '@/db/schemas';

const db = drizzle(env.databaseUrl, { schema });

const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

const USERS_CONFIG = [
  {
    name: 'Lucas Mendonça',
    email: 'lucas.mendonca@example.com',
    emailVerified: true,
    image: avatar('lucas-mendonca'),
  },
  {
    name: 'Fernanda Castro',
    email: 'fernanda.castro@example.com',
    emailVerified: true,
    image: avatar('fernanda-castro'),
  },
  {
    name: 'Rafael Oliveira',
    email: 'rafael.oliveira@example.com',
    emailVerified: false,
    image: avatar('rafael-oliveira'),
  },
  {
    name: 'Beatriz Lima',
    email: 'beatriz.lima@example.com',
    emailVerified: true,
    image: avatar('beatriz-lima'),
  },
  {
    name: 'Willian Oliveira',
    email: 'willian@example.com',
    emailVerified: true,
    image: avatar('willian-oliveira'),
  },
] as const;

const PASSWORD = '@Minhasenha123';

type WorkoutPlanInsert = {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type WorkoutDayInsert = {
  id: string;
  name: string;
  workoutPlanId: string;
  isRest: boolean;
  weekDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  estimatedDurationInSeconds: number | null;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type WorkoutExerciseInsert = {
  id: string;
  order: number;
  name: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  workoutDayId: string;
  createdAt: Date;
  updatedAt: Date;
};

type UserWorkoutSessionInsert = typeof schema.userWorkoutSessions.$inferInsert;

async function seed() {
  console.log('🗑️  Limpando banco...');
  await db.execute(sql`
    TRUNCATE TABLE "workout_exercises", "workout_days", "workout_plans",
                   "user_workout_sessions", "session", "account",
                   "verification", "user"
    RESTART IDENTITY CASCADE;
  `);

  console.log('🌱 Iniciando seed...');

  console.log('👥 Criando usuários via signUpEmail...');
  const createdUsers: Record<string, { id: string; emailVerified: boolean }> = {};

  for (const user of USERS_CONFIG) {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: user.email,
          password: PASSWORD,
          name: user.name,
          image: user.image,
        },
      });

      const userId = result?.user?.id ?? result?.user.id;

      if (!userId) {
        const [dbUser] = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(sql`${schema.user.email} = ${user.email}`)
          .limit(1);

        createdUsers[user.email] = {
          id: dbUser?.id ?? '',
          emailVerified: user.emailVerified,
        };
      } else {
        createdUsers[user.email] = {
          id: userId,
          emailVerified: user.emailVerified,
        };
      }

      if (user.emailVerified) {
        await db
          .update(schema.user)
          .set({ emailVerified: true, updatedAt: new Date() })
          .where(sql`${schema.user.email} = ${user.email}`);
      }

      console.log(`   ✓ ${user.name} (${user.email})`);
    } catch (err: any) {
      if (err?.message?.includes('already exists') || err?.code === 'USER_ALREADY_EXISTS') {
        const [dbUser] = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(sql`${schema.user.email} = ${user.email}`)
          .limit(1);

        if (dbUser?.id) {
          createdUsers[user.email] = {
            id: dbUser.id,
            emailVerified: user.emailVerified,
          };
          console.log(`   ⚠️  ${user.name} já existia, usando registro existente`);
        } else {
          console.error(`   ❌ Não foi possível recuperar ${user.email}`);
        }
      } else {
        console.error(`   ❌ Erro ao criar ${user.email}:`, err);
        throw err;
      }
    }
  }

  const userIds = Object.fromEntries(
    USERS_CONFIG.map((u, i) => [i, createdUsers[u.email].id])
  ) as Record<number, string>;

  console.log(`   ✓ ${USERS_CONFIG.length} usuários prontos`);

  const workoutPlans: WorkoutPlanInsert[] = [
    {
      id: uuidv7(),
      name: 'PPL — Hipertrofia',
      userId: userIds[0],
      isActive: true,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      name: 'Full Body Iniciante',
      userId: userIds[0],
      isActive: false,
      createdAt: daysAgo(120),
      updatedAt: daysAgo(61),
    },
    {
      id: uuidv7(),
      name: 'Funcional Feminino',
      userId: userIds[1],
      isActive: true,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      name: 'Powerlifting — Força Máxima',
      userId: userIds[2],
      isActive: true,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      name: 'HIIT + Mobilidade',
      userId: userIds[3],
      isActive: true,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
  ];

  const [lucasPpl, , fernandaFuncional, rafaelPower, beatrizHiit] = workoutPlans;

  const dayIds = {
    lucasPush: uuidv7(),
    lucasPull: uuidv7(),
    lucasLegs: uuidv7(),
    lucasRestThu: uuidv7(),
    lucasPush2: uuidv7(),
    lucasPull2: uuidv7(),
    lucasRestSun: uuidv7(),
    fernandaUpper: uuidv7(),
    fernandaLower: uuidv7(),
    fernandaCore: uuidv7(),
    fernandaRestThu: uuidv7(),
    fernandaCardio: uuidv7(),
    fernandaRestSat: uuidv7(),
    fernandaRestSun: uuidv7(),
    rafaelSquat: uuidv7(),
    rafaelBench: uuidv7(),
    rafaelRestWed: uuidv7(),
    rafaelDeadlift: uuidv7(),
    rafaelOhp: uuidv7(),
    rafaelRestSat: uuidv7(),
    rafaelRestSun: uuidv7(),
    beatrizHiit1: uuidv7(),
    beatrizMobility: uuidv7(),
    beatrizHiit2: uuidv7(),
    beatrizRestThu: uuidv7(),
    beatrizHiit3: uuidv7(),
    beatrizMobility2: uuidv7(),
    beatrizRestSun: uuidv7(),
  };

  const workoutDays: WorkoutDayInsert[] = [
    {
      id: dayIds.lucasPush,
      name: 'Push A — Peito, Ombro, Tríceps',
      workoutPlanId: lucasPpl.id,
      isRest: false,
      weekDay: 'monday',
      estimatedDurationInSeconds: 4200,
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: dayIds.lucasPull,
      name: 'Pull A — Costas, Bíceps',
      workoutPlanId: lucasPpl.id,
      isRest: false,
      weekDay: 'tuesday',
      estimatedDurationInSeconds: 4200,
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: dayIds.lucasLegs,
      name: 'Legs A — Quadríceps, Posterior',
      workoutPlanId: lucasPpl.id,
      isRest: false,
      weekDay: 'wednesday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 4800,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: dayIds.lucasRestThu,
      name: 'Descanso',
      workoutPlanId: lucasPpl.id,
      isRest: true,
      weekDay: 'thursday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: dayIds.lucasPush2,
      name: 'Push B — Volume',
      workoutPlanId: lucasPpl.id,
      isRest: false,
      weekDay: 'friday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 4500,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: dayIds.lucasPull2,
      name: 'Pull B — Volume',
      workoutPlanId: lucasPpl.id,
      isRest: false,
      weekDay: 'saturday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 4500,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: dayIds.lucasRestSun,
      name: 'Descanso Ativo',
      workoutPlanId: lucasPpl.id,
      isRest: true,
      weekDay: 'sunday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: dayIds.fernandaUpper,
      name: 'Upper Body Funcional',
      workoutPlanId: fernandaFuncional.id,
      isRest: false,
      weekDay: 'monday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 3600,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: dayIds.fernandaLower,
      name: 'Lower Body + Glúteos',
      workoutPlanId: fernandaFuncional.id,
      isRest: false,
      weekDay: 'tuesday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 3600,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: dayIds.fernandaCore,
      name: 'Core + Estabilização',
      workoutPlanId: fernandaFuncional.id,
      isRest: false,
      weekDay: 'wednesday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 2700,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: dayIds.fernandaRestThu,
      name: 'Descanso',
      workoutPlanId: fernandaFuncional.id,
      isRest: true,
      weekDay: 'thursday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: dayIds.fernandaCardio,
      name: 'Cardio LISS + Alongamento',
      workoutPlanId: fernandaFuncional.id,
      isRest: false,
      weekDay: 'friday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 3000,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: dayIds.fernandaRestSat,
      name: 'Descanso',
      workoutPlanId: fernandaFuncional.id,
      isRest: true,
      weekDay: 'saturday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: dayIds.fernandaRestSun,
      name: 'Descanso Ativo',
      workoutPlanId: fernandaFuncional.id,
      isRest: true,
      weekDay: 'sunday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: dayIds.rafaelSquat,
      name: 'Dia do Agachamento',
      workoutPlanId: rafaelPower.id,
      isRest: false,
      weekDay: 'monday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 5400,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: dayIds.rafaelBench,
      name: 'Dia do Supino',
      workoutPlanId: rafaelPower.id,
      isRest: false,
      weekDay: 'tuesday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 5400,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: dayIds.rafaelRestWed,
      name: 'Descanso',
      workoutPlanId: rafaelPower.id,
      isRest: true,
      weekDay: 'wednesday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: dayIds.rafaelDeadlift,
      name: 'Dia do Levantamento',
      workoutPlanId: rafaelPower.id,
      isRest: false,
      weekDay: 'thursday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 5400,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: dayIds.rafaelOhp,
      name: 'Overhead Press + Acessórios',
      workoutPlanId: rafaelPower.id,
      isRest: false,
      weekDay: 'friday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 4800,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: dayIds.rafaelRestSat,
      name: 'Descanso',
      workoutPlanId: rafaelPower.id,
      isRest: true,
      weekDay: 'saturday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: dayIds.rafaelRestSun,
      name: 'Descanso',
      workoutPlanId: rafaelPower.id,
      isRest: true,
      weekDay: 'sunday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: dayIds.beatrizHiit1,
      name: 'HIIT Metabólico',
      workoutPlanId: beatrizHiit.id,
      isRest: false,
      weekDay: 'monday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 2400,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: dayIds.beatrizMobility,
      name: 'Mobilidade + Yoga Flow',
      workoutPlanId: beatrizHiit.id,
      isRest: false,
      weekDay: 'tuesday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 3000,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: dayIds.beatrizHiit2,
      name: 'HIIT Inferior',
      workoutPlanId: beatrizHiit.id,
      isRest: false,
      weekDay: 'wednesday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 2400,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: dayIds.beatrizRestThu,
      name: 'Descanso',
      workoutPlanId: beatrizHiit.id,
      isRest: true,
      weekDay: 'thursday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: dayIds.beatrizHiit3,
      name: 'HIIT Full Body',
      workoutPlanId: beatrizHiit.id,
      isRest: false,
      weekDay: 'friday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 2700,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: dayIds.beatrizMobility2,
      name: 'Mobilidade Profunda',
      workoutPlanId: beatrizHiit.id,
      isRest: false,
      weekDay: 'saturday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: 3600,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: dayIds.beatrizRestSun,
      name: 'Descanso Ativo',
      workoutPlanId: beatrizHiit.id,
      isRest: true,
      weekDay: 'sunday',
      coverImageUrl: 'https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgP9yzQkNGronCvXmSzAMs1N3KgLdE5yHT6Yk',
      estimatedDurationInSeconds: null,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
  ];

  const workoutExercises: WorkoutExerciseInsert[] = [
    {
      id: uuidv7(),
      order: 1,
      name: 'Supino Reto com Barra',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: dayIds.lucasPush,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Desenvolvimento com Halteres',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.lucasPush,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Crucifixo Inclinado',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPush,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Tríceps Corda',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPush,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Elevação Lateral',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasPush,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Flexão de Braço',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasPush,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Puxada Aberta',
      sets: 4,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: dayIds.lucasPull,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Remada Curvada',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 150,
      workoutDayId: dayIds.lucasPull,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Rosca Direta Barra',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPull,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Remada Baixa',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPull,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Rosca Martelo',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasPull,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Encolhimento Ombros',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasPull,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Agachamento Livre',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: dayIds.lucasLegs,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Leg Press 45°',
      sets: 4,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: dayIds.lucasLegs,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Cadeira Extensora',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasLegs,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Mesa Flexora',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasLegs,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Gêmeos em Pé',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasLegs,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Cadeira Abdutora',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasLegs,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Supino Inclinado Halteres',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 150,
      workoutDayId: dayIds.lucasPush2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Desenvolvimento Máquina',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.lucasPush2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Crucifixo Reto',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPush2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Tríceps Testa',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPush2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Elevação Frontal',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasPush2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Paralelas',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPush2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Barra Fixa',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: dayIds.lucasPull2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Remada Unilateral',
      sets: 4,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: dayIds.lucasPull2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Rosca Scott',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPull2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Remada Máquina',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.lucasPull2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Rosca Concentrada',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasPull2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Face Pull',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.lucasPull2,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Desenvolvimento Halteres',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.fernandaUpper,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Remada Baixa Triângulo',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.fernandaUpper,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Supino Máquina',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.fernandaUpper,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Puxada Fechada',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.fernandaUpper,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Elevação Lateral',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaUpper,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Tríceps Polia',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaUpper,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Agachamento Goblet',
      sets: 4,
      reps: 12,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.fernandaLower,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Hack Machine',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.fernandaLower,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Cadeira Flexora',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.fernandaLower,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Elevação Pélvica',
      sets: 4,
      reps: 15,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.fernandaLower,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Cadeira Adutora',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaLower,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Gêmeos Sentado',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaLower,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Prancha',
      sets: 3,
      reps: 60,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaCore,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Abdominal Remador',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaCore,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Prancha Lateral',
      sets: 3,
      reps: 45,
      restTimeInSeconds: 45,
      workoutDayId: dayIds.fernandaCore,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Abdominal Infra',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaCore,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Prancha com Toque Ombro',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: dayIds.fernandaCore,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Abdominal Canivete',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.fernandaCore,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(2),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Agachamento Livre',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 240,
      workoutDayId: dayIds.rafaelSquat,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Agachamento Frontal',
      sets: 3,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: dayIds.rafaelSquat,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Leg Press',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: dayIds.rafaelSquat,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Cadeira Extensora',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelSquat,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Mesa Flexora',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelSquat,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Supino Reto',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 240,
      workoutDayId: dayIds.rafaelBench,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Supino Inclinado',
      sets: 3,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: dayIds.rafaelBench,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Crucifixo',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.rafaelBench,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Tríceps Testa',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelBench,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Tríceps Francês',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelBench,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Levantamento Terra',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 300,
      workoutDayId: dayIds.rafaelDeadlift,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Remada Curvada',
      sets: 4,
      reps: 8,
      restTimeInSeconds: 180,
      workoutDayId: dayIds.rafaelDeadlift,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Puxada Aberta',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 150,
      workoutDayId: dayIds.rafaelDeadlift,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Rosca Direta',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelDeadlift,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Rosca Inversa',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelDeadlift,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Desenvolvimento Militar',
      sets: 5,
      reps: 5,
      restTimeInSeconds: 240,
      workoutDayId: dayIds.rafaelOhp,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Elevação Lateral',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.rafaelOhp,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Elevação Frontal',
      sets: 3,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelOhp,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Encolhimento com Barra',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.rafaelOhp,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Desenvolvimento Arnold',
      sets: 3,
      reps: 10,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.rafaelOhp,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Burpees',
      sets: 5,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.beatrizHiit1,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Mountain Climbers',
      sets: 5,
      reps: 30,
      restTimeInSeconds: 45,
      workoutDayId: dayIds.beatrizHiit1,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Jump Squats',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.beatrizHiit1,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Polichinelos',
      sets: 4,
      reps: 40,
      restTimeInSeconds: 45,
      workoutDayId: dayIds.beatrizHiit1,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Pular Corda',
      sets: 5,
      reps: 60,
      restTimeInSeconds: 45,
      workoutDayId: dayIds.beatrizHiit1,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Postura do Gato',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Cachorro Olhando Baixo',
      sets: 3,
      reps: 60,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Mobilidade de Quadril',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Rotações Torácicas',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Postura da Criança',
      sets: 3,
      reps: 60,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Mobilidade de Tornozelo',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Agachamento com Salto',
      sets: 5,
      reps: 15,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.beatrizHiit2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Afundo Alternado',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.beatrizHiit2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Box Jump',
      sets: 4,
      reps: 12,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.beatrizHiit2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Skater Squats',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.beatrizHiit2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Ponte Unilateral',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 45,
      workoutDayId: dayIds.beatrizHiit2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Circuito Funcional',
      sets: 4,
      reps: 60,
      restTimeInSeconds: 120,
      workoutDayId: dayIds.beatrizHiit3,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Kettlebell Swing',
      sets: 4,
      reps: 20,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.beatrizHiit3,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Thrusters',
      sets: 4,
      reps: 15,
      restTimeInSeconds: 90,
      workoutDayId: dayIds.beatrizHiit3,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Remada Alta',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 60,
      workoutDayId: dayIds.beatrizHiit3,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Bicicleta no Ar',
      sets: 3,
      reps: 30,
      restTimeInSeconds: 45,
      workoutDayId: dayIds.beatrizHiit3,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 1,
      name: 'Alongamento de Isquiotibiais',
      sets: 3,
      reps: 45,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 2,
      name: 'Abertura de Quadril',
      sets: 3,
      reps: 45,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 3,
      name: 'Mobilidade de Coluna',
      sets: 3,
      reps: 20,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 4,
      name: 'Postura do Pombo',
      sets: 3,
      reps: 60,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 5,
      name: 'Rolamento de Coluna',
      sets: 3,
      reps: 15,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: uuidv7(),
      order: 6,
      name: 'Alongamento de Peitoral',
      sets: 3,
      reps: 45,
      restTimeInSeconds: 30,
      workoutDayId: dayIds.beatrizMobility2,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
  ];

  const dayToPlanMap = new Map<string, string>();
  for (const day of workoutDays) {
    dayToPlanMap.set(day.id, day.workoutPlanId);
  }

 const buildSessions = (userIdsMap: Record<number, string>): UserWorkoutSessionInsert[] => {
  const sessions: UserWorkoutSessionInsert[] = [];

  const weekDates = {
    monday: new Date('2026-03-02T10:00:00Z'),
    tuesday: new Date('2026-03-03T10:00:00Z'),
    wednesday: new Date('2026-03-04T10:00:00Z'),
    thursday: new Date('2026-03-05T10:00:00Z'),
    friday: new Date('2026-03-06T10:00:00Z'),
    saturday: new Date('2026-03-07T10:00:00Z'),
    sunday: new Date('2026-03-08T10:00:00Z'),
  };

  const rafaelWorkoutDays = [
    { dayId: dayIds.rafaelSquat, date: weekDates.monday, duration: 88 },    
    { dayId: dayIds.rafaelBench, date: weekDates.tuesday, duration: 85 },    
    { dayId: dayIds.rafaelDeadlift, date: weekDates.thursday, duration: 92 }, 
    { dayId: dayIds.rafaelOhp, date: weekDates.friday, duration: 78 },     
  ];

  rafaelWorkoutDays.forEach(({ dayId, date, duration }) => {
    sessions.push({
      id: uuidv7(),
      userId: userIdsMap[2],
      workoutPlanId: dayToPlanMap.get(dayId)!,
      workoutDayId: dayId,
      startedAt: date,
      completedAt: new Date(date.getTime() + duration * 60 * 1000),
    });
  });


  const lucasWorkoutDays = [
    { dayId: dayIds.lucasPush, date: weekDates.monday, duration: 68 }, 
    { dayId: dayIds.lucasPull, date: weekDates.tuesday, duration: 72 },  
    { dayId: dayIds.lucasLegs, date: weekDates.wednesday, duration: 78 },
    { dayId: dayIds.lucasPush2, date: weekDates.friday, duration: 75 },   
    { dayId: dayIds.lucasPull2, date: weekDates.saturday, duration: 71 }, 
  ];

  lucasWorkoutDays.forEach(({ dayId, date, duration }) => {
    sessions.push({
      id: uuidv7(),
      userId: userIdsMap[0],
      workoutPlanId: dayToPlanMap.get(dayId)!,
      workoutDayId: dayId,
      startedAt: date,
      completedAt: new Date(date.getTime() + duration * 60 * 1000),
    });
  });


  const fernandaWorkoutDays = [
    { dayId: dayIds.fernandaUpper, date: weekDates.monday, duration: 55 },   
    { dayId: dayIds.fernandaLower, date: weekDates.tuesday, duration: 58 },   
    { dayId: dayIds.fernandaCore, date: weekDates.wednesday, duration: 43 },  
    { dayId: dayIds.fernandaCardio, date: weekDates.friday, duration: 48 },   
  ];

  fernandaWorkoutDays.forEach(({ dayId, date, duration }) => {
    sessions.push({
      id: uuidv7(),
      userId: userIdsMap[1],
      workoutPlanId: dayToPlanMap.get(dayId)!,
      workoutDayId: dayId,
      startedAt: date,
      completedAt: new Date(date.getTime() + duration * 60 * 1000),
    });
  });


  const beatrizWorkoutDays = [
    { dayId: dayIds.beatrizHiit1, date: weekDates.monday, duration: 38 },    
    { dayId: dayIds.beatrizMobility, date: weekDates.tuesday, duration: 48 }, 
    { dayId: dayIds.beatrizHiit2, date: weekDates.wednesday, duration: 37 }, 
    { dayId: dayIds.beatrizHiit3, date: weekDates.friday, duration: 42 },   
    { dayId: dayIds.beatrizMobility2, date: weekDates.saturday, duration: 58 }, 
  ];

  beatrizWorkoutDays.forEach(({ dayId, date, duration }) => {
    sessions.push({
      id: uuidv7(),
      userId: userIdsMap[3],
      workoutPlanId: dayToPlanMap.get(dayId)!,
      workoutDayId: dayId,
      startedAt: date,
      completedAt: new Date(date.getTime() + duration * 60 * 1000),
    });
  });

  sessions.push({
    id: uuidv7(),
    userId: userIdsMap[2],
    workoutPlanId: dayToPlanMap.get(dayIds.rafaelOhp)!,
    workoutDayId: dayIds.rafaelOhp,
    startedAt: new Date('2026-03-06T17:40:00Z'),
    completedAt: null, 
  });

  return sessions;
};

  console.log('📋 Inserindo planos de treino...');
  await db.insert(schema.workoutPlans).values(workoutPlans);
  console.log(`   ✓ ${workoutPlans.length} planos inseridos`);

  console.log('📅 Inserindo dias de treino...');
  await db.insert(schema.workoutDays).values(workoutDays);
  console.log(`   ✓ ${workoutDays.length} dias inseridos`);

  console.log('🏋️  Inserindo exercícios...');
  await db.insert(schema.workoutExercises).values(workoutExercises);
  console.log(`   ✓ ${workoutExercises.length} exercícios inseridos`);

  const sessions = buildSessions(userIds);
  console.log('⏱️  Inserindo sessões...');
  await db.insert(schema.userWorkoutSessions).values(sessions);
  console.log(`   ✓ ${sessions.length} sessões inseridas`);

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📊 Resumo:
• ${USERS_CONFIG.length} usuários criados via signUpEmail
• ${workoutPlans.length} planos de treino (1 inativo para histórico)
• ${workoutDays.length} dias de treino (descansos inclusos)
• ${workoutExercises.length} exercícios com séries/reps/descanso realistas
• ${sessions.length} sessões (últimas 4 semanas + 1 ativa)
• Senha de todos: ${PASSWORD}
`);
}

seed().catch((err) => {
  console.error('❌ Seed falhou:', err);
  process.exit(1);
});
