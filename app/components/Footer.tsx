import { IoLogoGithub } from 'react-icons/io5';

export default function Footer() {
  return (
    <footer>
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-8">
          <a
            href="https://github.com/kvnang/videocast"
            className="inline-flex items-center text-sm opacity-50 hover:opacity-100 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">View Source</span>
            <IoLogoGithub className="h-6 w-6" title="View Source on GitHub" />
          </a>
        </div>
      </div>
    </footer>
  );
}
