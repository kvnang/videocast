import Button from '../components/Button';
import SEO from '../components/Seo';

export default function ErrorPage() {
  return (
    <main>
      <SEO />
      <section className="container mx-auto">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl lg:text-[8rem] leading-tight font-bold mb-16">
              404
            </h1>
            <h2 className="text-xl mb-8">:( Sorry, something went wrong.</h2>
            <Button href="/">Go Back Home</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
