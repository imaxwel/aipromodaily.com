import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import "cropperjs/dist/cropper.css";

export const metadata: Metadata = {
	title: {
		absolute: `${process.env.SITE_DOMAIN_NAME} - Application`,
		default: `${process.env.SITE_DOMAIN_NAME} - Application`,
		template: `%s | ${process.env.SITE_DOMAIN_NAME} - Application`,
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return children;
}
