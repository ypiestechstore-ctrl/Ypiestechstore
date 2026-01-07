import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40 font-sans">
            <div className="container py-12 md:py-16 lg:py-20">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="Ypie's Tech Store"
                                width={180}
                                height={50}
                                className="h-12 w-auto mb-4"
                            />
                        </Link>
                        <h3 className="text-lg font-bold">About Us</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Ypiestechstore: Your destination for top-quality refurbished tech. We are gamers building for gamers, ensuring affordable access to high-performance computing.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/catalog" className="hover:text-primary transition-colors">Shop</Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
                            </li>
                            <li>
                                <Link href="/warranty" className="hover:text-primary transition-colors">Warranty Check</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Contact Info</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>
                                    Shop Nr. 9, Giessenburg centre<br />
                                    252 Ben Viljoen St<br />
                                    Pretoria North, 0182
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <a href="tel:0645127972" className="hover:text-primary transition-colors">064 512 7972</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0" />
                                <a href="mailto:sales@ypiestechstore.co.za" className="hover:text-primary transition-colors">sales@ypiestechstore.co.za</a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Business Hours</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex justify-between">
                                <span>Mon - Fri</span>
                                <span>8:30am - 5pm</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Saturday</span>
                                <span>9am - 2pm</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Sunday</span>
                                <span>Closed</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Ypies Tech Store. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Facebook className="h-5 w-5" />
                            <span className="sr-only">Facebook</span>
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Instagram className="h-5 w-5" />
                            <span className="sr-only">Instagram</span>
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Twitter className="h-5 w-5" />
                            <span className="sr-only">Twitter</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
