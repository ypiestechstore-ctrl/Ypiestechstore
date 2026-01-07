import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="container py-10 space-y-12">
            <div className="flex flex-col items-center text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    We are here to help you with any question.
                </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Get in Touch</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Visit Us</h3>
                                    <p className="text-muted-foreground">
                                        Shop Nr. 9, Giessenburg centre<br />
                                        252 Ben Viljoen St<br />
                                        Pretoria North, Pretoria, 0182
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Call Us</h3>
                                    <p className="text-muted-foreground">
                                        <a href="tel:0645127972" className="hover:underline">064 512 7972</a>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Email Us</h3>
                                    <p className="text-muted-foreground">
                                        <a href="mailto:sales@ypiestechstore.co.za" className="hover:underline">sales@ypiestechstore.co.za</a>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Business Hours</h3>
                                    <p className="text-muted-foreground">
                                        Monday - Friday: 8:30am - 5pm<br />
                                        Saturday: 9am - 2pm
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Embedded Map */}
                    <div className="aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3595.686566678235!2d28.1818365!3d-25.6816353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ebfcdf276993a65%3A0xc0693a90c1598f1!2s252%20Ben%20Viljoen%20St%2C%20Pretoria%20North%2C%20Pretoria%2C%200182!5e0!3m2!1sen!2sza!4v1701984000000!5m2!1sen!2sza"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                    <form className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
                                <Input id="name" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                <Input id="email" type="email" placeholder="Your email" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Subject</label>
                            <Input id="subject" placeholder="How can we help?" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Message</label>
                            <Textarea id="message" placeholder="Type your message here..." className="min-h-[150px]" />
                        </div>
                        <Button className="w-full">Send Message</Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
