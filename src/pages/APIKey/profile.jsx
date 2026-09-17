import { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../Utils/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/get-profile?clientId=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data.profile);
        toast.success('Profile fetched successfully');
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleToggle = async (field, value) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/update-client/${profile.id}`, { [field]: value }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile((prev) => ({ ...prev, [field]: value }));
      toast.success(`Profile ${field} updated`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-gray-600 mt-10">No profile data available</div>;
  }

  return (
    <div className="container mx-auto p-4 font-sans">
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => toast.info('Edit profile functionality coming soon!')}
          >
            <FaEdit /> Edit Profile
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Name</label>
            <p className="text-gray-600">{profile.name || 'N/A'}</p>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Phone</label>
            <p className="text-gray-600">{profile.phone || 'N/A'}</p>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Email</label>
            <p className="text-gray-600">{profile.email || 'N/A'}</p>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Client Type</label>
            <p className="text-gray-600">{profile.client_type || 'N/A'}</p>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Billing Method</label>
            <p className="text-gray-600">{profile.billing_method || 'N/A'}</p>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Attachment</label>
            <p className="text-gray-600">
              {profile.attachment ? (
                <a
                  href={profile.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              ) : (
                'None'
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Active Status</label>
            <label className="toggle-wrapper flex items-center justify-start h-8">
              <input
              disabled
                type="checkbox"
                checked={profile.is_active}
                onChange={() => handleToggle('is_active', !profile.is_active)}
                className="toggle-input"
                aria-label="Toggle active status"
              />
              <div className="toggle-slider">
                <div className="toggle-knob"></div>
              </div>
            </label>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Approved</label>
            <label className="toggle-wrapper flex items-center justify-start h-8">
              <input
              disabled
                type="checkbox"
                checked={profile.approved}
                onChange={() => handleToggle('approved', !profile.approved)}
                className="toggle-input"
                aria-label="Toggle approval status"
              />
              <div className="toggle-slider">
                <div className="toggle-knob"></div>
              </div>
            </label>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Aadhar Access</label>
            <label className="toggle-wrapper flex items-center justify-start h-8">
              <input
                disabled
                type="checkbox"
                checked={profile.aadhar_access}
                onChange={() => handleToggle('aadhar_access', !profile.aadhar_access)}
                className="toggle-input"
                aria-label="Toggle Aadhar access"
              />
              <div className="toggle-slider">
                <div className="toggle-knob"></div>
              </div>
            </label>
          </div>
          <div className="flex flex-col">
            <label  className="font-medium text-gray-900">Created At</label>
            <p className="text-gray-600">
              {new Date(profile.createdAt).toLocaleDateString() || 'N/A'}
            </p>
          </div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-900">Updated At</label>
            <p className="text-gray-600">
              {new Date(profile.updatedAt).toLocaleDateString() || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;