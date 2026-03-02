import { useEffect, useState } from "react"
import { useTheme, CustomTheme } from "@/components/theme-provider"
import { generateThemeSuggestion } from "@/services/ai"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Wand2, Loader2, Moon, Sun, Droplets, Zap } from "lucide-react"

interface AIToggleThemeProps {
    todos: any[]
}

export function AIToggleTheme({ todos }: AIToggleThemeProps) {
    const { theme, setTheme, isAutoTheme, setIsAutoTheme } = useTheme()
    const [isAiLoading, setIsAiLoading] = useState(false)

    useEffect(() => {
        // Only fetch AI themes if Auto Theme is checked and we have some tasks
        if (!isAutoTheme || todos.length === 0) return

        const fetchAiTheme = async () => {
            try {
                setIsAiLoading(true)
                // Simplification for the prompt context
                const summaryArr = todos.map(t => ({ priority: t.priority, completed: t.completed }))
                const res = await generateThemeSuggestion(summaryArr)

                let newTheme: CustomTheme = "system"
                if (res?.theme === "neon-dark") newTheme = "theme-neon-dark"
                else if (res?.theme === "deep-ocean") newTheme = "theme-deep-ocean"
                else newTheme = "system"

                if (theme !== newTheme) {
                    setTheme(newTheme)
                }
            } catch (error) {
                console.error("Failed to generate AI theme suggestion", error)
            } finally {
                setIsAiLoading(false)
            }
        }

        // Debounce to prevent too many API requests if user quickly marks multiple tasks
        const timer = setTimeout(fetchAiTheme, 2000)
        return () => clearTimeout(timer)
    }, [todos, isAutoTheme]) // Rerun when todos list changes or auto theme is toggled

    const getThemeIcon = () => {
        if (isAutoTheme) {
            if (isAiLoading) return <Loader2 className="h-4 w-4 animate-spin text-primary" />
            return <Wand2 className="h-4 w-4 text-purple-500 animate-pulse" />
        }

        switch (theme) {
            case "dark": return <Moon className="h-4 w-4" />
            case "theme-deep-ocean": return <Droplets className="h-4 w-4 text-blue-500" />
            case "theme-neon-dark": return <Zap className="h-4 w-4 text-pink-500" />
            default: return <Sun className="h-4 w-4" />
        }
    }

    return (
        <div className="flex items-center space-x-2 bg-secondary/30 px-3 py-2 rounded-full backdrop-blur-sm border shadow-sm">
            <div className="flex items-center gap-1.5 mr-2">
                {getThemeIcon()}
                <Label htmlFor="ai-theme-mode" className="text-xs font-semibold cursor-pointer whitespace-nowrap hidden sm:inline-block">
                    AI Theme {isAutoTheme ? 'On' : 'Off'}
                </Label>
            </div>
            <Switch
                id="ai-theme-mode"
                checked={isAutoTheme}
                onCheckedChange={setIsAutoTheme}
                className="data-[state=checked]:bg-purple-500"
            />
        </div>
    )
}
