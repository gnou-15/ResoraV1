import React, { useState } from "react";
import "../css/App.css";
import InteractiveBackground from "../components/InteractiveBackground";

export default function Contact({ onNavigate, isEmbedded, onMascotMoodChange }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFocus = () => {
    if (onMascotMoodChange) {
      onMascotMoodChange("excited");
    }
  };

  const handleBlur = () => {
    if (onMascotMoodChange) {
      onMascotMoodChange("normal");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required.";
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      if (onMascotMoodChange) {
        onMascotMoodChange("frantic");
        setTimeout(() => onMascotMoodChange("normal"), 1500);
      }
      return;
    }

    setLoading(true);
    if (onMascotMoodChange) {
      onMascotMoodChange("normal");
    }

    // Simulate sending message (network latency simulation)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (onMascotMoodChange) {
        onMascotMoodChange("excited");
      }
    }, 1500);
  };

  const handleResetForm = () => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setSubmitted(false);
    setErrors({});
    if (onMascotMoodChange) {
      onMascotMoodChange("normal");
    }
  };

  return (
    <div className="contact-container">
      {!isEmbedded && <InteractiveBackground />}
      
      {!isEmbedded && (
        <header className="landing-header">
          <a href="/" className="logo-container" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
            <svg className="logo-svg" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="21" r="9.5" fill="#1e293b" />
              <rect x="6" y="9.5" width="22" height="2.5" rx="0.8" fill="#1e293b" />
              <rect x="10" y="8" width="14" height="1.5" fill="#ea580c" />
              <rect x="10" y="1" width="14" height="7" rx="1" fill="#1e293b" />
              <circle cx="13.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="20.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="20.5" cy="19" r="3.6" stroke="#f59e0b" strokeWidth="0.9" fill="none" />
              <path d="M 17 23.5 C 13.5 21, 7.5 23.5, 5.5 27 C 7.5 27, 13 25.5, 17 24.5 C 21 25.5, 26.5 27, 28.5 27 C 26.5 23.5, 20.5 21, 17 23.5 Z" fill="#ffffff" />
            </svg>
            <h1 className="logo-brand">
              Resora <div className="logo-subtext">by Nezer</div>
            </h1>
          </a>
        </header>
      )}

      <main className="contact-main">
        <div className="contact-split-container">
          {/* Left Side: Info */}
          <div className="contact-info-column animate-fade-in">
            <h2 className="contact-title">Get in Touch</h2>
            <h3 className="contact-subtitle">We would love to hear from you</h3>
            <p className="contact-description">
              Have a question about our ATS template designs, found a bug, or just want to suggest a new feature? 
              Shoot us a message! Nezer company is dedicated to continuous improvement and supporting your job search journey.
            </p>
            
            <div className="contact-details-box">
              <div className="contact-detail-item">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" className="contact-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>support@resora.com</span>
              </div>
              <div className="contact-detail-item">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" className="contact-icon">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <span>Mon - Fri, 9:00 AM - 5:00 PM EST</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="contact-form-column animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="contact-card">
              {submitted ? (
                <div className="contact-success-screen">
                  <div className="success-icon-badge">
                    <svg viewBox="0 0 24 24" width="40" height="40">
                      <circle cx="12" cy="12" r="10" fill="#ffedd5" />
                      <path d="M8 12.5 L11 15.5 L16 9" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <h3 className="contact-form-title" style={{ textAlign: "center", color: "#9a3412" }}>Message Sent!</h3>
                  <p className="contact-description" style={{ textAlign: "center", fontSize: "0.95rem", color: "#475569" }}>
                    Thank you for reaching out! We've received your submission and will get back to you within 24 business hours.
                  </p>
                  <button type="button" className="auth-btn-primary" onClick={handleResetForm} style={{ marginTop: "1rem" }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form-el">
                  <h3 className="contact-form-title">Send a Message</h3>
                  
                  <div className="auth-input-group">
                    <label className="auth-label">Full Name <span className="req">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="Your name"
                      className={`auth-input ${errors.name ? "error" : ""}`}
                      disabled={loading}
                    />
                    {errors.name && <span className="auth-error-msg">{errors.name}</span>}
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Email Address <span className="req">*</span></label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="Your email address"
                      className={`auth-input ${errors.email ? "error" : ""}`}
                      disabled={loading}
                    />
                    {errors.email && <span className="auth-error-msg">{errors.email}</span>}
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Subject <span className="req">*</span></label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="Subject of message"
                      className={`auth-input ${errors.subject ? "error" : ""}`}
                      disabled={loading}
                    />
                    {errors.subject && <span className="auth-error-msg">{errors.subject}</span>}
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Message <span className="req">*</span></label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="Type your message here..."
                      className={`auth-input ${errors.message ? "error" : ""}`}
                      style={{ height: "120px", padding: "0.75rem 1rem", resize: "none" }}
                      disabled={loading}
                    />
                    {errors.message && <span className="auth-error-msg">{errors.message}</span>}
                  </div>

                  <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
                    {loading ? <span className="auth-spinner"></span> : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
