// components/Footer.tsx
import Link from "next/link";
import { useTranslation } from "next-i18next";

const Footer = () => {
  const { t } = useTranslation("common");
  return (
    <footer className="bg-gray-900 text-gray-400 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          {" "}
          <p>
            © 2025 {process.env.NEXT_PUBLIC_APP_NAME}. {t("all_rights_reserved")}
          </p>
        </div>
        <div className="flex space-x-6">
          <Link href="terms" legacyBehavior>
            <a
              className="hover:text-white transition-colors duration-200"
              aria-label={t("terms_of_service")}
            >
              {t("terms")}
            </a>
          </Link>
          <Link href="privacy" legacyBehavior>
            <a
              className="hover:text-white transition-colors duration-200"
              aria-label={t("privacy_policy")}
            >
              {t("privacy")}
            </a>
          </Link>
          <Link href="contact" legacyBehavior>
            <a
              className="hover:text-white transition-colors duration-200"
              aria-label={t("contact_us")}
            >
              {t("contact")}
            </a>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;