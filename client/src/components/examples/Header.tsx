import Header from "../Header";

export default function HeaderExample() {
	return (
		<div>
			<Header />
			<div className="h-4" />
			<Header showBackButton onBack={() => console.log("Back clicked")} />
		</div>
	);
}
