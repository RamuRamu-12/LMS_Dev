import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

const RealtimeProjectsLandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { hasAccess, isAdmin } = usePermissions()
  
  // Redirect ALL authenticated users to student page (let it handle access control)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/student/realtime-projects', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Don't show landing page to authenticated users
  if (isAuthenticated) {
    return null
  }

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Web Application',
      description: 'Build a complete e-commerce platform with modern technologies including React, Node.js, and PostgreSQL. Learn full-stack development through hands-on project experience.',
      shortDescription: 'Full-stack e-commerce platform with React, Node.js, and PostgreSQL',
      difficulty: 'Intermediate',
      duration: '40 hours',
      phases: 5,
      icon: '🛒',
      gradient: 'from-emerald-500 to-cyan-500',
      phasesList: [
        'BRD (Business Requirements Document)',
        'UI/UX Design',
        'Development',
        'Testing & Quality Assurance',
        'Deployment & Launch'
      ],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Express.js', 'JWT Auth'],
      color: 'emerald',
      bgPattern: 'bg-emerald-50',
      textColor: 'text-emerald-900'
    },
    {
      id: 2,
      title: 'Data Analytics Dashboard',
      description: 'Create an interactive data analytics dashboard using modern visualization libraries and real-time data processing. Learn data science and visualization techniques.',
      shortDescription: 'Interactive data analytics dashboard with real-time visualization',
      difficulty: 'Intermediate',
      duration: '35 hours',
      phases: 5,
      icon: '📊',
      gradient: 'from-violet-500 to-purple-500',
      phasesList: [
        'BRD (Business Requirements Document)',
        'UI/UX Design',
        'Development',
        'Testing & Quality Assurance',
        'Deployment & Launch'
      ],
      technologies: ['D3.js', 'Python', 'Pandas', 'Chart.js', 'REST APIs'],
      color: 'violet',
      bgPattern: 'bg-violet-50',
      textColor: 'text-violet-900'
    },
    {
      id: 3,
      title: 'AI-Powered Learning Assistant',
      description: 'Develop an intelligent learning assistant using AI and machine learning technologies. Learn about natural language processing and AI integration.',
      shortDescription: 'Intelligent learning assistant with AI and machine learning',
      difficulty: 'Advanced',
      duration: '45 hours',
      phases: 5,
      icon: '🤖',
      gradient: 'from-rose-500 to-pink-500',
      phasesList: [
        'BRD (Business Requirements Document)',
        'UI/UX Design',
        'Development',
        'Testing & Quality Assurance',
        'Deployment & Launch'
      ],
      technologies: ['Python', 'TensorFlow', 'NLP', 'OpenAI API', 'Flask'],
      color: 'rose',
      bgPattern: 'bg-rose-50',
      textColor: 'text-rose-900'
    }
  ]

  const handleProjectClick = (projectId) => {
    navigate(`/student/realtime-projects/${projectId}`)
  }

  const handleGetStarted = () => {
    navigate('/student/realtime-projects')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />
      
      {/* Hero Section with Floating Elements */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Floating Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute top-60 right-1/3 w-28 h-28 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Main Title with Creative Typography */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">
                BUILD
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                Real Projects
              </h2>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-2xl">🚀</span>
                <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Learn by doing with <span className="font-bold text-indigo-600">realtime projects</span> that build real-world skills through hands-on experience
            </p>

            {/* CTA Buttons with Creative Design */}
            <div className="flex justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-2">
                  <span>Start Learning by Doing</span>
                  <span className="text-xl">⚡</span>
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Glimpse Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Realtime Projects <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Learn by Doing</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three hands-on realtime projects designed for learning by doing. Pick one and start building while you learn.
            </p>
          </motion.div>

          {/* Quick Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1">
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${project.gradient} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {project.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{project.shortDescription}</p>
                    <div className="flex justify-center space-x-2 mb-4">
                      <span className={`px-3 py-1 bg-gradient-to-r ${project.gradient} text-white rounded-full text-xs font-bold`}>
                        {project.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                        {project.duration}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-500">Learn by doing →</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section with Card Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Learn by Doing</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Realtime projects that teach you through hands-on experience. Learn by doing, not just watching.
            </p>
          </motion.div>

          {/* Feature Cards with Unique Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Realtime Learning',
                description: 'Learn by doing with projects that update in real-time as you build them.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '⚡',
                title: 'Hands-On Experience',
                description: 'Stop watching tutorials. Start building. Our realtime projects are 100% hands-on.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🏆',
                title: 'Learn While Building',
                description: 'Build real projects while learning. Every step teaches you something new.',
                color: 'from-green-500 to-teal-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                className="group relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Showcase with Creative Layout */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Learning by Doing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three realtime projects designed for hands-on learning. Pick one and start learning by doing.
            </p>
          </motion.div>

          {/* Projects Grid with Unique Card Design */}
          <div className="space-y-12">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                {/* Project Image/Icon Section */}
                <div className="flex-1">
                  <div className={`relative ${project.bgPattern} rounded-3xl p-12 shadow-2xl`}>
                    <div className="text-center">
                      <div className={`w-32 h-32 bg-gradient-to-r ${project.gradient} rounded-3xl flex items-center justify-center text-6xl mx-auto mb-8 shadow-xl`}>
                        {project.icon}
                      </div>
                      <div className={`text-4xl font-black ${project.textColor} mb-4`}>
                        {project.title}
                      </div>
                      <div className={`text-lg ${project.textColor} opacity-80`}>
                        {project.shortDescription}
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{project.phases}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-white rounded-full shadow-lg">
                      <span className="text-sm font-bold text-gray-600">{project.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Project Details Section */}
                <div className="flex-1">
                  <div className="bg-white rounded-3xl p-8 shadow-xl">
                    <div className="mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`px-4 py-2 bg-gradient-to-r ${project.gradient} text-white rounded-full text-sm font-bold`}>
                          {project.difficulty}
                        </span>
                        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
                          {project.phases} Phases
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>
                    </div>

                    {/* Technologies */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">🛠️ Technologies You'll Master:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Learning Phases */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">📚 Your Learning Journey:</h4>
                      <div className="space-y-2">
                        {project.phasesList.map((phase, phaseIndex) => (
                          <div key={phaseIndex} className="flex items-center text-gray-600">
                            <div className={`w-6 h-6 bg-gradient-to-r ${project.gradient} rounded-full flex items-center justify-center text-white text-xs font-bold mr-3`}>
                              {phaseIndex + 1}
                            </div>
                            {phase}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleProjectClick(project.id)}
                      className={`w-full py-4 bg-gradient-to-r ${project.gradient} text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg`}
                    >
                      🚀 Learn by Doing
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Creative Design */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the <span className="text-yellow-300">Learn by Doing</span> Community
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Thousands of students are learning by doing with our realtime projects. Start your hands-on journey today.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '3', label: 'Realtime Projects', icon: '🎯' },
              { number: '15', label: 'Learning Phases', icon: '📚' },
              { number: '120+', label: 'Hours of Doing', icon: '⏰' },
              { number: '100%', label: 'Learn by Doing', icon: '💪' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-5xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-indigo-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-12 border border-indigo-100">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Learn by Doing</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Stop watching tutorials. Start learning by doing. Join thousands of students who are already building realtime projects.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 text-xl"
              >
                🚀 Start Learning by Doing
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default RealtimeProjectsLandingPage
