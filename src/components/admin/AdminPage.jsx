import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase/firebaseConfig';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [userType, setUserType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const dummyFlights = [
    {
      flightNumber: 'AI-202',
      ticketPrice: 5500,
      airline: 'Air India',
      from: 'Delhi',
      to: 'Mumbai',
      departureAirport: 'Indira Gandhi International Airport',
      departureCode: 'DEL',
      arrivalAirport: 'Chhatrapati Shivaji Maharaj International Airport',
      arrivalCode: 'BOM',
      departureDateTime: '2025-01-15T08:00:00',
      arrivalDateTime: '2025-01-15T10:30:00',
      isDirect: true,
      stopoverDetails: null,
      duration: '2h 30m',
      classTypes: [
        {
          classType: 'Economy',
          ticketPrice: 5500,
          baggageAllowance: '15kg check-in, 7kg cabin',
          availableSeats: 'Window, Aisle',
          inFlightAmenities: 'Wi-Fi, Meals',
          mealPreferences: 'Veg/Non-Veg',
          covidGuidelines: 'Vaccination certificate required',
          checkInTime: '2 hours before departure',
          paymentOptions: 'UPI, Card, Netbanking',
          cancellationPolicy: '10% deduction on cancellation',
          offers: '10% off with code FLYHIGH',
          seatPricing: {
            window: 5500,
            aisle: 5400
          },
          seats: [
            { seatNumber: '1A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '1B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '1C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '2A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '2B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '2C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '3A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '3B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '3C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '4A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '4B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '4C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '5A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '5B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '5C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '6A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '6B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '6C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '7A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '7B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '7C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '8A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '8B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '8C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '9A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '9B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '9C', seatPosition: 'Middle', status: 'available' }
          ]
        },
        {
          classType: 'Business',
          ticketPrice: 12000,
          baggageAllowance: '30kg check-in, 15kg cabin',
          availableSeats: 'Window, Aisle, Middle',
          inFlightAmenities: 'Wi-Fi, Meals, Entertainment',
          mealPreferences: 'Non-Veg, Special Requests',
          covidGuidelines: 'Vaccination certificate required',
          checkInTime: '1 hour before departure',
          paymentOptions: 'UPI, Card, Netbanking',
          cancellationPolicy: 'Refundable with 15% deduction',
          offers: '15% off with code AIRINDIA',
          seatPricing: {
            window: 12000,
            aisle: 11800,
            middle: 11500
          },
          seats: [
            { seatNumber: '1A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '1B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '1C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '2A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '2B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '2C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '3A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '3B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '3C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '4A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '4B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '4C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '5A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '5B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '5C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '6A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '6B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '6C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '7A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '7B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '7C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '8A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '8B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '8C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '9A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '9B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '9C', seatPosition: 'Middle', status: 'available' }
          ]
        }
      ]
    },
    // More flights added below
    {
      flightNumber: 'AI-203',
      ticketPrice: 5300,
      airline: 'Air India',
      from: 'Kolkata',
      to: 'Hyderabad',
      departureAirport: 'Netaji Subhash Chandra Bose International Airport',
      departureCode: 'CCU',
      arrivalAirport: 'Rajiv Gandhi International Airport',
      arrivalCode: 'HYD',
      departureDateTime: '2025-01-17T10:00:00',
      arrivalDateTime: '2025-01-17T12:00:00',
      isDirect: true,
      stopoverDetails: null,
      duration: '2h 00m',
      classTypes: [
        {
          classType: 'Economy',
          ticketPrice: 5300,
          baggageAllowance: '15kg check-in, 7kg cabin',
          availableSeats: 'Window, Aisle',
          inFlightAmenities: 'Snacks, Water',
          mealPreferences: 'Veg',
          covidGuidelines: 'Mask mandatory',
          checkInTime: '1 hour before departure',
          paymentOptions: 'UPI, Wallet',
          cancellationPolicy: 'Non-refundable',
          offers: 'Flat ₹300 off with code AIRINDIA',
          seatPricing: {
            window: 5300,
            aisle: 5100
          },
          seats: [
            { seatNumber: '1A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '1B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '1C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '2A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '2B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '2C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '3A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '3B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '3C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '4A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '4B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '4C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '5A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '5B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '5C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '6A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '6B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '6C', seatPosition: 'Middle', status: 'available' },
            { seatNumber: '7A', seatPosition: 'Window', status: 'available' },
            { seatNumber: '7B', seatPosition: 'Aisle', status: 'available' },
            { seatNumber: '7C', seatPosition: 'Middle', status: 'available' }
          ]
        }
      ]
    },
    // Repeat adding more flights up to 20
];

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'registeredUsers', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.accountType === 'business') {
            setUserType('business');
          } else {
            navigate('/home');
          }
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const uploadFlights = async () => {
    setUploading(true);
    try {
      const flightsCollection = collection(db, 'flights');
      for (const flight of dummyFlights) {
        const q = query(flightsCollection, where('flightNumber', '==', flight.flightNumber));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(flightsCollection, flight);
        }
      }
      alert('Flights uploaded successfully!');
    } catch (error) {
      console.error('Error uploading flights:', error);
      alert('Error uploading flights.');
    } finally {
      setUploading(false);
    }
  };

  if (userType !== 'business') {
    return <p>You do not have access to this page.</p>;
  }

  return (
    <div>
      <h1>Welcome to the Admin Page</h1>
      <button onClick={uploadFlights} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Flight Data'}
      </button>
    </div>
  );
};

export default AdminPage;
