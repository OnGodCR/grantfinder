import Link from 'next/link';
import { ArrowRight, Search, Bookmark, TrendingUp, Award, Clock, Users } from 'lucide-react';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { GlowingEffectDemo } from '@/components/ui/glowing-effect-demo';

const grants = [
  { 
    title: 'Climate Change Research Initiative',
    summary: 'NSF program supporting climate-focused research projects with up to $2M in funding.',
    score: 92,
    agency: 'National Science Foundation',
    deadline: '2024-03-15',
    funding: '$500K - $2M'
  },
  { 
    title: 'Genomics and Health Disparities',
    summary: 'NIH funding to study genomic factors in public health outcomes and precision medicine.',
    score: 87,
    agency: 'National Institutes of Health',
    deadline: '2024-02-28',
    funding: '$1M - $3M'
  },
  { 
    title: 'Renewable Energy Technology Development',
    summary: 'DOE support for novel energy technologies with environmental impact and scalability.',
    score: 75,
    agency: 'Department of Energy',
    deadline: '2024-04-10',
    funding: '$750K - $1.5M'
  },
  { 
    title: 'Digital Education Innovation',
    summary: 'NSF grants accelerating modern learning technologies and educational research.',
    score: 80,
    agency: 'National Science Foundation',
    deadline: '2024-03-30',
    funding: '$300K - $800K'
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Background Paths Component - First UI Element */}
      <BackgroundPaths title="Grantalytic" />

      {/* Navigation - Fixed above other content */}
      <nav className="relative z-50 px-6 py-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Grantalytic</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/features" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="/about" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">About Us</a>
            <a href="/contact" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Contact Us</a>
            <Link href="/discover" className="bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-600 transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Shader Animation - Moved Below BackgroundPaths */}
      <section className="relative px-6 py-20 overflow-hidden min-h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Shader Animation Background */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full min-h-[600px]">
            <ShaderAnimation />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              AI-Powered Grant Discovery for Universities
            </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                Save your faculty hours of searching. Find, match, and apply for research grants in minutes with our intelligent platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/discover"
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
                >
                  Start Discovering
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-600 text-white font-semibold rounded-xl hover:border-teal-500 hover:text-teal-400 transition-colors"
                >
                Book a Demo
                </Link>
            </div>
              <p className="text-sm text-slate-400">
                Grantalytic AI aggregates funding opportunities from trusted sources including NSF, NIH, Horizon Europe, and more.
            </p>
          </div>

            {/* Right: Grant Cards Preview */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="space-y-4">
                  {grants.map((grant, index) => (
                    <div key={grant.title} className="bg-white rounded-xl p-4 shadow-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-900 flex-1 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                          {grant.title}
                        </h3>
                        <div className="ml-3 flex-shrink-0">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-teal-600">{grant.score}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                        {grant.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{grant.agency}</span>
                        <span>{grant.funding}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Glowing Effect */}
      <section className="px-6 py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Choose Grantalytic?</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">Powerful features designed for research institutions</p>
          </div>
          
          <GlowingEffectDemo />
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">500+</div>
              <div className="text-slate-300">Funding Sources</div>
        </div>
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">10K+</div>
              <div className="text-slate-300">Active Grants</div>
        </div>
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">95%</div>
              <div className="text-slate-300">Match Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">24/7</div>
              <div className="text-slate-300">Monitoring</div>
          </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-teal-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Grant Discovery?</h2>
          <p className="text-xl text-teal-100 mb-8">Join hundreds of universities already using Grantalytic to find and win more grants.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/discover"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Grantalytic</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered grant discovery platform for universities and research institutions.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/integrations" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/status" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 Grantalytic. All rights reserved.</p>
    </div>
    </div>
      </footer>
    </div>
  );
}