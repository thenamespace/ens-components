import React from 'react';

type ThemeName = "light" | "dark";
interface ThemeContextValue {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    toggleTheme: () => void;
}
interface ThemeProviderProps {
    initialTheme?: ThemeName;
    useDocument?: boolean;
    children: React.ReactNode;
}
declare const ThemeProvider: React.FC<ThemeProviderProps>;
declare const useTheme: () => ThemeContextValue;

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    dataTestId?: string;
}
declare const Button: React.FC<ButtonProps>;

export { Button, type ButtonProps, type ButtonSize, type ButtonVariant, type ThemeContextValue, type ThemeName, ThemeProvider, type ThemeProviderProps, useTheme };
