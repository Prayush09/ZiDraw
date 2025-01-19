import Button from '@/components/ui/button'
import Link from 'next/Link'

export default function Home() {
  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center">
       <div className="flex-row overflow-hidden relative">
         <span className="text-2xl p-4 m-4 rounded-lg border-2 border-white relative" style={{ top: '-20%' }}>Zi-Draw</span>
         <span>Draw your own conclusions</span>
       </div>
       <div>
        <Link href={"/signin"}>
          <Button variant={"primary"} size="sm" name="Sign in" />
        </Link>
        <Link href="/signup">
          <Button variant="outline" size="sm" name="Sign up" />
        </Link>
       </div>  
      </div>
       <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Collaborative Whiteboarding
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Create, collaborate, and share beautiful diagrams and sketches with our intuitive drawing tool. 

            </p>
            <div className="mt-8 flex items-center justify-center gap-x-1">
              <Link href="/canvas">
                <Button variant='primary' size='md' name = "Try Now!" />
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Feature Display Section*/}
      <div className="flex justify-center items-center">
          MID SECTION
      </div>
    </div>
  );
}

