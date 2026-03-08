"use client";

import type {NavbarProps} from "@heroui/react";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
  Divider,
  cn,
} from "@heroui/react";
import {Icon} from "@iconify/react";

import {AcmeIcon} from "./social";
import { BriefcaseBusiness } from "lucide-react";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/lib/features/auth/authSlice";
import "@/styles/globals.css";

type MenuItem = {
    title: string;
    href: string;
};

const menuItems: MenuItem[] = [
    { title: "Продукт", href: "/product" },
    { title: "Интеграции", href: "/integrations" },
    { title: "Тарифы", href: "/pricing" },
    { title: "Кейсы", href: "/cases" },
    { title: "FAQ", href: "/faq" },
];

const BasicNavbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({classNames = {}, ...props}, ref) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

      const user = useSelector(selectCurrentUser)
      const isAuth = Boolean(user)


      return (
      <Navbar
        ref={ref}
        {...props}
        classNames={{
          base: cn("border-default-100 bg-transparent", {
            "bg-default-200/50 dark:bg-default-100/50": isMenuOpen,
          }),
          wrapper: "w-full justify-center",
          item: "hidden md:flex",
          ...classNames,
        }}
        height="60px"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* Left Content */}
        <NavbarBrand>
          <div className="text-white">
            <BriefcaseBusiness size={34} />
          </div>
          <span className="ml-2 text-small font-medium text-default-foreground uppercase">Workload</span>
        </NavbarBrand>

        {/* Center Content */}
        <NavbarContent justify="center">
          <NavbarItem isActive className="data-[active='true']:font-medium[date-active='true']">
            <Link aria-current="page" className="text-default-foreground" href="#" size="sm">
                Продукт
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link className="text-default-500" href="#" size="sm">
                Интеграции
            </Link>
          </NavbarItem>
            <NavbarItem>
                <Link className="text-default-500" href="#" size="sm">
                    Тарифы
                </Link>
            </NavbarItem>
          <NavbarItem>
            <Link className="text-default-500" href="#" size="sm">
                Кейсы
            </Link>
          </NavbarItem>
            <NavbarItem>
                <Link className="text-default-500" href="#" size="sm">
                    FAQ
                </Link>
            </NavbarItem>
        </NavbarContent>

        {/* Right Content */}
          <NavbarContent className="hidden md:flex" justify="end">
              {!isAuth ? (
                  <NavbarItem className="ml-2 !flex gap-2">
                      <Button
                          as={Link}
                          href="/auth/sign-in"
                          className="text-default-500"
                          radius="full"
                          variant="light"
                      >
                          Войти
                      </Button>
                      <Button
                          as={Link}
                          href="/auth/sign-up"
                          className="bg-default-foreground font-medium text-background"
                          endContent={<Icon icon="solar:alt-arrow-right-linear" />}
                          radius="full"
                          variant="flat"
                      >
                          Создать аккаунт
                      </Button>
                  </NavbarItem>
              ) : (
                  <NavbarItem>
                      <Button
                          as={Link}
                          href="/dashboard"
                          className="bg-default-foreground text-background"
                          radius="full"
                      >
                          В кабинет
                      </Button>
                  </NavbarItem>
              )}
          </NavbarContent>

        <NavbarMenuToggle className="text-default-400 md:hidden" />

        <NavbarMenu
          className="top-[calc(var(--navbar-height)_-_1px)] max-h-fit bg-default-200/50 pb-6 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
          motionProps={{
            initial: {opacity: 0, y: -20},
            animate: {opacity: 1, y: 0},
            exit: {opacity: 0, y: -20},
            transition: {
              ease: "easeInOut",
              duration: 0.2,
            },
          }}
        >
            {!isAuth && (
                <>
                    <NavbarMenuItem>
                        <Button fullWidth as={Link} href="/auth/sign-in" variant="faded">
                            Войти
                        </Button>
                    </NavbarMenuItem>

                    <NavbarMenuItem className="mb-4">
                        <Button
                            fullWidth
                            as={Link}
                            className="bg-foreground text-background"
                            href="/auth/sign-up"
                        >
                            Создать аккаунт
                        </Button>
                    </NavbarMenuItem>
                </>
            )}

            {isAuth && (
                <NavbarMenuItem className="mb-4">
                    <Button
                        fullWidth
                        as={Link}
                        className="bg-foreground text-background"
                        href="/dashboard"
                    >
                        В кабинет
                    </Button>
                </NavbarMenuItem>
            )}
            {menuItems.map((item, index) => (
                <NavbarMenuItem key={`${item.title}-${index}`}>
                    <Link
                        className="mb-2 w-full text-default-500"
                        href={item.href}
                        size="md"
                    >
                        {item.title}
                    </Link>
                    {index < menuItems.length - 1 && <Divider className="opacity-50" />}
                </NavbarMenuItem>
            ))}
        </NavbarMenu>
      </Navbar>
    );
  },
);

BasicNavbar.displayName = "BasicNavbar";

export default BasicNavbar;
