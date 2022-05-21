import Link from 'next/link';
import { IoColorWandOutline } from 'react-icons/io5';
import Button from '../components/Button';
import SEO from '../components/Seo';

export default function HomePage() {
  return (
    <main>
      <SEO />
      <div className="container mx-auto pt-16 pb-16">
        <div className="max-w-xl">
          <div className="mb-8">
            <h1 className="text-5xl leading-tight font-bold font-display mb-8">
              Visualize Your Podcast, Effortlessly
            </h1>
            <p className="text-xl leading-relaxed">
              Turn your one-minute podcast into a video. Make stronger
              impressions.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button href="/api/auth/login" buttonStyle="secondary">
              Login
            </Button>
            <Button href="/app/create" icon={<IoColorWandOutline />}>
              Start Creating
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
