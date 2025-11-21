import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import logo from "@/assets/appmaster-logo.png";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [accountType, setAccountType] = useState<'personal' | 'organization'>('personal');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const redirectTo = (location.state as any)?.redirectTo || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle email not confirmed error specifically
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link to activate your account.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            organisation_name: accountType === 'organization' ? orgName : name,
            account_type: accountType,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created! Please check your email to verify.",
      });

      if (data.user) {
        navigate(redirectTo);
      } else {
        setIsSignup(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4">
      <Card className="w-full max-w-md p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <img src={logo} alt="AppMaster" className="h-12 w-auto" />
          </div>
          <p className="text-sm text-muted-foreground">Manage your business in one place</p>
        </div>

        {!isSignup ? (
          /* Login Form */
          <>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <Label htmlFor="login-email" className="text-sm">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="login-password" className="text-sm">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-center pt-1">
                <Button type="submit" className="w-40" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <Link to="/password-reset" className="text-primary hover:underline">
                  Forgot password?
                </Link>
                <div className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsSignup(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          /* Sign Up Form */
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Create Account</h3>
              <button
                onClick={() => setIsSignup(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Login
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              {/* Account Type Toggle */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Account Type</Label>
                <ToggleGroup 
                  type="single" 
                  value={accountType}
                  onValueChange={(value) => value && setAccountType(value as 'personal' | 'organization')}
                  className="justify-start"
                >
                  <ToggleGroupItem value="personal" className="flex-1">
                    Individual
                  </ToggleGroupItem>
                  <ToggleGroupItem value="organization" className="flex-1">
                    Organization
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <Label htmlFor="signup-name" className="text-sm">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              {accountType === 'organization' && (
                <div className="animate-fade-in">
                  <Label htmlFor="signup-org" className="text-sm">Organisation Name</Label>
                  <Input
                    id="signup-org"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Acme Corp"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="signup-email" className="text-sm">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="signup-password" className="text-sm">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-center pt-1">
                <Button type="submit" className="w-40" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default Login;
