import Link from 'next/link';
import { NewsletterForm } from '../ui/NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] mt-24">
      {/* Red accent line at top of footer */}
      <div className="h-[2px] bg-[var(--color-yan-red)]" />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20">

          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <span className="font-display text-4xl font-semibold tracking-[0.02em] text-[var(--color-yan-ivory)]">
                YAN MAG
              </span>
            </Link>
            <p className="text-[var(--color-yan-stone)] text-[15px] leading-relaxed max-w-sm">
              Explorando la intersección del diseño, la cultura y el estilo de vida
              contemporáneo con una mirada editorial y arquitectónica.
            </p>
          </div>

          {/* Navigation column */}
          <div className="md:col-span-3 md:col-start-6">
            <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-stone)] mb-6">
              Explorar
            </h4>
            <nav className="flex flex-col gap-3">
              {['Diseño', 'Cultura', 'Moda', 'Arquitectura', 'Entrevistas'].map((cat) => (
                <Link
                  key={cat}
                  href={`/categoria/${cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-')}`}
                  className="text-[var(--color-yan-stone)] hover:text-[var(--color-yan-ivory)] transition-colors duration-300 text-[15px] w-fit"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter column */}
          <div className="md:col-span-4 md:col-start-9">
            <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-stone)] mb-6">
              Boletín Semanal
            </h4>
            <p className="text-[var(--color-yan-stone)] text-sm mb-6 leading-relaxed">
              Recibe nuestras mejores historias directamente en tu bandeja de entrada.
            </p>
            <NewsletterForm variant="dark" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[var(--color-yan-stone)] tracking-wide">
            © {new Date().getFullYear()} YAN MAG. Todos los derechos reservados.
          </p>
          <div className="flex gap-8 text-[12px] text-[var(--color-yan-stone)]">
            <Link href="/privacidad" className="hover:text-[var(--color-yan-ivory)] transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-[var(--color-yan-ivory)] transition-colors">
              Términos
            </Link>
            <Link href="/contacto" className="hover:text-[var(--color-yan-ivory)] transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
