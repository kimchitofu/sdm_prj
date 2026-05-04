import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  MapPin,
  Phone
} from 'lucide-react'

const footerLinks = {
  platform: [
    { href: '/browse', label: 'Browse Campaigns' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/auth/register', label: 'Start Fundraising' },
    { href: '/auth/register', label: 'Become a Donor' },
  ],
  resources: [
    { href: '#', label: 'Help Center' },
    { href: '#', label: 'Success Stories' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Fundraising Tips' },
  ],
  company: [
    { href: '/#about', label: 'About Us' },
    { href: '#', label: 'Careers' },
    { href: '#', label: 'Press' },
    { href: '#', label: 'Contact' },
  ],
  legal: [
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Cookie Policy' },
    { href: '#', label: 'Trust & Safety' },
  ],
}

const socialLinks = [
  { href: '#', icon: Facebook, label: 'Facebook' },
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Instagram, label: 'Instagram' },
  { href: '#', icon: Linkedin, label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Logo className="mb-4" />
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              FundBridge connects hearts with causes that matter. We empower fundraisers 
              and donors to make a real difference in communities worldwide.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 flex flex-wrap gap-6 border-t pt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>fundbridge.team@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>65 6468 8866</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Singapore</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FundBridge. Developed for Software Methods Project.</p>
          <p className="mt-1">Built for educational and demonstration purposes.</p>
        </div>
      </div>
    </footer>
  )
}
