'use client'

import React, { type PropsWithChildren } from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider(
  { children, ...props }: PropsWithChildren<ThemeProviderProps>
) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
