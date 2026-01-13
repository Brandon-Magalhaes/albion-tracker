import PlayerView from './PlayerView';

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <PlayerView name={decodeURIComponent(name)} />;
}
