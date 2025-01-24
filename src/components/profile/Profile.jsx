import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { deleteDoc } from 'firebase/firestore';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userDetails, setUserDetails] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const userDocRef = doc(db, 'registeredUsers', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          alert('No user data found!');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const fetchBookingsByEmail = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      const bookingsRef = collection(db, 'flightBookings');
      const userEmail = user.email;
      const q = query(bookingsRef, where('userDetails.email', '==', userEmail));
      const querySnapshot = await getDocs(q);

      const userBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'currentBookings') {
      fetchBookingsByEmail();
    }
  }, [activeTab]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };
  
  
  const cancelBooking = async (bookingId) => {
    try {
      console.log(`Attempting to cancel booking with ID: ${bookingId}`);
    
      // Step 1: Fetch booking details
      const bookingRef = doc(db, 'flightBookings', bookingId);
      const bookingSnapshot = await getDoc(bookingRef);
    
      if (!bookingSnapshot.exists()) {
        console.error(`Booking with ID ${bookingId} not found`);
        return;
      }
    
      const bookingData = bookingSnapshot.data();
      const { flightDetails } = bookingData;
      const selectedSeats = bookingData.flightDetails.selectedSeats || [];

      console.log('Fetched booking data:', bookingData);
      console.log('Selected seats for cancellation:', selectedSeats);
    
      // Step 2: Fetch the flight document
      const flightsCollection = collection(db, 'flights');
      const flightQuery = query(flightsCollection, where('flightNumber', '==', flightDetails.flightNumber));
      const flightSnapshot = await getDocs(flightQuery);
    
      if (!flightSnapshot.empty) {
        const flightRef = flightSnapshot.docs[0].ref;
        const flightData = flightSnapshot.docs[0].data();
    
        console.log('Fetched flight data:', flightData);
    
        // Step 3: Loop through classTypes and their seats
        let updated = false; // Flag to track if we found and updated a seat
        for (let classType of flightData.classTypes) {
          if (Array.isArray(classType.seats)) {
            for (let seat of classType.seats) {
              console.log(`Checking seat ${seat.seatNumber} against ${selectedSeats}`);
              // Check if the seat number matches any selectedSeats for cancellation
              if (selectedSeats.includes(seat.seatNumber)) {
                console.log(`Updating seat ${seat.seatNumber} status to 'available'`);
                seat.status = 'available';  // Update seat status to available
                updated = true;
              }
            }
          }
        }
    
        if (updated) {
          // Step 4: Save the updated flight document with changed seat status
          await updateDoc(flightRef, { classTypes: flightData.classTypes });
          console.log('Flight seats updated successfully');
        } else {
          console.error('No matching seats found for cancellation');
        }
    
      } else {
        console.error('Flight not found in the flights collection');
      }
    
      // Step 5: Remove the booking from Firestore
      await deleteDoc(bookingRef);
      console.log(`Booking with ID ${bookingId} has been deleted from Firestore`);
    
      // Step 6: Update the local state to reflect the cancellation
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    
      console.log(`Booking with ID ${bookingId} has been successfully canceled`);
    
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };
  








  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userDetails) {
    return <div>No user details available.</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{userDetails.accountType === 'business' ? 'Business Profile' : 'User Profile'}</h2>
        <div className="close-icon" onClick={() => navigate('/home')}>
          <span>&times;</span>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'profile' ? 'active-tab' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={activeTab === 'currentBookings' ? 'active-tab' : ''}
          onClick={() => setActiveTab('currentBookings')}
        >
          Current Bookings
        </button>
      </div>

      <div className="tab-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-content">
            <table className="profile-table">
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{userDetails.name || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{userDetails.email || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{userDetails.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td>{userDetails.address || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Account Type</th>
                  <td>{userDetails.accountType || 'N/A'}</td>
                </tr>
                {userDetails.accountType === 'business' && (
                  <>
                    <tr>
                      <th>Business Name</th>
                      <td>{userDetails.businessName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Services Offered</th>
                      <td>{Array.isArray(userDetails.services) && userDetails.services.length > 0
                        ? userDetails.services.join(', ')
                        : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Business Hours</th>
                      <td>{userDetails.businessHours || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Website</th>
                      <td>{userDetails.website || 'N/A'}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={() => navigate('/edit-profile')}>
                Edit Profile
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}

{activeTab === 'currentBookings' && (
  <div className="bookings-content">
    <h2>Current Bookings</h2>
    {bookings.length === 0 ? (
      <p>No current bookings found.</p>
    ) : (
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Flight</th>
            <th>From</th>
            <th>To</th>
            <th>Arrival Time</th>
            <th>Departure Time</th>
            <th>Booking Time</th>
            <th>Class</th>
            <th>Seats</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const { flightDetails, selectedSeats, bookingTime } = booking;
            const formattedBookingTime = bookingTime
              ? new Date(bookingTime.toDate()).toLocaleString()
              : 'N/A';  // Correctly handling Firestore timestamp

            const seats = Array.isArray(flightDetails.selectedSeats) && flightDetails.selectedSeats.length > 0
              ? flightDetails.selectedSeats.join(', ')
              : 'No seats selected';

            return (
              <tr key={booking.id}>
                <td>{flightDetails.airline} ({flightDetails.flightNumber})</td>
                <td>{flightDetails.from}</td>
                <td>{flightDetails.to}</td>
                <td>{new Date(flightDetails.arrivalDateTime).toLocaleString()}</td>
                <td>{new Date(flightDetails.departureDateTime).toLocaleString()}</td>
                <td>{formattedBookingTime}</td>
                <td>{flightDetails.classType}</td>
                <td>{seats}</td>
                <td>
                  <button
                    className="cancel-btn"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
)}

      </div>
    </div>
  );
};

export default Profile;
