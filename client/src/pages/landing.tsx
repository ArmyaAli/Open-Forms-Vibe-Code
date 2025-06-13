import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ArrowRight, 
  Box,
  Zap,
  Shield,
  BarChart3,
  Palette,
  Users,
  Globe,
  Check,
  Star,
  Play,
  MousePointer,
  Smartphone,
  Lock
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      icon: MousePointer,
      title: "Drag & Drop Builder",
      description: "Intuitive interface with smooth animations makes form creation effortless and fun.",
      color: "bg-blue-500"
    },
    {
      icon: Palette,
      title: "Beautiful Themes",
      description: "Professional templates and customizable colors to match your brand perfectly.",
      color: "bg-purple-500"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track responses, completion rates, and user engagement with detailed insights.",
      color: "bg-green-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Forms look perfect on every device, from desktop to mobile phones.",
      color: "bg-orange-500"
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Enterprise-grade security keeps your data safe with advanced encryption.",
      color: "bg-red-500"
    },
    {
      icon: Globe,
      title: "Instant Sharing",
      description: "Share forms worldwide with a simple link. No registration required for users.",
      color: "bg-indigo-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechStart Inc.",
      content: "Open Forms transformed how we collect user feedback. The drag-and-drop interface is incredibly intuitive.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Director", 
      company: "Growth Co.",
      content: "We increased our survey completion rates by 40% after switching to Open Forms. The mobile experience is flawless.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "HR Specialist",
      company: "People First",
      content: "Creating employee surveys has never been easier. The analytics help us make data-driven decisions.",
      rating: 5
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Up to 3 forms",
        "100 responses/month",
        "Basic templates",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$19",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Unlimited forms",
        "10,000 responses/month",
        "Premium templates",
        "Advanced analytics",
        "Priority support",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$50",
      period: "/month",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Unlimited responses",
        "API access",
        "Dedicated support"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Open Forms</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Features</a>
              <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Pricing</a>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={() => setLocation("/login")}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setLocation("/register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Sign Up
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2">
              <Zap className="mr-2" size={16} />
              Now Live: Open Forms
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Build Beautiful Forms
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                In Minutes
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning, responsive forms with our intuitive drag-and-drop builder. 
              Collect responses, analyze data, and grow your business faster than ever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={() => setLocation("/register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
              >
                Start Building for Free
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setIsVideoPlaying(true)}
                className="text-lg px-8 py-4"
              >
                <Play className="mr-2" size={20} />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center">
                <Check className="mr-2 text-green-500" size={16} />
                No credit card required
              </div>
              <div className="flex items-center">
                <Check className="mr-2 text-green-500" size={16} />
                Free forever plan
              </div>
              <div className="flex items-center">
                <Check className="mr-2 text-green-500" size={16} />
                Setup in 2 minutes
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="max-w-6xl mx-auto mt-16 px-4 sm:px-6 lg:px-8">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              <div className="bg-white dark:bg-slate-800 rounded-lg">
                {!isVideoPlaying ? (
                  <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <Button 
                      size="lg"
                      onClick={() => setIsVideoPlaying(true)}
                      className="bg-white/90 text-slate-900 hover:bg-white shadow-lg"
                    >
                      <Play className="mr-2" size={24} />
                      Watch Open Forms in Action
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-900 flex items-center justify-center">
                    <p className="text-white text-lg">Demo video would play here</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Everything you need to create amazing forms
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Powerful features that make form building effortless and data collection meaningful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-200 dark:border-slate-600">
                  <CardContent className="p-0">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Loved by thousands of users
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              See what our customers are saying about OpenForms
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border border-slate-200 dark:border-slate-600">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Choose the plan that works best for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative p-6 ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 scale-105' 
                    : ''
                } border border-slate-200 dark:border-slate-600`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-slate-500 dark:text-slate-400">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="text-green-500 mr-3" size={16} />
                        <span className="text-slate-600 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => setLocation("/register")}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to build your first form?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust Open Forms to collect their data efficiently.
          </p>
          <Button 
            size="lg"
            onClick={() => setLocation("/register")}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Start Building Now
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Box className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-white">OpenForms</span>
              </div>
              <p className="text-slate-400">
                Build beautiful forms that convert. Simple, powerful, and designed for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 OpenForms.ca. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}