"use client";
import { Button } from "@ui/components/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useIsRTL } from "@shared/hooks/use-is-rtl";

export type PaginatioProps = {
	className?: string;
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	onChangeCurrentPage: (page: number) => void;
};

const Pagination = ({
	currentPage,
	totalItems,
	itemsPerPage,
	className,
	onChangeCurrentPage,
}: PaginatioProps) => {
	const numberOfPages = Math.ceil(totalItems / itemsPerPage);
	const isRTL = useIsRTL();

	return (
		<div className={className}>
			<div className="flex items-center justify-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					disabled={currentPage === 1}
					onClick={() => onChangeCurrentPage(currentPage - 1)}
				>
					{isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
				</Button>
				<span className="text-gray-500 text-sm">
					{currentPage * itemsPerPage - itemsPerPage + 1} -{" "}
					{currentPage * itemsPerPage > totalItems
						? totalItems
						: currentPage * itemsPerPage}{" "}
					of {totalItems}
				</span>
				<Button
					variant="ghost"
					size="icon"
					disabled={currentPage === numberOfPages}
					onClick={() => onChangeCurrentPage(currentPage + 1)}
				>
					{isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />}
				</Button>
			</div>
		</div>
	);
};
Pagination.displayName = "Pagination";

export { Pagination };
