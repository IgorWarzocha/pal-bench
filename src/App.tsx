/**
 * src/App.tsx
 * Root application component with routing and global providers.
 * Sets up theme provider, navigation, and page routes.
 */
import { ThemeProvider } from "next-themes";
import { Route, Switch } from "wouter";
import { Header } from "./components/Header";
import { Toaster } from "./components/ui/sonner";
import { BrowsePage } from "./pages/BrowsePage";
import { HomePage } from "./pages/HomePage";
import { StatsPage } from "./pages/StatsPage";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/browse" component={BrowsePage} />
            <Route path="/stats" component={StatsPage} />
            <Route>
              <div className="flex h-[50vh] items-center justify-center">
                <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
              </div>
            </Route>
          </Switch>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
