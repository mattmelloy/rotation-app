import React from 'react';
import { 
  ChefHat, 
  Calendar, 
  ShoppingCart, 
  Link as LinkIcon, 
  Camera, 
  Zap,
  Users,
  Smartphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onContinueAsGuest: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onContinueAsGuest }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation / Header */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center rotate-3 text-lg">
                🍳
              </div>
              <span className="font-bold text-xl text-gray-900">The Rotation</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onContinueAsGuest}
                className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Guest Mode
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Simplify your <br/>
              <span className="text-brand-600">family meals</span>.
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Plan your week, shop efficiently, and build a recipe library your family loves. The only meal planner you'll actually stick with.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 shadow-xl shadow-brand-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Start Planning Free
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={onContinueAsGuest}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-600 rounded-xl font-bold text-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                Try as Guest
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              No credit card required • Works on all devices
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to master mealtime</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Built for real families who need flexibility, speed, and organization in the kitchen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calendar className="text-brand-600" size={24} />}
              title="Weekly Planner"
              description="Drag and drop meals into your week. Handle schedule changes instantly."
            />
            <FeatureCard 
              icon={<ShoppingCart className="text-green-600" size={24} />}
              title="Smart Shopping List"
              description="Ingredients are automatically added to your list. Sort, check off, done."
            />
            <FeatureCard 
              icon={<ChefHat className="text-orange-600" size={24} />}
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
              icon={<Zap className="text-yellow-500" size={24} />}
              title="Thermomix Mode"
              description="Automatically convert standard recipes into machine-friendly steps."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                From chaos to control in <span className="text-brand-600">three steps</span>
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
            </div>
            <div className="bg-gray-100 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
               {/* Abstract representation of the app interface */}
               <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white opacity-50"></div>
               <div className="w-64 bg-white rounded-2xl shadow-xl p-4 rotate-3 transform transition-transform hover:rotate-0 duration-500 z-10 border border-gray-100">
                  <div className="h-4 w-32 bg-gray-100 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-20 bg-brand-50 rounded-xl border border-brand-100"></div>
                    <div className="h-20 bg-gray-50 rounded-xl border border-gray-100"></div>
                    <div className="h-20 bg-gray-50 rounded-xl border border-gray-100"></div>
                  </div>
               </div>
               <div className="w-64 bg-white rounded-2xl shadow-xl p-4 -rotate-6 absolute transform transition-transform hover:-rotate-3 duration-500 border border-gray-100 scale-90 -z-0">
                  <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-50 rounded-lg w-full"></div>
                    <div className="h-8 bg-gray-50 rounded-lg w-3/4"></div>
                    <div className="h-8 bg-gray-50 rounded-lg w-5/6"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Spotlight: Family Voting */}
      <section className="py-20 bg-brand-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
             <div className="inline-flex items-center justify-center p-3 bg-brand-800 rounded-full mb-6">
                <Users className="text-brand-200" size={24} />
             </div>
             <h2 className="text-3xl md:text-4xl font-bold mb-6">Stop the "What's for dinner?" debate</h2>
             <p className="text-xl text-brand-100 mb-8">
               Let the family decide. Open <b>Family Voting Mode</b> and let your kids pick from a curated list of favorites.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="bg-brand-800/50 p-4 rounded-xl border border-brand-700">
                  <CheckCircle2 className="text-brand-300 mb-2" size={20} />
                  <h3 className="font-bold">Democratize Dinner</h3>
                </div>
                <div className="bg-brand-800/50 p-4 rounded-xl border border-brand-700">
                  <CheckCircle2 className="text-brand-300 mb-2" size={20} />
                  <h3 className="font-bold">Reduce Complaints</h3>
                </div>
                <div className="bg-brand-800/50 p-4 rounded-xl border border-brand-700">
                  <CheckCircle2 className="text-brand-300 mb-2" size={20} />
                  <h3 className="font-bold">Get Kids Involved</h3>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-sm">
              🍳
            </div>
            <span className="font-bold text-gray-900">The Rotation</span>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} The Rotation. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Terms</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);

const Step = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  </div>
);

export default LandingPage;
