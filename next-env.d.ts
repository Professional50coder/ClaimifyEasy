// Minimal ambient declarations to allow the editor to resolve Next modules
// until dependencies are installed. This avoids TS errors like
// "Cannot find module 'next/navigation' or its corresponding type declarations.".

declare module "next/navigation" {
  export function redirect(url: string): never
  export function notFound(): never
  export function useRouter(): any
  export const cookies: any
}

declare module "next/link" {
  import * as React from "react"
  const Link: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }>
  export default Link
}

declare module "next/image" {
  import * as React from "react"
  const Image: React.ComponentType<any>
  export default Image
}

// Provide a minimal declaration to satisfy packages that reference the
// 'date-fns' type library implicitly.
declare module "date-fns"
