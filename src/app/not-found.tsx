import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-fd grid min-h-[70vh] place-items-center py-24 text-center">
      <div className="max-w-xl animate-fade-up">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] leading-tight">This play didn&apos;t make it.</h1>
        <p className="mt-5 text-lg text-stone">The page you are looking for has moved or does not exist. Let&apos;s get you back in the game.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/shop" className="btn btn-outline">Shop all dresses</Link>
        </div>
      </div>
    </section>
  );
}
