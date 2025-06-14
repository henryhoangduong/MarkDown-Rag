"use client";
import React, { useState } from "react";
import Logo, { MobileLogo } from "./logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { ThemeSwitcherBtn } from "./theme-switcher-btn";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
const Navbar = () => {
  return (
    <div>
      <DesktopNavbar />
      <MobileNavBar />
    </div>
  );
};

export default Navbar;

const items = [
  { label: "Chat", link: "/" },
  { label: "Files", link: "/files" },
];

const DesktopNavbar = () => {
  const { data, isPending } = useQuery({
    queryKey: ["files"],
    queryFn: async () =>
      await fetch("/api/files", { method: "GET" })
        .then((res) => res.json())
        .catch(),
  });
  const items = [
    { label: "Chat", link: `/chat/files/` },
    { label: "Files", link: "/files" },
  ];
  return (
    <div className="hidden border-separate border-b bg-background md:block">
      <nav className="container flex items-center justify-between px-8">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <Logo />
          <div className="flex h-full ">
            {!isPending &&
              items.map((item, index) => (
                <NavbarItem
                  key={index}
                  link={
                    item.label == "Chat" ? item.link + data[0].name : item.link
                  }
                  label={item.label}
                />
              ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcherBtn />
        </div>
      </nav>
    </div>
  );
};

const MobileNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="block border-seperate bg-background md:hidden">
      <nav className="container flex items-center justify-between px-8">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size={"icon"}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]" side={"left"}>
            <Logo />
            <div className="flex flex-col gap-1 pt-4">
              {items.map((item, index) => (
                <NavbarItem key={index} link={item.link} label={item.label} />
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <MobileLogo />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcherBtn />
        </div>
      </nav>
    </div>
  );
};

const NavbarItem = ({ link, label }: { link: string; label: string }) => {
  const pathName = usePathname();
  const isActive = pathName == link;
  return (
    <div className="relative flex items-center">
      <Link
        href={link}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
          isActive && "text-foreground",
        )}
      >
        {label}{" "}
      </Link>
      {isActive && (
        <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block"></div>
      )}
    </div>
  );
};
