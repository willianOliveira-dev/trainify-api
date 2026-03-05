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

const hoursAgo = (n: number): Date => {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
};

const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60_000);

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
    email: 'willian@gmail.com',
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

type UserWorkoutSessionInsert = {
  id: string;
  userId: string;
  workoutDayId: string;
  startedAt: Date;
  completedAt: Date | null;
};


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
    
  ];



  const buildSessions = (userIdsMap: Record<number, string>): UserWorkoutSessionInsert[] => {
    const sessions: UserWorkoutSessionInsert[] = [];

    const lucasDayRotation = [
      dayIds.lucasPush,
      dayIds.lucasPull,
      dayIds.lucasLegs,
      dayIds.lucasPush2,
      dayIds.lucasPull2,
    ];
    const lucasDurations = [4100, 4350, 4700, 4400, 4300];
    [0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14, 15, 16, 18, 19, 21, 22].forEach((daysBack, i) => {
      const dayIndex = i % lucasDayRotation.length;
      const started = hoursAgo(daysBack * 24 + 18);
      sessions.push({
        id: uuidv7(),
        userId: userIdsMap[0],
        workoutDayId: lucasDayRotation[dayIndex],
        startedAt: started,
        completedAt: addMinutes(started, Math.floor(lucasDurations[dayIndex] / 60)),
      });
    });

    const fernandaDayRotation = [
      dayIds.fernandaUpper,
      dayIds.fernandaLower,
      dayIds.fernandaCore,
      dayIds.fernandaCardio,
    ];
    const fernandaDurations = [55, 58, 43, 48];
    [0, 2, 4, 7, 9, 11, 14, 16, 18, 21, 23].forEach((daysBack, i) => {
      const dayIndex = i % fernandaDayRotation.length;
      const started = hoursAgo(daysBack * 24 + 19);
      sessions.push({
        id: uuidv7(),
        userId: userIdsMap[1],
        workoutDayId: fernandaDayRotation[dayIndex],
        startedAt: started,
        completedAt: addMinutes(started, fernandaDurations[dayIndex]),
      });
    });

    const rafaelDayRotation = [
      dayIds.rafaelSquat,
      dayIds.rafaelBench,
      dayIds.rafaelDeadlift,
      dayIds.rafaelOhp,
    ];
    const rafaelDurations = [88, 85, 92, 78];
    [0, 1, 3, 4, 7, 8, 10, 11, 14, 15, 17, 18, 21, 22, 24, 25].forEach((daysBack, i) => {
      const dayIndex = i % rafaelDayRotation.length;
      const started = hoursAgo(daysBack * 24 + 17);
      sessions.push({
        id: uuidv7(),
        userId: userIdsMap[2],
        workoutDayId: rafaelDayRotation[dayIndex],
        startedAt: started,
        completedAt: addMinutes(started, rafaelDurations[dayIndex]),
      });
    });

    const beatrizDayRotation = [
      dayIds.beatrizHiit1,
      dayIds.beatrizMobility,
      dayIds.beatrizHiit2,
      dayIds.beatrizHiit3,
      dayIds.beatrizMobility2,
    ];
    const beatrizDurations = [38, 48, 37, 42, 58];
    [0, 2, 4, 7, 9, 11].forEach((daysBack, i) => {
      const dayIndex = i % beatrizDayRotation.length;
      const started = hoursAgo(daysBack * 24 + 7);
      sessions.push({
        id: uuidv7(),
        userId: userIdsMap[3],
        workoutDayId: beatrizDayRotation[dayIndex],
        startedAt: started,
        completedAt: addMinutes(started, beatrizDurations[dayIndex]),
      });
    });


    sessions.push({
      id: uuidv7(),
      userId: userIdsMap[0],
      workoutDayId: dayIds.lucasPush,
      startedAt: hoursAgo(1),
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