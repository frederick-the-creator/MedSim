import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import CasePractice from "@/pages/casePractice";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";

function Router() {
	return (
		<Switch>
            <Route path="/" component={Landing} />
            <Route path="/home" component={Home} />
			<Route path="/login" component={Login} />
			<Route path="/signup" component={Signup} />
			<Route path="/case/:id" component={CasePractice} />
			<Route component={NotFound} />
		</Switch>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Router />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
