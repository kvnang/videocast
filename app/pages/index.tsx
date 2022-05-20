import Link from 'next/link';
import Button from '../components/Button';
import SEO from '../components/Seo';

export default function HomePage() {
  return (
    <main>
      <SEO />
      <div className="container mx-auto pt-16 pb-16">
        <div className="mb-8">
          <h1 className="text-5xl font-bold font-display mb-8">
            Podcast makes Video
          </h1>
          <p className="text-xl">
            Turn your one-minute podcast into a video. Make stronger
            impressions.
          </p>
        </div>
        <Button href="/app/create">Start Creating</Button>
      </div>
    </main>
  );
}
