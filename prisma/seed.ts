import { PrismaClient, BookingStatus } from '@prisma/client';
import { addDays, addMinutes, setHours, setMinutes, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...');

  // ── 1. Default admin user ──────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      id: 'default-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      username: 'john',
      bio: 'Full-stack engineer & open-source enthusiast. Book a time to chat!',
      timezone: 'America/New_York',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
    },
  });

  console.log(`✅  User created: ${user.name} (@${user.username})`);

  // ── 2. Event types ─────────────────────────────────────────────
  const et1 = await prisma.eventType.upsert({
    where: { userId_slug: { userId: user.id, slug: '30min' } },
    update: {},
    create: {
      userId: user.id,
      title: '30 Minute Meeting',
      slug: '30min',
      description: 'A quick 30-minute chat. Perfect for introductions, quick syncs, or short Q&A sessions.',
      duration: 30,
      color: '#6366f1',
      location: 'Google Meet',
    },
  });

  const et2 = await prisma.eventType.upsert({
    where: { userId_slug: { userId: user.id, slug: '60min' } },
    update: {},
    create: {
      userId: user.id,
      title: '60 Minute Consultation',
      slug: '60min',
      description: 'An in-depth one-hour consultation. Ideal for detailed project discussions, technical deep-dives, or mentoring sessions.',
      duration: 60,
      color: '#10b981',
      location: 'Zoom',
    },
  });

  const et3 = await prisma.eventType.upsert({
    where: { userId_slug: { userId: user.id, slug: '15min' } },
    update: {},
    create: {
      userId: user.id,
      title: '15 Minute Quick Chat',
      slug: '15min',
      description: 'A super-fast 15-minute call for quick questions, status updates, or a brief catch-up.',
      duration: 15,
      color: '#f59e0b',
      location: 'Phone Call',
    },
  });

  console.log(`✅  Event types created: ${et1.title}, ${et2.title}, ${et3.title}`);

  // ── 3. Availability (Mon–Fri 9–5) ──────────────────────────────
  const defaultHours = [
    { dayOfWeek: 0, isAvailable: false, startTime: '09:00', endTime: '17:00' }, // Sun
    { dayOfWeek: 1, isAvailable: true,  startTime: '09:00', endTime: '17:00' }, // Mon
    { dayOfWeek: 2, isAvailable: true,  startTime: '09:00', endTime: '17:00' }, // Tue
    { dayOfWeek: 3, isAvailable: true,  startTime: '09:00', endTime: '17:00' }, // Wed
    { dayOfWeek: 4, isAvailable: true,  startTime: '09:00', endTime: '17:00' }, // Thu
    { dayOfWeek: 5, isAvailable: true,  startTime: '09:00', endTime: '17:00' }, // Fri
    { dayOfWeek: 6, isAvailable: false, startTime: '09:00', endTime: '17:00' }, // Sat
  ];

  for (const slot of defaultHours) {
    await prisma.availability.upsert({
      where: { userId_dayOfWeek: { userId: user.id, dayOfWeek: slot.dayOfWeek } },
      update: {},
      create: { userId: user.id, ...slot },
    });
  }

  console.log('✅  Availability set (Mon–Fri, 9 AM – 5 PM)');

  // ── 4. Sample bookings ─────────────────────────────────────────
  const now = new Date();

  const futureBookings = [
    {
      eventTypeId: et1.id,
      bookerName: 'Alice Johnson',
      bookerEmail: 'alice@example.com',
      startTime: setHours(setMinutes(addDays(now, 2), 0), 10),
      notes: 'Want to discuss the onboarding process.',
    },
    {
      eventTypeId: et2.id,
      bookerName: 'Bob Smith',
      bookerEmail: 'bob@example.com',
      startTime: setHours(setMinutes(addDays(now, 4), 0), 14),
      notes: 'Deep dive into system architecture.',
    },
    {
      eventTypeId: et3.id,
      bookerName: 'Carol Williams',
      bookerEmail: 'carol@example.com',
      startTime: setHours(setMinutes(addDays(now, 7), 0), 11),
      notes: '',
    },
  ];

  for (const b of futureBookings) {
    const eventType = await prisma.eventType.findUnique({ where: { id: b.eventTypeId } });
    const endTime = addMinutes(b.startTime, eventType!.duration);
    await prisma.booking.create({
      data: {
        eventTypeId: b.eventTypeId,
        bookerName: b.bookerName,
        bookerEmail: b.bookerEmail,
        startTime: b.startTime,
        endTime,
        status: BookingStatus.CONFIRMED,
        notes: b.notes,
      },
    });
  }

  const pastBookings = [
    {
      eventTypeId: et1.id,
      bookerName: 'Dave Brown',
      bookerEmail: 'dave@example.com',
      startTime: setHours(setMinutes(subDays(now, 5), 0), 9),
      status: BookingStatus.COMPLETED,
    },
    {
      eventTypeId: et2.id,
      bookerName: 'Eve Davis',
      bookerEmail: 'eve@example.com',
      startTime: setHours(setMinutes(subDays(now, 10), 0), 15),
      status: BookingStatus.COMPLETED,
    },
    {
      eventTypeId: et3.id,
      bookerName: 'Frank Miller',
      bookerEmail: 'frank@example.com',
      startTime: setHours(setMinutes(subDays(now, 3), 0), 13),
      status: BookingStatus.CANCELLED,
      cancelReason: 'Scheduling conflict on my end.',
    },
  ];

  for (const b of pastBookings) {
    const eventType = await prisma.eventType.findUnique({ where: { id: b.eventTypeId } });
    const endTime = addMinutes(b.startTime, eventType!.duration);
    await prisma.booking.create({
      data: {
        eventTypeId: b.eventTypeId,
        bookerName: b.bookerName,
        bookerEmail: b.bookerEmail,
        startTime: b.startTime,
        endTime,
        status: b.status,
        cancelReason: b.cancelReason,
      },
    });
  }

  console.log('✅  Sample bookings created (3 upcoming, 2 completed, 1 cancelled)');
  console.log('\n🎉  Seed complete! Visit http://localhost:3000 to get started.');
  console.log('📅  Public booking page: http://localhost:3000/john/30min');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
