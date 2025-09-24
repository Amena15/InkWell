"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"

export function MainNav() {
  const pathname = usePathname()

  const items = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Icons.logo className="h-5 w-5" />,
    },
    {
      href: "/documents",
      label: "Documents",
      icon: <Icons.fileText className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-16 items-center border-b px-4">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="font-bold">InkWell</span>
        </Link>
        <nav className="hidden items-center space-x-4 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="ml-auto flex items-center space-x-2">
        <ThemeToggle />
      </div>
    </div>
  )
}
