// components/Footer.tsx
import Link from "next/link";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-6">
    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        {" "}
        <p>
          © 2025 {process.env.NEXT_PUBLIC_APP_NAME}. Todos los derechos
          reservados.{new Date().getFullYear()}
        </p>
      </div>
      <div className="flex space-x-6">
        <Link href="terms" legacyBehavior>
          <a
            className="hover:text-white transition-colors duration-200"
            aria-label="Términos de Servicio"
          >
            Terms
          </a>
        </Link>
        <Link href="privacy" legacyBehavior>
          <a
            className="hover:text-white transition-colors duration-200"
            aria-label="Política de Privacidad"
          >
            Privacy
          </a>
        </Link>
        <Link href="contact" legacyBehavior>
          <a
            className="hover:text-white transition-colors duration-200"
            aria-label="Contáctanos"
          >
            Contact
          </a>
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
