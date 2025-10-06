import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HackathonDetailsModal from '../components/HackathonDetailsModal';

const HackathonPage = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      
      // Get token from multiple sources
      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        token = sessionStorage.getItem('accessToken');
      }
      if (!token) {
        token = sessionStorage.getItem('token');
      }
      
      console.log('HackathonPage - Token found:', token ? `${token.substring(0, 20)}...` : 'null');
      
      const response = await fetch('/api/hackathons', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hackathons');
      }

      const data = await response.json();
      setHackathons(data.data.hackathons || []);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Hackathons</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchHackathons}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hackathons
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join exciting hackathons and showcase your coding skills. Collaborate with fellow students and build amazing projects.
          </p>
        </motion.div>

        {hackathons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hackathons Available</h3>
            <p className="text-gray-600">
              Check back later for exciting hackathon opportunities!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Hackathon Logo/Image */}
                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {hackathon.logo ? (
                    <img
                      src={hackathon.logo}
                      alt={hackathon.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p className="text-lg font-semibold">{hackathon.name}</p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Status and Difficulty Badges */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hackathon.status)}`}>
                      {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(hackathon.difficulty)}`}>
                      {hackathon.difficulty.charAt(0).toUpperCase() + hackathon.difficulty.slice(1)}
                    </span>
                  </div>

                  {/* Hackathon Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {hackathon.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {hackathon.description}
                  </p>

                  {/* Technology */}
                  {hackathon.technology && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Technology: </span>
                      <span className="text-sm text-gray-600">{hackathon.technology}</span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mb-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Start:</span>
                      <span className="text-gray-600">{formatDate(hackathon.start_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">End:</span>
                      <span className="text-gray-600">{formatDate(hackathon.end_date)}</span>
                    </div>
                  </div>

                  {/* Participants */}
                  {hackathon.max_participants && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Participants:</span>
                        <span className="text-gray-600">
                          {hackathon.current_participants || 0} / {hackathon.max_participants}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${((hackathon.current_participants || 0) / hackathon.max_participants) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setSelectedHackathon(hackathon);
                      setShowDetailsModal(true);
                    }}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Hackathon Details Modal */}
      {showDetailsModal && selectedHackathon && (
        <HackathonDetailsModal
          hackathon={selectedHackathon}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedHackathon(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default HackathonPage;
