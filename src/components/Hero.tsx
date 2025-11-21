import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CreditCard, FileText, Users, Ticket, Briefcase, MessageSquare } from "lucide-react";
const Hero = () => {
  const featuredApps = [{
    icon: Briefcase,
    name: "Assets",
    description: "Track business assets and calculate depreciation",
    color: "text-green-600",
    path: "/apps/assets"
  }, {
    icon: Users,
    name: "Attendance",
    description: "Employee management and attendance tracking system",
    color: "text-pink-600",
    path: "/apps/attendance"
  }, {
    icon: BarChart3,
    name: "CRM",
    description: "Manage leads, contacts, and deals in one unified platform",
    color: "text-blue-600",
    path: "/apps/crm"
  }, {
    icon: FileText,
    name: "Invoicing",
    description: "Create and manage professional invoices with ease",
    color: "text-purple-600",
    path: "/apps/invoicing"
  }, {
    icon: Ticket,
    name: "IT Help Desk",
    description: "Streamline customer support with ticket management",
    color: "text-cyan-600",
    path: "/apps/it-help-desk"
  }, {
    icon: CreditCard,
    name: "Subscriptions",
    description: "Manage recurring subscriptions and billing efficiently",
    color: "text-orange-600",
    path: "/apps/subscriptions"
  }];
  return <section className="relative pt-20 pb-12 px-4 bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: "1s"
      }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="space-y-10">
          {/* Main Hero Content */}
          <div className="space-y-6 animate-fade-in text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="inline-block animate-scale-in">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  ✨ Trusted by 10,000+ businesses worldwide
                </span>
              </div>
              <h1 className="text-5xl font-bold text-foreground leading-tight lg:text-6xl font-display animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Simplify Operations,{" "}
                <span className="bg-gradient-to-r from-primary via-primary-hover to-accent bg-clip-text text-transparent">
                  Amplify Growth
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                All-in-one business management platform designed for modern teams. 
                Manage everything from CRM to invoicing in one beautiful interface.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Link to="/login">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 group h-12 px-8">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="h-12 px-8 hover:bg-muted transition-all duration-300">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Apps Grid */}
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Powerful Tools for Every Business Need
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
              {featuredApps.map((app, index) => <Link key={index} to={app.path} className="block h-full animate-fade-in" style={{ animationDelay: `${0.5 + index * 0.05}s` }}>
                  <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-5 shadow-sm hover:shadow-xl transition-all duration-300 group hover:border-primary/40 hover:-translate-y-1 h-full">
                    <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 ${app.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 w-fit mb-3`}>
                      <app.icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm mb-2">
                      {app.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {app.description}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>)}
            </div>
          </div>

          {/* Contact CTA Section */}
          <div className="animate-fade-in mt-8" style={{ animationDelay: "0.8s" }}>
            <Link to="/contact" className="block max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 backdrop-blur-sm border border-primary/20 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:border-primary/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-6">
                  <div className="p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-border text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <MessageSquare className="h-8 w-8" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2 font-display">
                      Need a Custom Solution?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our team specializes in building tailored tools for unique business requirements. 
                      Let's discuss your vision.
                    </p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all duration-300" strokeWidth={2} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;