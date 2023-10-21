"use client";
import { DownOutlined, MenuOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useState, type FC } from "react";
import { AuthContext } from "context/AuthContext";
import { GlobalContext } from "context/GlobalContext";
import { StorageKeys } from "utils";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export const Navbar: FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

  const path = usePathname();
  const { [StorageKeys.CURRENT_USER]: user, logoutUser } =
    useContext(AuthContext);

  const { [StorageKeys.SELECTED_LOCALE]: locale, changeLocale } =
    useContext(GlobalContext);

  const userMenu: MenuProps = {
    items: user
      ? [
          {
            label: (
              <Link href="/profile" className="normal-case text-base">
                Details
              </Link>
            ),
            key: "details",
          },
          {
            onClick: logoutUser,
            label: "Logout",
            key: "logout",
          },
        ]
      : [
          {
            onClick: () => setIsLoginOpen(true),
            label: "Login",
            key: "login",
          },
        ],
  };

  const localeMenu: MenuProps = {
    items: [
      { label: "EN", key: "EN" },
      { label: "FR", key: "FR" },
      { label: "DE", key: "DE" },
    ],
    onClick: (e) => changeLocale(e.key),
  };

  const cascadingMenu: MenuProps = {
    items: !path?.startsWith("/profile")
      ? [
          {
            label: "Profile",
            key: "profile",
            type: "group",
            children: userMenu.items,
          },
          { label: "Locale", key: "locale", children: localeMenu.items },
        ]
      : [{ label: "Locale", key: "locale", children: localeMenu.items }],
  };

  return (
    <div className="custom-navbar font-semibold">
      <ForgotPasswordForm
        isOpen={isForgotPassOpen}
        onClose={() => setIsForgotPassOpen(false)}
        onOpenLoginForm={() => {
          setIsForgotPassOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <LoginForm
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegisterForm={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onOpenForgotPassForm={() => {
          setIsLoginOpen(false);
          setIsForgotPassOpen(true);
        }}
      />
      <RegisterForm
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLoginForm={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <div>
        <Button
          type="text"
          size="large"
          style={{ display: "flex", fontWeight: 600 }}
          className="w-40 justify-evenly"
          icon={
            <Image
              src="/brandIcon.png"
              alt="Brand image"
              width={28}
              height={28}
            />
          }
          href="/"
        >
          Hiretown
        </Button>
      </div>
      <div className="justify-end gap-3">
        {!path?.startsWith("/profile") && (
          <Dropdown menu={userMenu} className="max-lg:hidden">
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Profile
                <DownOutlined rev="" />
              </Space>
            </a>
          </Dropdown>
        )}
        <Dropdown menu={localeMenu} className="max-lg:hidden">
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {locale}
              <DownOutlined rev="" />
            </Space>
          </a>
        </Dropdown>
        <div className="lg:hidden">
          <Dropdown menu={cascadingMenu}>
            <Button
              type="text"
              className="grid content-center"
              icon={<MenuOutlined rev="" style={{ fontSize: 24 }} />}
              size="large"
            />
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
