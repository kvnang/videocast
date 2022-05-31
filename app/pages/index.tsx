import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { IoColorWandOutline } from 'react-icons/io5';
import Button from '../components/Button';
import SEO from '../components/Seo';

export default function HomePage() {
  const { user, isLoading } = useUser();
  return (
    <main>
      <SEO />
      <div className="container mx-auto pt-16 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl leading-tight font-extrabold font-display mb-8 text-center">
              Visualize Your Podcast, Effortlessly
            </h1>
            <p className="text-xl leading-relaxed text-center">
              Turn your one-minute podcast into a video. Make stronger
              impressions.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <Button href="/app/create" icon={<IoColorWandOutline />}>
              Start Creating
            </Button>
            <div>
              {!user && !isLoading && (
                <span className="inline-block p-2">
                  <span className="text-slate-300">
                    Already have an account?{' '}
                  </span>
                  <Link href="/api/auth/login">
                    <a className="font-bold hover:text-shadow transition-all">
                      Login
                    </a>
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
