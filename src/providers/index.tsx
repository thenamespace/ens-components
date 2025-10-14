import { SidebarProvider } from "@/components/ui/sidebar";
import type { PropsWithChildren } from "react";
import { WalletConnect } from "./wallet-connect";
import { ThemeProvider } from "./theme";

export const ProviderTree = ({ children }: PropsWithChildren) => {
	return (
		<ThemeProvider>
			<WalletConnect>
				<SidebarProvider>
					<div>{children}</div>
				</SidebarProvider>
			</WalletConnect>
		</ThemeProvider>
	);
};
