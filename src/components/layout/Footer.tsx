
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link to="/" className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              CATPrepTracker
            </Link>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center md:text-right text-sm text-muted-foreground">
              &copy; {currentYear} CATPrepTracker. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
