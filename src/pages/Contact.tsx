import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Instagram, Linkedin, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function Contact() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Balik
                </Button>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Hubungi Gue</h1>
                        <p className="text-muted-foreground">
                            Ada kripik pedas? Atau mau ngajak collab? Gasin aja dibawah.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {/* Email */}
                        <a href="mailto:adityafakhri03@gmail.com" className="block group">
                            <Card className="hover:shadow-md transition-all border-l-4 border-l-red-500 group-hover:border-l-red-600">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                        <Mail className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Email</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        adityafakhri03@gmail.com
                                    </p>
                                </CardContent>
                            </Card>
                        </a>

                        {/* Instagram */}
                        <a href="https://instagram.com/adityafakhrii" target="_blank" rel="noopener noreferrer" className="block group">
                            <Card className="hover:shadow-md transition-all border-l-4 border-l-pink-500 group-hover:border-l-pink-600">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                                        <Instagram className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Instagram</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        @adityafakhrii
                                    </p>
                                </CardContent>
                            </Card>
                        </a>

                        {/* LinkedIn */}
                        <a href="https://www.linkedin.com/in/adityafakhrii/" target="_blank" rel="noopener noreferrer" className="block group">
                            <Card className="hover:shadow-md transition-all border-l-4 border-l-blue-600 group-hover:border-l-blue-700">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        <Linkedin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">LinkedIn</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        adityafakhrii
                                    </p>
                                </CardContent>
                            </Card>
                        </a>

                        {/* Github */}
                        <a href="https://github.com/adityafakhrii" target="_blank" rel="noopener noreferrer" className="block group">
                            <Card className="hover:shadow-md transition-all border-l-4 border-l-gray-800 dark:border-l-gray-400 group-hover:border-l-black dark:group-hover:border-l-white">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                        <Github className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">GitHub</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        adityafakhrii
                                    </p>
                                </CardContent>
                            </Card>
                        </a>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
