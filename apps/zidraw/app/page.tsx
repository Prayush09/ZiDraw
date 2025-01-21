import Button from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (

    <div className="w-full h-full">
      {/* Navbar */}
      <div className="flex flex-wrap justify-between items-center p-4">
        {/* Brand Section */}
        <div className="flex flex-col sm:flex-row items-center overflow-hidden relative">
          <span className="flex flex-row text-xl sm:text-2xl p-2 m-2 rounded-lg border-l-2 border-r-2 border-white relative">
          <img src="@/public/draw.svg" alt="img" className="w-[20px] h-[20px] m-2"/> 
          <span>Zi-Draw</span> 
          </span>
          <span className="text-sm sm:text-base">Draw your own conclusions</span>
        </div>

        {/* Auth Links */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Link href="/Auth/Signin">
            <Button variant="primary" size="sm" name="Sign in" />
          </Link>
          <Link href="/Auth/Signup">
            <Button variant="outline" size="sm" name="Sign up" className="ml-0" />
          </Link>
            
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight sm:tracking-normal sm:leading-tight sm:text-6xl text-foreground">
              Collaborative Whiteboarding
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="mx-auto mt-4 sm:mt-6 max-w-md sm:max-w-2xl text-sm sm:text-lg text-muted-foreground">
              Create, collaborate, and share beautiful diagrams and sketches with our intuitive drawing tool.
            </p>
            <div className="mt-6 sm:mt-8 flex items-center justify-center">
              <Link href="/canvas">
                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                  <span className="relative px-4 py-2 sm:px-5 sm:py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Try Now!
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Display Section */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <h2 className="text-lg sm:text-2xl font-semibold">Features</h2>
          <p className="text-sm sm:text-base mt-2 text-muted-foreground">
            Discover how Zi-Draw simplifies your collaborative whiteboarding experience.
          </p>
        </div>
        <div className="mt-6 w-full max-w-md sm:max-w-2xl grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2">
          {/* Add feature cards or content here */}
          MID SECTION
        </div>
      </div>
    </div>
  );
}
