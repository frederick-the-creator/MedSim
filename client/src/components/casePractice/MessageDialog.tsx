import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type MessageDialogProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	title: string;
	description?: string;
	showSpinner?: boolean;
	actionLabel?: string;
	onAction?: () => void;
	hideCloseButton?: boolean;
};

const MessageDialog: React.FC<MessageDialogProps> = ({
	open,
	onOpenChange,
	title,
	description,
	showSpinner,
	actionLabel,
	onAction,
	hideCloseButton,
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md" hideCloseButton={hideCloseButton}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && (
						<DialogDescription>{description}</DialogDescription>
					)}
				</DialogHeader>
				{showSpinner && (
					<div className="flex items-center justify-center py-10">
						<div
							className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
							aria-label="loading"
						/>
					</div>
				)}
				{actionLabel && (
					<div className="mt-4 flex justify-end">
						<Button onClick={onAction}>{actionLabel}</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default MessageDialog;


