import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import { FiBookOpen, FiCode, FiUsers, FiAward, FiTrendingUp, FiZap, FiTarget, FiGlobe, FiStar, FiPlay, FiShield, FiClock } from 'react-icons/fi'

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const mainFeatures = [
    {
      icon: <FiBookOpen className="w-12 h-12" />,
      title: 'AI-Enabled Courses',
      description: 'Master new skills with our intelligent course system that adapts to your learning pace and style.',
      color: 'from-blue-500 to-cyan-500',
      stats: '10+ Courses'
    },
    {
      icon: <FiCode className="w-12 h-12" />,
      title: 'Realtime Projects',
      description: 'Build real-world applications through hands-on projects with live coding sessions and instant feedback.',
      color: 'from-purple-500 to-pink-500',
      stats: '5+ Projects'
    },
    {
      icon: <FiUsers className="w-12 h-12" />,
      title: 'Hackathons',
      description: 'Compete in exciting hackathons, collaborate with peers, and showcase your innovative solutions.',
      color: 'from-green-500 to-emerald-500',
      stats: 'Monthly Events'
    },
    {
      icon: <FiAward className="w-12 h-12" />,
      title: 'Certifications',
      description: 'Earn industry-recognized certificates and badges that validate your skills and boost your career.',
      color: 'from-orange-500 to-red-500',
      stats: '100% Valid'
    }
  ]

  const platformFeatures = [
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Smart Analytics',
      description: 'Track your progress with detailed insights and personalized recommendations.'
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Instant Feedback',
      description: 'Get immediate feedback on your code and projects with AI-powered analysis.'
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: 'Goal Setting',
      description: 'Set learning goals and milestones to stay motivated and on track.'
    },
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: 'Global Community',
      description: 'Connect with learners worldwide and participate in collaborative projects.'
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: 'Expert Mentors',
      description: 'Learn from industry experts and get personalized guidance throughout your journey.'
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Career Boost',
      description: 'Accelerate your career with skills that employers are actively seeking.'
    }
  ]

  const stats = [
    { number: '20+', label: 'Verified Certifications', icon: <FiUsers className="w-6 h-6" /> },
    { number: '10+', label: 'AI-Enabled Courses', icon: <FiBookOpen className="w-6 h-6" /> },
    { number: '85%', label: 'Success Rate', icon: <FiTrendingUp className="w-6 h-6" /> },
    { number: '24/7', label: 'Customer Support', icon: <FiShield className="w-6 h-6" /> }
  ]

  const handleLoginClick = () => {
    navigate('/login')
  }

  const handleProtectedClick = (path) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      navigate('/login')
    }
  }

  const handleExploreCourses = () => {
    navigate('/courses')
  }

  const handleExploreProjects = () => {
    navigate('/realtime-projects')
  }

  const handleExploreHackathons = () => {
    navigate('/hackathons')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Unique Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 0l15 15-15 15-15-15z'/%3E%3Cpath d='M0 30l15 15 15-15-15-15z'/%3E%3Cpath d='M30 60l-15-15 15-15 15 15z'/%3E%3Cpath d='M60 30l-15-15-15 15 15 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Animated Hexagonal Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(30deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(-30deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Marvelous Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Unique Geometric Shapes */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse opacity-40"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse delay-1000 opacity-40"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full blur-3xl animate-pulse delay-2000 opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-500 opacity-40"></div>
            <div className="absolute top-10 right-1/3 w-48 h-48 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-2xl animate-pulse delay-1500 opacity-30"></div>
            <div className="absolute bottom-10 left-10 w-56 h-56 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-2xl animate-pulse delay-3000 opacity-30"></div>
            
            {/* Unique Rotating Geometric Shapes */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full opacity-20 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
            <div className="absolute top-3/4 left-3/4 w-40 h-40 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full opacity-20 animate-spin" style={{animationDuration: '25s'}}></div>
          </div>
          
          {/* Enhanced Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full animate-float ${
                  i % 4 === 0 ? 'w-3 h-3 bg-blue-400/30' :
                  i % 4 === 1 ? 'w-2 h-2 bg-purple-400/30' :
                  i % 4 === 2 ? 'w-4 h-4 bg-pink-400/30' :
                  'w-1 h-1 bg-cyan-400/30'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${4 + Math.random() * 6}s`
                }}
              />
            ))}
          </div>
          
          {/* Unique Wave Animation */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-500/10 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight drop-shadow-2xl relative">
                <span className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                GNANAM AI
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 blur-3xl rounded-full animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-xl rounded-full animate-ping"></div>
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl text-white mb-6 font-bold">
                Master Skills Through{' '}
                <span className="text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse relative">
                  <span className="relative">
                    Real Experience
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-2xl rounded-full animate-pulse"></div>
                  </span>
                </span>
              </p>
              <p className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
                Join the revolution in education! Experience AI enabled personalized learning, 
                build real-world projects, compete in hackathons, and earn industry-recognized certifications.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12"
            >
              {isAuthenticated ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/student'}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-purple-500/30 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <FiPlay className="w-5 h-5 mr-3 group-hover:animate-pulse transition-transform" />
                  Go to Dashboard
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-purple-500/30 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <FiPlay className="w-5 h-5 mr-3 group-hover:animate-pulse transition-transform" />
                    Start Learning Now
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
              <button
                onClick={handleExploreCourses}
                className="group px-8 py-4 border-2 border-gray-300 text-gray-300 font-bold text-lg rounded-2xl hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm bg-white/40 hover:bg-white/80"
              >
                <span className="flex items-center">
                  <FiBookOpen className="w-5 h-5 mr-3 group-hover:animate-bounce transition-transform" />
                Explore Courses
                </span>
              </button>
            </motion.div>

            {/* Quick Access Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5, rotateY: 3 }}
                className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all duration-500 cursor-pointer border border-white/30 group relative overflow-hidden"
                onClick={handleExploreCourses}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 animate-gradient-shift">
                  <FiBookOpen className="w-8 h-8 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors relative z-10">Courses</h3>
                <p className="text-gray-600 text-sm font-medium relative z-10">10+ AI enabled courses</p>
                <div className="mt-3 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5, rotateY: -3 }}
                className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-pink-500/25 transition-all duration-500 cursor-pointer border border-white/30 group relative overflow-hidden"
                onClick={handleExploreProjects}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 animate-gradient-shift">
                  <FiCode className="w-8 h-8 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors relative z-10">Realtime Projects</h3>
                <p className="text-gray-600 text-sm font-medium relative z-10">5+ Hands-on Projects</p>
                <div className="mt-3 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5, rotateY: 3 }}
                className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all duration-500 cursor-pointer border border-white/30 group relative overflow-hidden"
                onClick={handleExploreHackathons}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 animate-gradient-shift">
                  <FiUsers className="w-8 h-8 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors relative z-10">Hackathons</h3>
                <p className="text-gray-600 text-sm font-medium relative z-10">Monthly Competitions</p>
                <div className="mt-3 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer"></div>
                <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              </motion.div>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className="text-center bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all duration-500 border border-white/40 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-3 mx-auto shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-semibold text-sm">
                    {stat.label}
                  </div>
                  <div className="mt-3 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Unique Interactive Background Element */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-ping opacity-20" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-500 rounded-full animate-ping opacity-40" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-500 rounded-full animate-ping opacity-25" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-yellow-500 rounded-full animate-ping opacity-35" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Main Features Section */}
      <section className="py-16 bg-gradient-to-br from-white/60 via-blue-50/80 to-purple-50/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-4 h-4 bg-gradient-to-r ${
                  i % 3 === 0 ? 'from-blue-400 to-purple-400' :
                  i % 3 === 1 ? 'from-purple-400 to-pink-400' :
                  'from-pink-400 to-blue-400'
                } rounded-full opacity-30 animate-float`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-200/30 backdrop-blur-sm mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <FiStar className="w-4 h-4 text-purple-600 mr-2 animate-pulse" />
              <span className="text-xs font-semibold text-purple-700">✨ Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse"> Succeed</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Our comprehensive platform combines cutting-edge AI technologies with real-world experience 
              to create the ultimate learning environment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 mx-auto shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center mb-3 leading-relaxed text-sm">
                  {feature.description}
                </p>
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-full text-xs">
                    {feature.stats}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Platform Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/20"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute top-20 right-1/3 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl animate-pulse delay-1500"></div>
            <div className="absolute bottom-20 left-1/4 w-56 h-56 bg-cyan-400/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
          </div>
          
          {/* Enhanced Floating Elements */}
          <div className="absolute inset-0">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-white/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${4 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-8 shadow-xl hover:shadow-white/20 transition-all duration-300">
              <FiClock className="w-5 h-5 mr-2 animate-pulse" />
              <span className="font-semibold text-base">🚀 Limited Time Offer - Start Your Journey Today!</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-pulse"> Future?</span>
            </h2>
            <p className="text-xl mb-12 opacity-90 leading-relaxed font-medium">
              Join 1,200+ learners who are already building their dream careers with GNANAM AI.
              <br />
              <span className="text-yellow-300 font-bold animate-pulse">Start your journey today!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              {isAuthenticated ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/student'}
                  className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Access Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Start Learning Now
                </button>
              )}
              <button
                onClick={handleExploreCourses}
                className="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Explore Platform
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">100%</div>
                <div className="opacity-90 text-sm">Free to Start</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">24/7</div>
                <div className="opacity-90 text-sm">Customer Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">100%</div>
                <div className="opacity-90 text-sm">Upskill</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage