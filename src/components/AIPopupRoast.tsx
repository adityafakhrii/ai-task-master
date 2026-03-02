import { useEffect, useState } from 'react';
import { generateAIRoast } from '@/services/ai';
export interface Todo {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    category: string | null;
    created_at: string;
    updated_at: string;
    due_date: string | null;
    estimated_duration_minutes: number | null;
    tags: string[] | null;
}
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FlameIcon } from 'lucide-react';

interface AIPopupRoastProps {
    todos: Todo[];
}

export function AIPopupRoast({ todos }: AIPopupRoastProps) {
    const [open, setOpen] = useState(false);
    const [roastMessage, setRoastMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only run this once per session so it's not super annoying
        if (sessionStorage.getItem('ai_roast_shown')) return;

        // Determine if there are high priority tasks that are overdue
        const overdueHighPriority = todos.filter(
            t => !t.completed && t.priority === 'high' && t.due_date && new Date(t.due_date) < new Date()
        );

        // Give it a small delay so it doesn't instantly jump scare the user
        if (overdueHighPriority.length > 0) {
            const timer = setTimeout(() => {
                setOpen(true);

                const fetchRoast = async () => {
                    try {
                        const taskData = overdueHighPriority.map(t => ({ title: t.title, due_date: t.due_date }));
                        const res = await generateAIRoast(taskData);
                        if (res?.roast_message) {
                            setRoastMessage(res.roast_message);
                        } else {
                            setRoastMessage("Bro, tugas penting lu banyak yang numpuk tuh. Dikerjain napa!");
                        }
                    } catch (error) {
                        setRoastMessage("Bro, tugas penting lu banyak yang numpuk tuh. Jangan ditunda-tunda!");
                    } finally {
                        setLoading(false);
                        sessionStorage.setItem('ai_roast_shown', 'true');
                    }
                };

                fetchRoast();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [todos]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md border-orange-500 bg-orange-50/95 dark:bg-orange-950/95 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <FlameIcon className="h-5 w-5 animate-pulse" />
                        AI Roast: Wake Up Bro!
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="pt-4 text-slate-800 dark:text-slate-200 text-lg font-medium leading-relaxed">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-pulse">AI lagi nyiapin kata-kata pedas buat lu... 🔥</span>
                                </span>
                            ) : (
                                <span className="whitespace-pre-wrap">{roastMessage}</span>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        variant="default"
                        onClick={() => setOpen(false)}
                        className="bg-orange-600 hover:bg-orange-700 text-white w-full mt-4 transition-all duration-300 transform hover:scale-105"
                    >
                        Iya ampun, gue kerjain sekarang! 🏃‍♂️💨
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
