import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, 
  FiUsers, 
  FiAward, 
  FiClock, 
  FiCode, 
  FiStar,
  FiArrowRight,
  FiX,
  FiCheck,
  FiSend,
  FiMail,
  FiUser,
  FiUsers as FiTeam
} from 'react-icons/fi';
import { hackathonService } from '../services/hackathonService';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import Header from '../components/common/Header';

const HackathonLandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { hasAccess, isAdmin } = usePermissions();
  
  // Redirect ALL authenticated users to student page (let it handle access control)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/student/hackathons', { replace: true })
    }
  }, [isAuthenticated, navigate]);
  
  // Don't show landing page to authenticated users
  if (isAuthenticated) {
    return null
  }
  
  const [hackathons, setHackathons] = useState([]);
  const [enrolledHackathons, setEnrolledHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinFormData, setJoinFormData] = useState({
    teamName: '',
    teamMembers: [
      { name: '', email: '' },
      { name: '', email: '' },
      { name: '', email: '' }
    ],
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, [isAuthenticated]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      
      // Always fetch all hackathons (public access)
      const response = await hackathonService.getAllHackathons({
        sort: 'start_date',
        order: 'desc',
        limit: 15
      });
      console.log('Hackathons response:', response);
      
      // Sort hackathons by start_date (latest first)
      const sortedHackathons = (response.data.hackathons || []).sort((a, b) => {
        return new Date(b.start_date) - new Date(a.start_date);
      });
      
      setHackathons(sortedHackathons);
      
      // If user is logged in, also fetch enrolled hackathons
      if (isAuthenticated && user) {
        try {
          const enrolledResponse = await hackathonService.getMyHackathons();
          console.log('Enrolled hackathons response:', enrolledResponse);
          setEnrolledHackathons(enrolledResponse.data?.hackathons || []);
        } catch (error) {
          console.error('Error fetching enrolled hackathons:', error);
          // If fails, just show all hackathons (silent fail)
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = (hackathon) => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/login', {
        state: {
          redirectTo: `/hackathons`,
          message: 'Please login to join hackathons'
        }
      });
      return;
    }
    
    setSelectedHackathon(hackathon);
    setShowJoinForm(true);
    setSubmitted(false);
    setJoinFormData({
      teamName: '',
      teamMembers: [
        { name: '', email: '' },
        { name: '', email: '' },
        { name: '', email: '' }
      ],
      message: ''
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Filter out empty team members
      const validMembers = joinFormData.teamMembers.filter(member => 
        member.name.trim() && member.email.trim()
      );
      
      if (validMembers.length === 0) {
        alert('Please add at least one team member');
        return;
      }

      // Send the actual join request to the backend
      const joinRequestData = {
        teamName: joinFormData.teamName,
        teamMembers: validMembers,
        message: joinFormData.message
      };

      await hackathonService.submitJoinRequest(selectedHackathon.id, joinRequestData);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting join request:', error);
      alert(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addTeamMember = () => {
    setJoinFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', email: '' }]
    }));
  };

  const removeTeamMember = (index) => {
    if (joinFormData.teamMembers.length > 1) {
      setJoinFormData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTeamMember = (index, field, value) => {
    setJoinFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'active':
        return 'Active';
      default:
        return status;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hackathons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center items-center mb-8">
              <div className="flex items-center space-x-4">
                <span className="text-6xl">🏆</span>
                <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                <span className="text-6xl">⚡</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Join Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Hackathons</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Compete with talented developers, build innovative solutions, and win amazing prizes in our exciting hackathons
            </p>

            <div className="flex justify-center items-center space-x-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{hackathons.length}</div>
                <div className="text-sm text-gray-600">Available Hackathons</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Fun</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hackathons Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* My Enrolled Hackathons Section (only show if logged in and has enrollments) */}
          {isAuthenticated && enrolledHackathons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  My <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Enrolled Hackathons</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Hackathons you're currently participating in
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledHackathons.map((hackathon, index) => (
                  <motion.div
                    key={hackathon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border-2 border-green-200"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-8">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                          Enrolled
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hackathon.difficulty)}`}>
                          {hackathon.difficulty}
                        </span>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-200">
                          {hackathon.name}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {hackathon.description}
                        </p>
                      </div>

                      {hackathon.technology && (
                        <div className="flex items-center space-x-2 mb-4">
                          <FiCode className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">{hackathon.technology}</span>
                        </div>
                      )}

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-3">
                          <FiCalendar className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FiClock className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(hackathon.start_date).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(hackathon.end_date).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mb-6">
                        <FiUsers className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {hackathon.current_participants || 0} participants
                        </span>
                        {hackathon.max_groups && (
                          <span className="text-sm text-gray-500">
                            • Max {hackathon.max_groups} groups
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/student/hackathons')}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg flex items-center justify-center space-x-2"
                      >
                        <span>View Details</span>
                        <FiArrowRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Hackathons</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our exciting hackathons and join with your team to compete and win amazing prizes
            </p>
          </motion.div>

          {hackathons.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Active Hackathons</h3>
              <p className="text-gray-600">Check back later for exciting hackathons!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hackathons.map((hackathon, index) => (
                <motion.div
                  key={hackathon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-8">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(hackathon.status)}`}>
                        {getStatusText(hackathon.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hackathon.difficulty)}`}>
                        {hackathon.difficulty}
                      </span>
                    </div>

                    {/* Hackathon Info */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        {hackathon.name}
                      </h3>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {hackathon.description}
                      </p>
                    </div>

                    {/* Technology */}
                    {hackathon.technology && (
                      <div className="flex items-center space-x-2 mb-4">
                        <FiCode className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-medium text-gray-700">{hackathon.technology}</span>
                      </div>
                    )}

                    {/* Date and Time */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FiClock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(hackathon.start_date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(hackathon.end_date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center space-x-3 mb-6">
                      <FiUsers className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {hackathon.current_participants || 0} participants
                      </span>
                      {hackathon.max_groups && (
                        <span className="text-sm text-gray-500">
                          • Max {hackathon.max_groups} groups
                        </span>
                      )}
                    </div>

                    {/* Prize */}
                    {hackathon.prize_description && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <FiAward className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-800">Prize</span>
                        </div>
                        <p className="text-sm text-yellow-700">{hackathon.prize_description}</p>
                      </div>
                    )}

                    {/* Join Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleJoinRequest(hackathon)}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg flex items-center justify-center space-x-2"
                    >
                      <span>{isAuthenticated ? 'Join Hackathon' : 'Login to Join'}</span>
                      <FiArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join Request Modal */}
      {showJoinForm && selectedHackathon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Join {selectedHackathon.name}
                  </h3>
                  <p className="text-gray-600">
                    Fill out the form below to request joining this hackathon with your team
                  </p>
                </div>
                <button
                  onClick={() => setShowJoinForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <FiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Request Submitted!</h4>
                  <p className="text-gray-600 mb-6">
                    Your request to join <strong>{selectedHackathon.name}</strong> has been sent to the admin. 
                    You'll be notified once your team is approved.
                  </p>
                  <button
                    onClick={() => setShowJoinForm(false)}
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Team Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={joinFormData.teamName}
                      onChange={(e) => setJoinFormData(prev => ({ ...prev, teamName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your team name"
                    />
                  </div>

                  {/* Team Members */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Team Members *
                    </label>
                    <div className="space-y-4">
                      {joinFormData.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Full Name"
                            />
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Email Address"
                            />
                          </div>
                          {joinFormData.teamMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTeamMember(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="mt-3 flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Add Team Member</span>
                    </button>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Admin
                    </label>
                    <textarea
                      value={joinFormData.message}
                      onChange={(e) => setJoinFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Tell the admin about your team's experience and why you want to join this hackathon..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          <span>Send Request</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HackathonLandingPage;
