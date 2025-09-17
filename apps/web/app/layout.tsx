import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import "cropperjs/dist/cropper.css";

export const metadata: Metadata = {
	title: {
		absolute: "AIPromoDaily.com - Application",
		default: "AIPromoDaily.com- Application",
		template: "%s | AIPromoDaily.com - Application",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return children;
}
