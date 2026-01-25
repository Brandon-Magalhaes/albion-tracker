import PlayerView from './PlayerView';

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  return <PlayerView key={decodedName} name={decodedName} />;
}
