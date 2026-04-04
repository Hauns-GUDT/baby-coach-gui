import WeeklyWidget from '../components/widgets/WeeklyWidget';

export default function Dashboard() {
  return (
    <main className="p-6 flex flex-col gap-4 max-w-2xl mx-auto">
      <WeeklyWidget />
    </main>
  );
}
