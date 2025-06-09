
// components/Footer.tsx
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-6">
    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        © 2025 MyApp. {new Date().getFullYear()} 
      </div>
      <div className="flex space-x-6">
        <a href="/terms" className="hover:text-white transition-colors duration-200">Terms</a>
        <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</a>
        <a href="/contact" className="hover:text-white transition-colors duration-200">Contact</a>
      </div>
    </div>
  </footer>
);

export default Footer;