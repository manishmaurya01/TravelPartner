import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    accountType: "",
    phone: "",
    address: "",
    services: "",
  });
  const [activeAccountType, setActiveAccountType] = useState("");
  const navigate = useNavigate();

  const handleInitialChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdditionalChange = (e) => {
    setAdditionalInfo({ ...additionalInfo, [e.target.name]: e.target.value });
  };

  const handleAccountTypeChange = (type) => {
    setActiveAccountType(type);
    setAdditionalInfo({ ...additionalInfo, accountType: type });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Save basic info to Firestore
      await setDoc(doc(db, "registeredUsers", user.uid), {
        email: formData.email,
        registrationDate: new Date(),
      });

      // Open additional info popup
      setIsAdditionalInfoOpen(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save basic info to Firestore
      await setDoc(doc(db, "registeredUsers", user.uid), {
        email: user.email,
        name: user.displayName || "",
        phone: user.phoneNumber || "",
        registrationDate: new Date(),
      });

      // Open additional info popup
      setIsAdditionalInfoOpen(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAdditionalSubmit = async () => {
    const { accountType, phone, address, services } = additionalInfo;

    if (!accountType) {
      alert("Please select an account type.");
      return;
    }

    if (accountType === "business" && !services) {
      alert("Please select a service type.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User is not logged in");

      // Save additional info to Firestore
      await updateDoc(doc(db, "registeredUsers", user.uid), {
        accountType,
        phone,
        address,
        services: accountType === "business" ? services : null,
      });

      alert("Registration Completed!");
      setIsAdditionalInfoOpen(false);
      navigate("/home");
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (isAdditionalInfoOpen) {
        e.preventDefault();
        e.returnValue = "";
        await signOut(auth);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAdditionalInfoOpen]);

  return (
    <div className="auth-page">
      <div className="waves">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="wave-svg"
        >
          <path
            fill="#6c63ff"
            fillOpacity="1"
            d="M0,224L60,202.7C120,181,240,139,360,133.3C480,128,600,160,720,186.7C840,213,960,235,1080,213.3C1200,192,1320,128,1380,96L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="auth-container">
        <h2>Register</h2>
        <form onSubmit={handleInitialSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInitialChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInitialChange}
            required
          />
          <button type="submit" className="normal_btn">Register</button>
        </form>
        <button onClick={handleGoogleSignup} className="google-login-btn">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google Icon"
            className="google-icon"
          />
          Sign up with Google
        </button>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>

      {isAdditionalInfoOpen && (
        <div className="additional-info-popup">
          <div className="popup-content">
            <h2>Complete Your Registration</h2>
            <div className="account-type">
              <button
                className={activeAccountType === "user" ? "active" : ""}
                onClick={() => handleAccountTypeChange("user")}
              >
                User
              </button>
              <button
                className={activeAccountType === "business" ? "active" : ""}
                onClick={() => handleAccountTypeChange("business")}
              >
                Business
              </button>
            </div>
            {activeAccountType && (
              <>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone (Optional)"
                  value={additionalInfo.phone}
                  onChange={handleAdditionalChange}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address (Optional)"
                  value={additionalInfo.address}
                  onChange={handleAdditionalChange}
                />
              </>
            )}
            {activeAccountType === "business" && (
              <select
                name="services"
                value={additionalInfo.services}
                onChange={handleAdditionalChange}
              >
                <option value="">Select a service</option>
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="cab">Cab</option>
              </select>
            )}
            <button onClick={handleAdditionalSubmit} className="normal_btn">
              Complete Registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
