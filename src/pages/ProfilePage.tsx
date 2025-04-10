import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useProgressStore } from '../store/progress';
import { User, BookOpen, Star, CheckCircle } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile, signOut, isLoading, error } = useAuth();
  const { completedVideos, starredVideos, starredCourses } = useProgressStore();

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setFormError('Name cannot be empty');
      return;
    }

    const { error } = await updateProfile({ full_name: fullName });

    if (!error) {
      setSuccessMessage('Profile updated successfully');
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden shadow">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-800">
            <h3 className="text-lg font-medium leading-6 text-white">User Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Profile Information */}
              <div className="sm:col-span-3">
                <h4 className="text-base font-medium text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Profile Information
                </h4>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {formError && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded text-sm">
                      {formError}
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded text-sm">
                      {successMessage}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-75"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="py-2 px-4 bg-primary text-dark font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Learning Stats */}
              <div className="sm:col-span-3">
                <h4 className="text-base font-medium text-white mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Learning Statistics
                </h4>

                <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-sm text-gray-300">Completed Videos</span>
                    </div>
                    <span className="text-white font-medium">{completedVideos.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-500" />
                      <span className="text-sm text-gray-300">Starred Videos</span>
                    </div>
                    <span className="text-white font-medium">{starredVideos.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-300">Starred Courses</span>
                    </div>
                    <span className="text-white font-medium">{starredCourses.length}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-base font-medium text-white mb-4">Account Actions</h4>

                  <button
                    onClick={() => signOut()}
                    className="w-full py-2 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
