import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import "cropperjs/dist/cropper.css";

export const metadata: Metadata = {
	title: {
		absolute: "hope.do - Application",
		default: "hope.do- Application",
		template: "%s | hope.do - Application",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return children;
}
