import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './FlightPage.css';
import SearchSection from '../search/Search-Section';

function FlightPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('flight');
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const flightsCollection = collection(db, 'flights');
        const flightDocs = await getDocs(flightsCollection);
        const flightData = flightDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFlights(flightData);
      } catch (error) {
        console.error('Error fetching flight data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { date: formattedDate, time: formattedTime };
  };

  const handleKnowMore = (flight) => {
    setSelectedFlight(flight);
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading flight details...</p>;
  }
  const closePopup = () => {
    setSelectedFlight(null);
  };

  return (
    <div className="flight-page-container">
      <section className="search">
        <SearchSection
          selectedMode={selectedMode}
          handleModeSelect={handleModeSelect}
          width="100%"
        />
      </section>
      <h1 className="flight-page-header">Book Your Flight With TravellPartner</h1>
      {flights.length > 0 ? (
        flights.map((flight) => {
          const departure = formatDateTime(flight.departureDateTime);
          const arrival = formatDateTime(flight.arrivalDateTime);

          return (
            <div key={flight.id} className="flight-card">
              <div className="company_logo">
                <img src="https://img.freepik.com/premium-vector/airlines-logo-design-vector-template_1070930-13.jpg" alt="Airline Logo" />
              </div>
              <div className="starting">
                <strong>{flight.from}</strong>
                <hr className="line" />
                <span className="date">{departure.date}, {departure.time}</span>
              </div>
              <div className="middle">
                {/* <span>{flight.airline}</span> */}
                <span>{flight.duration}</span>
                <span>{flight.isDirect ? 'Non Stop' : 'Stopover'}</span>
              </div>
              <div className="ending">
                <strong>{flight.to}</strong>
                <hr className="line" />
                <span className="date">{arrival.date}, {arrival.time}</span>
              </div>
              <div className="price_actions">
                <strong>{flight.ticketPrice}</strong>
                <span>Economy Class</span>
                <button
                  className="know_more_btn"
                  onClick={() => handleKnowMore(flight)}
                >
                  Know More
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p style={{ textAlign: 'center', marginTop: '50px' }}>No flights available.</p>
      )}

{selectedFlight && (
  <div className="flight-overlay">
    <div className="flight-modal">
      <button className="modal-close-btn" onClick={closePopup}>
        X
      </button>
      <h2>Flight Details</h2>

      {/* Time Section */}
      <div className="flight-time-container">
        <div className="flight-time">
          <strong>Departure:</strong> 
          <span>{new Date(selectedFlight.departureDateTime).toLocaleString()}</span>
        </div>
        <div className="flight-time">
          <strong>Arrival:</strong> 
          <span>{new Date(selectedFlight.arrivalDateTime).toLocaleString()}</span>
        </div>
      </div>

      {/* Flight Details Table */}
      <table className="flight-details-table">
        <thead>
          <tr>
            <th>Label</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Flight Number</td>
            <td>{selectedFlight.flightNumber}</td>
          </tr>
          <tr>
            <td>Airline</td>
            <td>{selectedFlight.airline}</td>
          </tr>
          <tr>
            <td>From</td>
            <td>{selectedFlight.from}</td>
          </tr>
          <tr>
            <td>To</td>
            <td>{selectedFlight.to}</td>
          </tr>
          <tr>
            <td>Departure Airport</td>
            <td>{selectedFlight.departureAirport} ({selectedFlight.departureCode})</td>
          </tr>
          <tr>
            <td>Arrival Airport</td>
            <td>{selectedFlight.arrivalAirport} ({selectedFlight.arrivalCode})</td>
          </tr>
          <tr>
            <td>Duration</td>
            <td>{selectedFlight.duration}</td>
          </tr>
        </tbody>
      </table>

      {/* Class Types */}
      {/* Class Types */}
<div className="flight-details-classes">
  <h3>Class Types</h3>
  <div className="class-type-card-container">
    {selectedFlight.classTypes.map((classType, index) => (
      <div className="class-type-card" key={index}>
        {/* Example icon, use an appropriate library or image */}
        <div className="class-type-icon">✈️</div>
        <div className="class-type-title">{classType.classType}</div>
        <div className="class-type-price">₹{classType.ticketPrice}</div>
        <div className="class-type-badge">{classType.baggageAllowance}</div>
        <div className="class-type-baggage">
          Includes {classType.baggageAllowance} baggage allowance
        </div>
      </div>
    ))}
  </div>
</div>


      {/* Book Now Button */}
      <div className="book-now-container">
        <a
          href={`/book-flight/${selectedFlight.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="book-now-btn"
        >
          Book Now
        </a>
      </div>
    </div>
  </div>
)}




    </div>
  );
}

export default FlightPage;
