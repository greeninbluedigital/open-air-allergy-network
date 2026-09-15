export const NAV_LINKS = [
  { href: "/learn-about-ilit", label: "Learn About ILIT" },
  { href: "/find-a-provider", label: "Find a Provider" },
  { href: "/blog", label: "Blog" },
  { href: "/for-practices", label: "For Practices" },
  // Just "About", not "About / Contact" — patients have no legitimate reason
  // to hunt for "Contact" in primary nav (their path to a provider runs
  // entirely through Find a Provider -> PDP). Footer keeps both as separate
  // links to the same page (Section 9).
  { href: "/about", label: "About" },
];
