import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-card mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Placenta Academy
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Your trusted source for medical education notes and resources.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/notes" className="hover:text-foreground transition-colors">
                                    Browse Notes
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-foreground transition-colors">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">Connect</h3>
                        <p className="text-sm text-muted-foreground">
                            Questions or feedback? Reach out to the Placenta Academy team.
                        </p>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Placenta Academy. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
