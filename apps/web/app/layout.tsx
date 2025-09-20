import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import "cropperjs/dist/cropper.css";

export const metadata: Metadata = {
	title: {
		absolute: "aipromodaily.com - Application",
		default: "aipromodaily.com- Application",
		template: "%s | aipromodaily.com - Application",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return children;
}
