import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import './FlightBooking.css';

function FlightBooking() {
  const { flightId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [passengerData, setPassengerData] = useState([]);
  const [loadingState, setLoadingState] = useState({ fetching: false, payment: false });
  const [formData, setFormData] = useState({
    classType: 'Economy',
    mealPreference: '',
    getOffers: false,
  });
  const [selectedClassPrice, setSelectedClassPrice] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    registrationDate: '',
  });
  const [bookingTime, setBookingTime] = useState(null);
  const [step, setStep] = useState(1); // Step management (1 = details, 2 = seat selection, 3 = payment)

// Function to handle the next step
const handleNextStep = () => {
  if (step < 4) {
    setStep(step + 1);
  }
};

// Update passenger data based on selected seats
useEffect(() => {
  // Generate an empty passenger data array based on the selected seats
  setPassengerData(new Array(selectedSeats.length).fill({ name: '', age: '', gender: 'Male' }));
}, [selectedSeats]);


// Function to handle the previous step
const handlePreviousStep = () => {
  if (step > 1) {
    setStep(step - 1);
  }
};



const renderPassengerForm = () => {
  return passengerData.map((passenger, index) => (
    <div key={index} className="passenger-form">
      <h4>Passenger {index + 1}</h4>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={passengerData[index]?.name || ''}
          onChange={(e) => handlePassengerChange(e, index)}
          required
        />
      </label>
      <label>
        Age:
        <input
          type="number"
          name="age"
          value={passengerData[index]?.age || ''}
          onChange={(e) => handlePassengerChange(e, index)}
          required
        />
      </label>
      <label>
        Gender:
        <select
          name="gender"
          value={passengerData[index]?.gender || 'Male'}
          onChange={(e) => handlePassengerChange(e, index)}
          required
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>
    </div>
  ));
};
const handlePassengerChange = (e, index) => {
  const { name, value } = e.target;

  setPassengerData(prevData => {
    const updatedPassengerData = [...prevData];
    updatedPassengerData[index] = {
      ...updatedPassengerData[index],
      [name]: value, // Update the specific field based on the input name
    };
    return updatedPassengerData;
  });
};



  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const flightDoc = doc(db, 'flights', flightId);
        const flightData = await getDoc(flightDoc);
        if (flightData.exists()) {
          setFlight({ id: flightId, ...flightData.data() });
        } else {
          console.error('Flight not found');
        }
      } catch (error) {
        console.error('Error fetching flight details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightId]);

  useEffect(() => {
    if (user) {
      setUserData((prevData) => ({
        ...prevData,
        email: user.email,
      }));

      const fetchUserDetails = async () => {
        try {
          const userDoc = doc(db, 'registeredUsers', user.uid);
          const userDetails = await getDoc(userDoc);
          if (userDetails.exists()) {
            setUserData((prevData) => ({
              ...prevData,
              name: userDetails.data().name || '',
              address: userDetails.data().address || '',
              phone: userDetails.data().phone || '',
              registrationDate: userDetails.data().registrationDate || '',
            }));
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };

      fetchUserDetails();
    }
  }, [user]);

  useEffect(() => {
    if (flight) {
      const selectedClassInfo = flight.classTypes.find(
        (type) => type.classType === 'Economy'
      );
      setSelectedClassPrice(selectedClassInfo ? selectedClassInfo.ticketPrice : 0);
    }
  }, [flight]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleClassTypeChange = (e) => {
    const selectedClass = e.target.value;
    setFormData({ ...formData, classType: selectedClass });

    const selectedClassInfo = flight.classTypes.find(
      (type) => type.classType === selectedClass
    );
    setSelectedClassPrice(selectedClassInfo ? selectedClassInfo.ticketPrice : 0);
  };

  const handleSeatSelection = (seat) => {
    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seat)) {
        return prevSelectedSeats.filter((selectedSeat) => selectedSeat !== seat);
      } else {
        return [...prevSelectedSeats, seat];
      }
    });
  };

  
  const validatePassengerDetails = () => {
    console.log(passengerData); // Log to check if data is being captured correctly
  
    return passengerData.every(
      (passenger) => passenger.name && passenger.age && passenger.gender
    );
  };
  
  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select your seats.');
      return;
    }
  
    if (!validatePassengerDetails()) {
      alert('Please fill in all passenger details.');
      return;
    }
  
    setLoadingState((prev) => ({ ...prev, payment: true })); // Start loader
  
    try {
      // Check if any selected seat is already reserved
      const reservedSeats = selectedSeats.filter((seat) =>
        flight.classTypes
          .find((type) => type.classType === formData.classType)
          .seats.some((s) => s.seatNumber === seat && s.status === 'reserved')
      );
  
      if (reservedSeats.length > 0) {
        alert('One or more selected seats are already reserved.');
        setLoadingState((prev) => ({ ...prev, payment: false })); // Stop loader
        return;
      }
  
      // Proceed with Razorpay payment and booking
      const options = {
        key: 'rzp_test_MddIsnrYTZiXDn', // Replace with your Razorpay API key
        amount: selectedClassPrice * selectedSeats.length * 100, // Convert to paise (₹1 = 100 paise)
        currency: 'INR',
        name: 'Flight Booking',
        description: `Booking seats: ${selectedSeats.join(', ')}`,
        handler: async function (response) {
          try {
            setLoadingState((prev) => ({ ...prev, payment: true })); // Start loader
  
            // Update seat status to 'reserved'
            const updatedSeats = flight.classTypes.map((classType) => {
              if (classType.classType === formData.classType) {
                classType.seats = classType.seats.map((seat) => {
                  if (selectedSeats.includes(seat.seatNumber)) {
                    return { ...seat, status: 'reserved', bookedBy: userData.name, email: userData.email };
                  }
                  return seat;
                });
              }
              return classType;
            });
  
            // Update flight data with the new seat reservations
            const flightRef = doc(db, 'flights', flightId);
            await updateDoc(flightRef, {
              classTypes: updatedSeats,
            });
  
           // Create the booking data
const flightBookingData = {
  flightDetails: {
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    from: flight.from,
    to: flight.to,
    departureCode: flight.departureCode,
    arrivalCode: flight.arrivalCode,
    arrivalDateTime: flight.arrivalDateTime,
    departureDateTime: flight.departureDateTime,
    duration: flight.duration,
    classType: formData.classType,
    selectedSeats: selectedSeats,
    mealPreference: formData.mealPreference || '',  // Default empty string if undefined
    price: selectedClassPrice,
    baggageAllowance: flight.classTypes.find((type) => type.classType === formData.classType)?.baggageAllowance || 0,
  },
  userDetails: {
    accountType: 'user',
    name: userData.name,
    email: userData.email,
    address: userData.address || '',
    phone: userData.phone,
    registrationDate: userData.registrationDate || new Date(),
  },
  passengerDetails: selectedSeats.map((seat, index) => ({
    seatNumber: seat,
    passengerName: passengerData[index]?.name || '',
    passengerAge: passengerData[index]?.age || 0,
    passengerGender: passengerData[index]?.gender || '',
    passengerPhone: passengerData[index]?.phone || '',
  })),
  bookingTime: serverTimestamp(),
};

            // Add the booking to Firestore
            await addDoc(collection(db, 'flightBookings'), flightBookingData);
  
            setLoadingState((prev) => ({ ...prev, payment: false })); // Stop loader
            alert('Booking successful!');
            navigate('/bookingConfirmation'); // Navigate to booking confirmation page
          } catch (error) {
            console.error('Error during payment handling:', error);
            setLoadingState((prev) => ({ ...prev, payment: false })); // Stop loader
            alert('An error occurred during payment.');
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,
        },
        notes: {
          address: userData.address,
        },
        theme: {
          color: '#F37254', // Customize Razorpay button color (optional)
        },
      };
  
      // Open Razorpay Payment Gateway
      const paymentGateway = new window.Razorpay(options);
      paymentGateway.open();
    } catch (error) {
      console.error('Error during payment handling:', error);
      setLoadingState((prev) => ({ ...prev, payment: false })); // Stop loader
      alert('An error occurred during the booking process.');
    }
  };
  
  
    

  



  if (loading) {
    return <div className="loader">Loading flight details...</div>;
  }
  return (
    <div className="flight-booking-container">
  {loading ? (
    <div className="loading-container">
      <p>Loading flight details...</p>
    </div>
  ) : (
    <div>
      {step === 1 && (
        <div className="step-container">
          <h2 className="step-title">Flight Details</h2>
          <div className="flight-details">
            <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
            <p><strong>Airline:</strong> {flight.airline}</p>
            <p><strong>From:</strong> {flight.from} ({flight.departureCode})</p>
            <p><strong>To:</strong> {flight.to} ({flight.arrivalCode})</p>
            <p><strong>Departure:</strong> {flight.departureDateTime}</p>
            <p><strong>Arrival:</strong> {flight.arrivalDateTime}</p>
            <p><strong>Duration:</strong> {flight.duration}</p>
          </div>
          <h3 className="preferences-title">Select Your Preferences</h3>
          <form className="preferences-form">
            <label>
              Class Type:
              <select
                name="classType"
                value={formData.classType}
                onChange={handleClassTypeChange}
                className="dropdown"
              >
                {flight.classTypes.map((classType) => (
                  <option key={classType.classType} value={classType.classType}>
                    {classType.classType}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Meal Preference:
              <input
                type="text"
                name="mealPreference"
                value={formData.mealPreference}
                onChange={handleChange}
                placeholder="e.g., Vegetarian"
                className="input-field"
              />
            </label>
            <label className="checkbox-label">
              Get Offers:
              <input
                type="checkbox"
                name="getOffers"
                checked={formData.getOffers}
                onChange={handleChange}
              />
            </label>
          </form>
          <button className="next-btn" onClick={handleNextStep}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step-container">
           
          <h2 className="step-title">Select Your Seats</h2>
          <div className="seat-selection">
            {flight.classTypes
              .find((type) => type.classType === formData.classType)
              .seats.map((seat) => (
                <button
                  key={seat.seatNumber}
                  className={`seat-btn ${
                    seat.status === 'reserved' ? 'reserved' : ''
                  } ${selectedSeats.includes(seat.seatNumber) ? 'selected' : ''}`}
                  onClick={() => handleSeatSelection(seat.seatNumber)}
                  disabled={seat.status === 'reserved'}
                >
                  {seat.seatNumber}
                </button>
              ))}
          </div>
          {step === 1 && renderSeatSelection()} {/* Step 1: Seat Selection */}
      {step === 2 && (
        <div>
          <h2>Enter Passenger Details</h2>
          {renderPassengerForm()} {/* Step 2: Passenger Details */}
        </div>
      )}
      {step === 3 && <div>Proceed to Payment or Confirmation</div>} Step 3: Payment
          <div className="seat-selection-summary">
            <p>Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
            <p>Total Price: ₹{selectedSeats.length * selectedClassPrice}</p>
          </div>
          <div className="navigation-buttons">
            <button className="prev-btn" onClick={handlePreviousStep}>
              Previous
            </button>
            <button className="next-btn" onClick={handleNextStep}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-container">
          <h2 className="step-title">Payment</h2>
          <p>
            You're booking for the following seats:{' '}
            {selectedSeats.join(', ')} in {formData.classType} class.
          </p>
          <p>Total Amount: ₹{selectedSeats.length * selectedClassPrice}</p>
          <div className="payment-container">
            
            <button
              className="pay-btn"
              onClick={handleProceed}
              disabled={loadingState.payment}
            >
              {loadingState.payment ? 'Processing...' : 'Proceed to Pay'}
            </button>
          </div>
          <div className="navigation-buttons">
            <button className="prev-btn" onClick={handlePreviousStep}>
              Previous
            </button>
          </div>

          
        </div>
      )}
    </div>
  )}
</div>

  );
}

export default FlightBooking;
