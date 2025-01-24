import React, { useState, useEffect, useRef } from 'react';
import { FaPlane, FaTrain, FaBus } from 'react-icons/fa';
import { auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './Home.css';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/firebaseConfig';
import Navbar from '../comon/navbar/Navbar';
import SearchSection from '../comon/search/Search-Section';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedMode, setSelectedMode] = useState('flight');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfileData, setEditProfileData] = useState({});
  const { user } = useAuth();
  const popupRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDocRef = doc(db, 'registeredUsers', user.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
            setEditProfileData(docSnap.data());
          } else {
            console.log('No profile data found');
          }
        }).catch((error) => {
          console.error('Error fetching user profile: ', error);
        });
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      setIsLoggedIn(false);
    }).catch((error) => {
      console.error("Error logging out: ", error);
    });
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    const userDocRef = doc(db, 'registeredUsers', user.uid);
    updateDoc(userDocRef, editProfileData)
      .then(() => {
        setIsEditing(false);
        setUserProfile(editProfileData);
      })
      .catch((error) => {
        console.error('Error updating profile: ', error);
      });
  };

  const handleCancelChanges = () => {
    setEditProfileData(userProfile);
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="home-container">
      <Navbar
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        toggleProfilePopup={toggleProfilePopup}
      />
      <section className="hero-section">
  <div className="hero-container">
    <h1>Find Your Perfect Travel</h1>
    <p>Explore the best travel options tailored for you. Whether it's by plane, train, or bus, your perfect trip is just a click away.</p>
    <div className="tagline">Your Journey, Our Passion</div>
    <div className="hero-buttons">
      <button onClick={() => {/* Add search trips functionality here */}}>Search Trips</button>
    </div>
  </div>
</section>
<section className="search">
   {/* Search Container */}
          <SearchSection
            selectedMode={selectedMode}
            handleModeSelect={handleModeSelect}
          />
</section>

<section className="about-us">
  <div className="about-us-container">
    <h2>About Us</h2>
    <p>We offer a variety of travel options to make your journey as comfortable and convenient as possible. Whether you're looking to fly, take a train, or travel by bus, we have you covered.</p>

    <div className="about-us-details">
      <div className="about-us-history">
        <h3>Our Journey</h3>
        <p>Founded in 2020, our company has been dedicated to providing customers with seamless travel options. Our goal is to offer a diverse range of transportation methods to suit every traveler’s needs. We are committed to comfort, affordability, and reliability.</p>
      </div>

      <div className="about-us-mission">
        <h3>Our Mission</h3>
        <p>We aim to make travel accessible for everyone by providing a platform that brings together various modes of transportation—airplanes, trains, buses—into one simple interface. Our mission is to make your journey smoother, quicker, and more enjoyable.</p>
      </div>

      <div className="about-us-values">
        <h3>Our Values</h3>
        <ul>
          <li><strong>Customer Centricity:</strong> We prioritize our customers' needs and preferences in all our services.</li>
          <li><strong>Integrity:</strong> We uphold the highest standards of honesty and transparency in our business operations.</li>
          <li><strong>Sustainability:</strong> We are committed to promoting eco-friendly travel options whenever possible.</li>
          <li><strong>Innovation:</strong> We continually seek innovative solutions to improve the travel experience.</li>
        </ul>
      </div>

     
    </div>
  </div>
</section>

      {/* Profile Popup */}
      {showProfilePopup && userProfile && (
        <div className="profile-popup" ref={popupRef}>
          <div className="popup-content">
            <button className="close-popup" onClick={toggleProfilePopup}>X</button>
            <h2>User Profile</h2>
            <div className="profile-details">
              <p><strong>Name:</strong> {isEditing ? <input type="text" name="name" value={editProfileData.name} onChange={handleEditChange} /> : userProfile.name}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Phone:</strong> {isEditing ? <input type="text" name="phone" value={editProfileData.phone} onChange={handleEditChange} /> : userProfile.phone}</p>
              <p><strong>Address:</strong> {isEditing ? <input type="text" name="address" value={editProfileData.address} onChange={handleEditChange} /> : userProfile.address}</p>
              <p><strong>Account Type:</strong> {userProfile.accountType}</p>
              <p><strong>Registration Date:</strong> {userProfile.registrationDate?.toDate().toLocaleString()}</p>
            </div>
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                <button className="cancel-btn" onClick={handleCancelChanges}>Cancel Changes</button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 TravelSite, All Rights Reserved</p>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
