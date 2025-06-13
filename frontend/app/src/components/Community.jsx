import {
    DiscIcon as DiscordIcon,
    Users,
    MessageCircle,
    Sparkles,
  } from "lucide-react";
  import { Button } from "./ui/button";
  import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "./ui/card";
  
  export default function Community() {
    return (
      <section className="py-16 md:py-24 container mx-auto">
        <div className="mx-auto container">
          <Card className="border-none shadow-none">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="flex flex-col items-center space-y-4">
                {/* Discord icon with subtle background */}
                <DiscordIcon className="w-10 h-10 text-primary" />
  
                {/* Title with improved typography */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold sm:text-5xl tracking-tight leading-tight">
                    Ready to join our {" "}
                    <span className="inline-block text-primary">
                      Amazing Community?
                    </span>
                  </h2>
                </div>
              </CardTitle>
            </CardHeader>
  
            <CardContent className="mx-auto px-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Join our vibrant Discord community! Connect, share, and grow with
                like-minded enthusiasts. Experience collaboration like never
                before! 🚀
              </p>
  
              {/* Community stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-muted/50 border">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    10K+ Members
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-muted/50 border">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Active Daily
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-muted/50 border">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    24/7 Support
                  </span>
                </div>
              </div>
            </CardContent>
  
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center px-8 pb-8">
              <Button
                asChild
                size="lg"
                className="text-base font-semibold transition-all duration-300 hover:scale-105"
              >
                <a
                  href="https://discord.com/"
                  target="_blank"
                  className="flex items-center space-x-2"
                  rel="noreferrer"
                >
                  <DiscordIcon className="w-5 h-5" />
                  <span>Join Discord</span>
                </a>
              </Button>
  
              <Button
                variant="outline"
                size="lg"
                className="text-base font-semibold transition-all duration-300"
              >
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    );
  }
  