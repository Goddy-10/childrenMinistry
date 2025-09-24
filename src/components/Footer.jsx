import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-pink-500 mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-pink-500" />
              <span>+254 725016793</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-pink-500" />
              <span>gracecelebrationchapel@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-500" />
              <span>GCC Karama, Meru</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-pink-500 mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/events" className="hover:text-pink-400 transition">
                Events
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-bold text-pink-500 mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <Facebook className="w-5 h-5 hover:text-pink-400 transition" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <Instagram className="w-5 h-5 hover:text-pink-400 transition" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <Twitter className="w-5 h-5 hover:text-pink-400 transition" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              <Youtube className="w-5 h-5 hover:text-pink-400 transition" />
            </a>
            <a
              href="https://wa.me/254712345678"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="w-5 h-5 hover:text-pink-400 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-900 py-4 text-center text-s">
        © {new Date().getFullYear()} GCC Karama Church. All Rights Reserved.
      </div>
    </footer>
  );
}
