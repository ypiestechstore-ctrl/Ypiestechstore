import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SellPage() {
    return (
        <div className="container py-10">
            <h1 className="mb-8 text-3xl font-bold">Sell Your Device</h1>
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <p className="text-lg text-muted-foreground">
                        Looking to upgrade? We buy used computers, laptops, and components.
                        Get a competitive offer for your pre-loved tech today.
                    </p>
                    <div className="rounded-lg border bg-muted p-6">
                        <h3 className="mb-4 text-xl font-bold">How it works</h3>
                        <ul className="list-inside list-decimal space-y-2">
                            <li>Fill out the form with your device details.</li>
                            <li>Receive a preliminary quote from our team.</li>
                            <li>Bring your device in-store for a final inspection.</li>
                            <li>Get paid instantly via EFT or Cash.</li>
                        </ul>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Request a Quote</CardTitle>
                        <CardDescription>
                            Tell us about the device you want to sell.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="your@email.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" placeholder="082 123 4567" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="device">Device Model</Label>
                                <Input id="device" placeholder="e.g. MacBook Pro 2020 M1" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="specs">Specs & Condition</Label>
                                <textarea
                                    id="specs"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Please describe the specs (RAM, Storage) and condition of the device..."
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
