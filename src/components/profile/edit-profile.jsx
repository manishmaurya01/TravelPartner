import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import "./edit-profile.css";

const ProfileEdit = () => {
  const [profilePicture, setProfilePicture] = useState('/default-profile.png');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    accountType: 'user',
    services: '',
    businessName: '',
    businessHours: '',
    location: '',
    website: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = doc(db, 'registeredUsers', user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setProfilePicture(userData.profilePicture || '/default-profile.png');
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            accountType: userData.accountType || 'user',
            services: userData.services || '',
            businessName: userData.businessName || '',
            businessHours: userData.businessHours || '',
            location: userData.location || '',
            website: userData.website || '',
          });
        } else {
          alert('User data not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for required fields if account type is "business"
    if (formData.accountType === 'business') {
      if (!formData.businessName || !formData.services || !formData.businessHours || !formData.location || !formData.website) {
        alert('All business fields are required!');
        return;
      }
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('User not logged in.');
        return;
      }

      const userDoc = doc(db, 'registeredUsers', user.uid);

      // Build the update object dynamically to exclude undefined fields
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        accountType: formData.accountType, // Account type remains unchanged
        services: formData.accountType === 'business' ? formData.services : '',
        businessName: formData.businessName,
        businessHours: formData.businessHours,
        location: formData.location,
        website: formData.website,
      };

      // Include profilePicture only if it's updated from the default
      if (profilePicture !== '/default-profile.png') {
        updatedData.profilePicture = profilePicture;
      }

      await updateDoc(userDoc, updatedData);
      navigate("/profile");
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h2>Edit Profile</h2>
      </div>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            readOnly
            placeholder="Email cannot be changed"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="text"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter your address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="accountType">Account Type</label>
          <div id="accountType">{formData.accountType}</div>
        </div>

        {formData.accountType === 'business' && (
          <>
            <div className="form-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="services">Services Offered</label>
              <select
                id="services"
                value={formData.services}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a service</option>
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="cab">Cab</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessHours">Business Hours</label>
              <input
                type="text"
                id="businessHours"
                value={formData.businessHours}
                onChange={handleInputChange}
                placeholder="Enter your business hours"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your business location"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="Enter your business website"
                required
              />
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="save-btn">Save Changes</button>
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
