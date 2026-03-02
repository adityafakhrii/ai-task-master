import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface FocusModeProps {
    taskId: string;
    taskTitle: string;
    estimatedMinutes?: number | null;
    onComplete?: () => void;
    onClose?: () => void;
}

export function FocusMode({ taskId, taskTitle, estimatedMinutes, onComplete, onClose }: FocusModeProps) {
    const [timeLeft, setTimeLeft] = useState((estimatedMinutes || 25) * 60);
    const [isActive, setIsActive] = useState(false);
    const [subtasks, setSubtasks] = useState<{ title: string, completed: boolean }[]>([]);
    const [isLoadingSlicing, setIsLoadingSlicing] = useState(false);
    const { toast } = useToast();

    const totalTime = (estimatedMinutes || 25) * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            toast({
                title: "Waktu Habis!",
                description: "Bagus banget! Istirahat bentar ya.",
            });
            // Optionally ring a bell here
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, toast]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(totalTime);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const sliceTaskWithAI = async () => {
        try {
            setIsLoadingSlicing(true);
            const { data, error } = await supabase.functions.invoke('ai-parse-task', {
                body: {
                    text: `Pecahkan tugas ini menjadi 3-5 sub-tugas kecil yang dapat ditindaklanjuti. Judul Tugas: ${taskTitle}`,
                    type: 'slice'
                }
            });

            if (error) throw error;

            if (data && data.subtasks && Array.isArray(data.subtasks)) {
                setSubtasks(data.subtasks.map((st: string) => ({ title: st, completed: false })));
                toast({ title: 'Tugas berhasil dipecah AI' });
            } else {
                toast({ title: 'Gagal memecah tugas', description: 'Format tidak sesuai', variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoadingSlicing(false);
        }
    };

    const toggleSubtask = (index: number) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index].completed = !newSubtasks[index].completed;
        setSubtasks(newSubtasks);
    };

    return (
        <Card className="w-full max-w-md mx-auto border-primary/20 bg-background/95 backdrop-blur">
            <CardHeader className="text-center pb-2">
                <Badge variant="outline" className="w-fit mx-auto mb-2 text-primary border-primary/30 bg-primary/5">
                    Focus Mode
                </Badge>
                <CardTitle className="text-xl line-clamp-2">{taskTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Timer Display */}
                <div className="text-center space-y-4">
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-48 h-48 transform -rotate-90">
                            <circle
                                cx="96" cy="96" r="88"
                                className="stroke-muted fill-none"
                                strokeWidth="8"
                            />
                            <circle
                                cx="96" cy="96" r="88"
                                className="stroke-primary fill-none transition-all duration-1000 ease-linear"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 88}
                                strokeDashoffset={2 * Math.PI * 88 * (1 - (timeLeft / totalTime))}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold tracking-tighter text-primary">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-2">
                        <Button size="icon" variant={isActive ? "outline" : "default"} onClick={toggleTimer} className="h-12 w-12 rounded-full">
                            {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                        </Button>
                        <Button size="icon" variant="outline" onClick={resetTimer} className="h-12 w-12 rounded-full">
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* AI Task Slicing */}
                <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sub-Tugas</h4>
                        {subtasks.length === 0 && (
                            <Button size="sm" variant="secondary" className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={sliceTaskWithAI} disabled={isLoadingSlicing}>
                                <Sparkles className="h-3 w-3 mr-1" />
                                {isLoadingSlicing ? 'Mikir...' : 'Pecah pake AI'}
                            </Button>
                        )}
                    </div>

                    {subtasks.length > 0 && (
                        <div className="space-y-2">
                            {subtasks.map((task, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => toggleSubtask(idx)}
                                >
                                    <CheckCircle2 className={task.completed ? "h-5 w-5 text-primary shrink-0" : "h-5 w-5 text-muted-foreground/30 shrink-0"} />
                                    <span className={task.completed ? "text-sm line-through text-muted-foreground" : "text-sm"}>
                                        {task.title}
                                    </span>
                                </div>
                            ))}
                            <Progress value={(subtasks.filter(t => t.completed).length / subtasks.length) * 100} className="h-1.5 mt-2" />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    {onClose && (
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Tutup
                        </Button>
                    )}
                    {onComplete && (
                        <Button className="flex-1" onClick={onComplete}>
                            Tandai Selesai
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
