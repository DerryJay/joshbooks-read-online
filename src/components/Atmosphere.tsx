/** Ambient caustic light layer shared by every page. */
export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="caustics absolute inset-[-10%] animate-caustics opacity-50" />
      <div className="absolute -left-16 -top-20 h-72 w-72 animate-drift rounded-full bg-glass/40 blur-3xl" />
      <div className="absolute -right-10 top-1/3 h-64 w-64 animate-drift rounded-full bg-sand/10 blur-3xl [animation-delay:-4s]" />
      <div className="absolute bottom-0 left-1/4 h-56 w-56 animate-drift rounded-full bg-water/60 blur-3xl [animation-delay:-8s]" />
    </div>
  );
}
