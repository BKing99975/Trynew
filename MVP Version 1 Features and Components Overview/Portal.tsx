import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Portal() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <section className="py-20 md:py-32 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 neon-glow-pink">
                Client Portal
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                Sign in to access your learning modules, support tickets, and saved results.
              </p>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Determine subscription status from user role and Stripe fields
  const isPro = user?.role === "pro" || user?.role === "premium";
  const planName = user?.role === "premium" ? "Premium" : user?.role === "pro" ? "Pro" : "Free";
  const planPrice = user?.role === "premium" ? "Custom" : user?.role === "pro" ? "$24.99/mo" : "Free";
  const stripeSubStatus = user?.stripeSubStatus || "none";
  const currentPeriodEnd = user?.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleDateString() : null;
  const stripeSubId = user?.stripeSubscriptionId || null;

  const getStatusBadgeColor = () => {
    switch (stripeSubStatus) {
      case "active":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "trialing":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "canceled":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <section className="py-12 border-b border-border bg-gradient-to-r from-accent/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 neon-glow-pink">
                Welcome, {user?.name || "User"}
              </h1>

              {/* Plan Information Card */}
              <Card className="p-6 border-border bg-card/50 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 font-semibold">Current Plan</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{planName}</h2>
                      <Badge className={getStatusBadgeColor()}>
                        {stripeSubStatus === "active"
                          ? "Active"
                          : stripeSubStatus === "trialing"
                            ? "Trial"
                            : stripeSubStatus === "canceled"
                              ? "Canceled"
                              : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{planPrice}</p>
                  </div>

                  <div>
                    {currentPeriodEnd && (
                      <>
                        <p className="text-sm text-muted-foreground mb-2 font-semibold">Renewal Date</p>
                        <p className="text-lg font-semibold text-accent">{currentPeriodEnd}</p>
                      </>
                    )}
                    {stripeSubId && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Subscription ID: {stripeSubId.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {!isPro && (
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-fit"
                onClick={() => (window.location.href = "/pricing")}
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modules">Learning</TabsTrigger>
              <TabsTrigger value="tickets">Support</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="p-8 border-border">
                <h3 className="text-xl font-bold mb-4">Subscription Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold">{user?.email || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-semibold">{planName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStatusBadgeColor()}>
                      {stripeSubStatus === "active"
                        ? "Active"
                        : stripeSubStatus === "trialing"
                          ? "Trial"
                          : stripeSubStatus === "canceled"
                            ? "Canceled"
                            : "Inactive"}
                    </Badge>
                  </div>
                  {currentPeriodEnd && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Next Billing Date</span>
                      <span className="font-semibold">{currentPeriodEnd}</span>
                    </div>
                  )}
                </div>
              </Card>

              {isPro && (
                <Card className="p-8 border-border bg-accent/5">
                  <h3 className="text-xl font-bold mb-4">Pro Features Unlocked</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span>Advanced guides & lighting plots</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span>Video learning modules</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span>Readiness Checker wizard</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span>Priority email support</span>
                    </li>
                  </ul>
                </Card>
              )}
            </TabsContent>

            {/* Learning Modules Tab */}
            <TabsContent value="modules">
              <Card className="p-8 border-border text-center">
                <p className="text-muted-foreground mb-4">Video learning modules coming soon</p>
                <p className="text-sm text-muted-foreground">
                  {isPro
                    ? "As a Pro member, you'll have access to all video content."
                    : "Upgrade to Pro to access video learning modules."}
                </p>
              </Card>
            </TabsContent>

            {/* Support Tickets Tab */}
            <TabsContent value="tickets">
              <Card className="p-8 border-border text-center">
                <p className="text-muted-foreground mb-4">Support ticket system coming soon</p>
                <p className="text-sm text-muted-foreground">
                  Submit and track support requests here.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
