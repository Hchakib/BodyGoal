import { motion } from 'motion/react';
import { 
  Dumbbell, Trophy, Flame, Star, Check, ArrowRight, 
  Zap, TrendingUp, Calendar, BarChart3, Target, Shield, 
  Bot, Brain, Sparkles, MessageCircle, Activity, Timer,
  BookOpen, Users, Award
} from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI Chatbot Assistant",
      description: "Your personal fitness coach powered by GPT-4. Get instant workout suggestions, nutrition advice, and motivation 24/7.",
      highlight: true
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Nutrition Tracking",
      description: "Just tell the AI what you ate. It calculates macros automatically and tracks your daily nutrition goals."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-Time Workout Timer",
      description: "Professional timer with rest intervals, auto-save, and exercise suggestions to keep you focused."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Personal Records",
      description: "Track your PRs automatically. Celebrate every milestone with detailed progression charts."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Planning",
      description: "Schedule workouts with AI recommendations. Get reminded and stay consistent with your training."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Beautiful charts and insights. See your volume trends, muscle balance, and weekly progress."
    }
  ];

  const chatbotFeatures = [
    "Add PRs with natural language",
    "Plan workouts intelligently",
    "Track nutrition automatically",
    "Get personalized training advice",
    "View your stats instantly",
    "Update your profile easily"
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#0B0B0F]/60 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-xl blur-md opacity-50"></div>
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center">
                  <Dumbbell className="w-6 h-6" />
                </div>
              </div>
              <span className="text-xl">BodyGoal</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                onClick={() => onNavigate('login')}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 shadow-lg shadow-[#22C55E]/20"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#22C55E]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-[#00D1FF]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge avec mention IA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#22C55E]/20 to-[#00D1FF]/20 border border-[#22C55E]/30 mb-8 backdrop-blur-xl"
            >
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              <span className="text-sm bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                Powered by AI • Trusted by 500K+ Athletes
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="mb-6 leading-[1.1]">
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3">
                  Your Fitness Journey,
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-[#22C55E] via-[#00D1FF] to-[#22C55E] bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                  Powered by AI
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed mx-auto max-w-3xl"
            >
              Track workouts, crush PRs, and optimize nutrition with an intelligent AI coach that understands your goals. 
              The future of fitness tracking is here.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button 
                size="lg"
                onClick={() => onNavigate('register')}
                className="group relative bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 px-10 py-7 text-lg shadow-2xl shadow-[#22C55E]/30"
              >
                <span className="flex items-center gap-2">
                  Start Free with AI Coach
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>Free AI chatbot included</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>100% free forever</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual - Chatbot Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 max-w-6xl mx-auto"
          >
            <div className="relative">
              {/* Main Chat Window */}
              <div className="relative mx-auto max-w-4xl bg-gradient-to-br from-[#151923] via-[#151923] to-[#0B0B0F] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#22C55E]/5 to-[#00D1FF]/5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] rounded-full border-2 border-[#151923]"></div>
                    </div>
                    <div>
                      <h3 className="text-lg">FitBot AI Coach</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
                        Online • Ready to help
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-xs text-[#22C55E]">
                      GPT-4 Powered
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 min-h-[400px]">
                  {/* Bot Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#0B0B0F] rounded-2xl rounded-tl-none p-4 max-w-md border border-white/5">
                      <p className="text-gray-300 leading-relaxed">
                        Hey champion! 👋 I'm your AI fitness coach. I can help you:
                        <br/><br/>
                        • Track nutrition automatically
                        <br/>
                        • Add PRs with natural language
                        <br/>
                        • Plan your workouts intelligently
                        <br/>
                        • Analyze your progress
                        <br/><br/>
                        What would you like to do today? 💪
                      </p>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] rounded-2xl rounded-tr-none p-4 max-w-md">
                      <p className="text-white">
                        I ate 200g of grilled chicken, how many calories is that?
                      </p>
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#0B0B0F] rounded-2xl rounded-tl-none p-4 max-w-md border border-white/5">
                      <p className="text-gray-300 leading-relaxed">
                        ✅ Meal added successfully! 🍽️
                        <br/><br/>
                        <span className="text-[#22C55E]">Grilled Chicken (200g)</span>
                        <br/>
                        📊 330 kcal | P: 62g | C: 0g | F: 7g
                        <br/><br/>
                        Great protein choice! 🔥
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-white/10 bg-gradient-to-r from-[#22C55E]/5 to-[#00D1FF]/5">
                  <div className="flex items-center gap-3 p-4 bg-[#0B0B0F] rounded-2xl border border-white/10">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Ask me anything about fitness, nutrition, or your workouts..."
                      className="flex-1 bg-transparent outline-none text-gray-300 placeholder:text-gray-500"
                      disabled
                    />
                    <Button size="sm" className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="hidden xl:block absolute -left-24 top-20 w-64 bg-[#151923]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">New PR!</p>
                    <p className="text-lg">Bench Press</p>
                  </div>
                </div>
                <div className="text-2xl text-[#22C55E] mb-1">100 kg × 5</div>
                <p className="text-sm text-gray-400">+5 kg from last week 🔥</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="hidden xl:block absolute -right-24 top-32 w-64 bg-[#151923]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#00D1FF]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Weekly Goal</p>
                    <p className="text-lg">4/5 Workouts</p>
                  </div>
                </div>
                <div className="w-full bg-[#0B0B0F] rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-sm text-gray-400">1 more to go! 💪</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-24 bg-gradient-to-b from-transparent to-[#151923]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#22C55E]/20 to-[#00D1FF]/20 border border-[#22C55E]/30 text-sm mb-6">
                <span className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                  🤖 AI-POWERED ASSISTANT
                </span>
              </div>
              <h2 className="mb-6 text-4xl md:text-5xl leading-tight">
                Meet Your Personal
                <span className="block text-[#22C55E] mt-2">AI Fitness Coach</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Unlike other fitness apps, BodyGoal includes a powerful AI chatbot that understands natural language. 
                Just talk to it like a real coach – it handles the rest.
              </p>
              
              <div className="space-y-4">
                {chatbotFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10">
                <Bot className="w-8 h-8 text-[#22C55E] mb-4" />
                <h3 className="text-lg mb-2">Smart Context</h3>
                <p className="text-sm text-gray-400">Remembers your PRs, goals, and preferences</p>
              </div>
              <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10">
                <Brain className="w-8 h-8 text-[#00D1FF] mb-4" />
                <h3 className="text-lg mb-2">GPT-4 Powered</h3>
                <p className="text-sm text-gray-400">Latest AI technology for accurate responses</p>
              </div>
              <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10">
                <Sparkles className="w-8 h-8 text-[#22C55E] mb-4" />
                <h3 className="text-lg mb-2">Auto Nutrition</h3>
                <p className="text-sm text-gray-400">Calculates macros from food descriptions</p>
              </div>
              <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10">
                <MessageCircle className="w-8 h-8 text-[#00D1FF] mb-4" />
                <h3 className="text-lg mb-2">24/7 Available</h3>
                <p className="text-sm text-gray-400">Always ready to help and motivate you</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-sm mb-6">
              POWERFUL FEATURES
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl">
              Everything You Need to
              <span className="block text-[#00D1FF] mt-2">Achieve Your Goals</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional-grade tools designed for athletes who take their fitness seriously.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`group relative bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-8 border transition-all duration-300 ${
                  feature.highlight 
                    ? 'border-[#22C55E]/50 shadow-lg shadow-[#22C55E]/20' 
                    : 'border-white/5 hover:border-[#22C55E]/30'
                }`}
              >
                {feature.highlight && (
                  <div className="absolute -top-3 -right-3">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#22C55E] to-[#00D1FF] text-xs">
                      NEW
                    </div>
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-[#22C55E] to-[#00D1FF]' 
                    : 'bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-[#151923]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl md:text-6xl mb-2 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                500K+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Active Users</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl mb-2 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                10M+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Workouts Logged</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl mb-2 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                50M+
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">AI Conversations</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl mb-2 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                4.9/5
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl md:text-5xl">Get Started in 3 Steps</h2>
            <p className="text-xl text-gray-400">Join thousands of athletes already using BodyGoal</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-2xl blur-xl opacity-30"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center mx-auto">
                  <span className="text-3xl">1</span>
                </div>
              </div>
              <h3 className="mb-3 text-2xl">Sign Up Free</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Create your account in 30 seconds. Get instant access to your AI coach and all features.
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-2xl blur-xl opacity-30"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center mx-auto">
                  <span className="text-3xl">2</span>
                </div>
              </div>
              <h3 className="mb-3 text-2xl">Chat with AI</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Tell the AI your goals. It creates your personalized plan and guides you every step.
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-2xl blur-xl opacity-30"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center mx-auto">
                  <span className="text-3xl">3</span>
                </div>
              </div>
              <h3 className="mb-3 text-2xl">See Results</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Watch your transformation with real-time analytics, PRs, and progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#22C55E] via-[#00D1FF] to-[#22C55E] p-1">
            <div className="bg-[#0B0B0F] rounded-[22px] p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center mx-auto">
                  <Dumbbell className="w-10 h-10" />
                </div>
              </div>
              
              <h2 className="mb-6 text-white text-4xl md:text-5xl lg:text-6xl leading-tight">
                Ready to Transform
                <span className="block bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent mt-2">
                  Your Fitness Journey?
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join 500K+ athletes using AI-powered fitness tracking. Start free, no credit card needed.
              </p>
              
              <Button 
                size="lg"
                onClick={() => onNavigate('register')}
                className="group bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 px-12 py-7 text-xl shadow-2xl shadow-[#22C55E]/30"
              >
                <span className="flex items-center gap-2">
                  Get Started with AI Coach
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <p className="mt-6 text-gray-400 flex items-center justify-center gap-2 flex-wrap">
                <Check className="w-4 h-4 text-[#22C55E]" />
                Free AI chatbot included
                <span className="text-gray-600">•</span>
                <Check className="w-4 h-4 text-[#22C55E]" />
                No credit card required
                <span className="text-gray-600">•</span>
                <Check className="w-4 h-4 text-[#22C55E]" />
                100% free forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 bg-[#0B0B0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                </div>
                <span className="text-2xl">BodyGoal</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI-powered fitness tracking for athletes who demand excellence.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">AI Chatbot</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-[#22C55E] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400">&copy; 2025 BodyGoal. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-[#22C55E] transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-[#22C55E] transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-[#22C55E] transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
