import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Calendar, 
  ShoppingCart, 
  Link as LinkIcon, 
  Camera, 
  Zap,
  Users,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onContinueAsGuest: () => void;
  isLoggedIn?: boolean;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onContinueAsGuest, isLoggedIn = false }) => {
  return (
    <div className="min-h-screen bg-base">
      {/* Navigation / Header */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed w-full z-50 bg-surface/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center text-lg"
              >
                🍳
              </motion.div>
              <span className="font-display font-bold text-xl text-primary">The Rotation</span>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGetStarted}
                  className="btn-primary"
                >
                  Back to Meals
                </motion.button>
              ) : (
                <>
                  <button 
                    onClick={onContinueAsGuest}
                    className="hidden sm:block text-sm font-medium text-secondary hover:text-primary transition-colors"
                  >
                    Guest Mode
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onGetStarted}
                    className="btn-primary"
                  >
                    Get Started
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/30 dark:bg-secondary-800/20 rounded-full blur-3xl" />
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-primary tracking-tight mb-8"
            >
              Simplify your <br/>
              <span className="text-gradient">family meals</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-secondary mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Plan your week, shop efficiently, and build a recipe library your family loves. The only meal planner you'll actually stick with.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 shadow-xl shadow-primary-600/25 transition-all flex items-center justify-center gap-2"
              >
                Start Planning Free
                <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinueAsGuest}
                className="w-full sm:w-auto px-8 py-4 bg-surface text-secondary rounded-xl font-bold text-lg border border-border hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
              >
                Try as Guest
              </motion.button>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 text-sm text-muted"
            >
              No credit card required  Works on all devices
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-primary mb-4">Everything you need to master mealtime</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Built for real families who need flexibility, speed, and organization in the kitchen.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={<Calendar className="text-primary-600" size={24} />}
              title="Weekly Planner"
              description="Drag and drop meals into your week. Handle schedule changes instantly."
            />
            <FeatureCard 
              icon={<ShoppingCart className="text-secondary-600" size={24} />}
              title="Smart Shopping List"
              description="Ingredients are automatically added to your list. Sort, check off, done."
            />
            <FeatureCard 
              icon={<ChefHat className="text-accent-500" size={24} />}
              title="Recipe Organization"
              description="Keep your Heavy Hitters separate from the Archive. Never lose a favorite."
            />
            <FeatureCard 
              icon={<LinkIcon className="text-purple-600" size={24} />}
              title="One-Click Import"
              description="Paste a URL from any recipe site and we'll extract the ingredients and steps."
            />
            <FeatureCard 
              icon={<Camera className="text-blue-600" size={24} />}
              title="Cookbook Scanner"
              description="Snap a photo of a recipe book page. AI reads it and saves it digitally."
            />
            <FeatureCard 
              icon={<Zap className="text-accent-500" size={24} />}
              title="Thermomix Mode"
              description="Automatically convert standard recipes into machine-friendly steps."
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-display font-bold text-primary mb-6">
                From chaos to control in <span className="text-primary-600">three steps</span>
              </h2>
              <div className="space-y-8">
                <Step 
                  number="1"
                  title="Build Your Library"
                  description="Add family favorites or import new ones instantly using our smart tools."
                />
                <Step 
                  number="2"
                  title="Plan Your Week"
                  description="Select meals for the week. Drag them to days. Adjust as life happens."
                />
                <Step 
                  number="3"
                  title="Shop & Cook"
                  description="Use the auto-generated list to shop, then follow the clean, distraction-free cooking mode."
                />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-neutral-100 dark:bg-neutral-800 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden"
            >
               {/* Abstract representation of the app interface */}
               <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-surface dark:from-primary-950/50 dark:to-neutral-900 opacity-50"></div>
               <motion.div 
                 whileHover={{ rotate: 0 }}
                 className="w-64 bg-surface rounded-2xl shadow-xl p-4 rotate-3 transform transition-transform duration-500 z-10 border border-border"
               >
                  <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-20 bg-primary-50 dark:bg-primary-950/50 rounded-xl border border-primary-200 dark:border-primary-800"></div>
                    <div className="h-20 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-border"></div>
                    <div className="h-20 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-border"></div>
                  </div>
               </motion.div>
               <motion.div 
                 whileHover={{ rotate: -3 }}
                 className="w-64 bg-surface rounded-2xl shadow-xl p-4 -rotate-6 absolute transform transition-transform duration-500 border border-border scale-90 -z-0"
               >
                  <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg w-full"></div>
                    <div className="h-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg w-3/4"></div>
                    <div className="h-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg w-5/6"></div>
                  </div>
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Spotlight: Family Voting */}
      <section className="py-20 bg-primary-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
             <motion.div 
               whileHover={{ scale: 1.1 }}
               className="inline-flex items-center justify-center p-3 bg-primary-800 rounded-full mb-6"
             >
                <Users className="text-primary-200" size={24} />
             </motion.div>
             <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Stop the "What's for dinner?" debate</h2>
             <p className="text-xl text-primary-100 mb-8">
               Let the family decide. Open <b>Family Voting Mode</b> and let your kids pick from a curated list of favorites.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-primary-800/50 p-4 rounded-xl border border-primary-700"
                >
                  <CheckCircle2 className="text-primary-300 mb-2" size={20} />
                  <h3 className="font-bold">Democratize Dinner</h3>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-primary-800/50 p-4 rounded-xl border border-primary-700"
                >
                  <CheckCircle2 className="text-primary-300 mb-2" size={20} />
                  <h3 className="font-bold">Reduce Complaints</h3>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-primary-800/50 p-4 rounded-xl border border-primary-700"
                >
                  <CheckCircle2 className="text-primary-300 mb-2" size={20} />
                  <h3 className="font-bold">Get Kids Involved</h3>
                </motion.div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded flex items-center justify-center text-sm">
              🍳
            </div>
            <span className="font-display font-bold text-primary">The Rotation</span>
          </div>
          <div className="text-sm text-muted">
             {new Date().getFullYear()} The Rotation. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-muted hover:text-primary text-sm transition-colors">Privacy</a>
            <a href="#" className="text-muted hover:text-primary text-sm transition-colors">Terms</a>
            <a href="#" className="text-muted hover:text-primary text-sm transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    variants={fadeInUp}
    whileHover={{ y: -5, shadow: "lg" }}
    className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all"
  >
    <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-display font-bold text-primary mb-2">{title}</h3>
    <p className="text-secondary leading-relaxed">{description}</p>
  </motion.div>
);

const Step = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    className="flex gap-4"
  >
    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-display font-bold text-primary mb-1">{title}</h3>
      <p className="text-secondary">{description}</p>
    </div>
  </motion.div>
);

export default LandingPage;
