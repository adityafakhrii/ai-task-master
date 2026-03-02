import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const AUTO_THEME_KEY = "vite-ui-theme-auto"

export type CustomTheme = "light" | "dark" | "system" | "theme-deep-ocean" | "theme-neon-dark"

interface CustomThemeProviderState {
    isAutoTheme: boolean;
    setIsAutoTheme: (auto: boolean) => void;
}

const CustomThemeContext = React.createContext<CustomThemeProviderState>({
    isAutoTheme: true,
    setIsAutoTheme: () => null,
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const [isAutoTheme, setIsAutoTheme] = React.useState<boolean>(() => {
        const auto = localStorage.getItem(AUTO_THEME_KEY)
        return auto !== "false"
    })

    const setAutoState = React.useCallback((auto: boolean) => {
        localStorage.setItem(AUTO_THEME_KEY, auto ? "true" : "false")
        setIsAutoTheme(auto)
    }, [])

    return (
        <CustomThemeContext.Provider value={{ isAutoTheme, setIsAutoTheme: setAutoState }}>
            <NextThemesProvider
                themes={["light", "dark", "system", "theme-deep-ocean", "theme-neon-dark"]}
                {...props}
            >
                {children}
            </NextThemesProvider>
        </CustomThemeContext.Provider>
    )
}

export function useTheme() {
    const nextThemeContext = useNextTheme()
    const customContext = React.useContext(CustomThemeContext)

    return {
        ...nextThemeContext,
        ...customContext
    }
}
