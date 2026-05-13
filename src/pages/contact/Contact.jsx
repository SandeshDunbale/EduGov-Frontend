import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import './contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to send message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', department: 'general', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="contact-page">
      
      {/* Page Header */}
      <section className="contact-header">
        <div className="badge">Support & Inquiries</div>
        <h1 className="title">Get in <span className="highlight">Touch</span></h1>
        <p className="subtitle">
          Whether you need technical support, compliance clarification, or academic assistance, our dedicated administrative teams are here to help.
        </p>
      </section>

      <div className="contact-content">
        
        {/* Left Side: Contact Information */}
        <div className="contact-info-section">
          
          <div className="info-glass-card">
            <div className="info-icon"><MapPin size={24} /></div>
            <div className="info-text">
              <h3>Headquarters</h3>
              <p>EduGov Central Administration<br/>100 Academic Way, Suite 400<br/>Innovation District, CA 90210</p>
            </div>
          </div>

          <div className="info-glass-card">
            <div className="info-icon"><Mail size={24} /></div>
            <div className="info-text">
              <h3>Official Email Channels</h3>
              <p><strong>IT Support:</strong> tech@edugov.edu<br/>
                 <strong>Compliance:</strong> audit@edugov.edu<br/>
                 <strong>General:</strong> info@edugov.edu</p>
            </div>
          </div>

          <div className="info-glass-card">
            <div className="info-icon"><Phone size={24} /></div>
            <div className="info-text">
              <h3>Direct Lines</h3>
              <p><strong>Main Desk:</strong> +1 (800) 555-0199<br/>
                 <strong>Emergency IT:</strong> +1 (800) 555-0911</p>
            </div>
          </div>

        </div>

        {/* Right Side: Secure Contact Form */}
        <div className="contact-form-section">
          <div className="form-glass-card">
            <div className="form-header">
              <MessageSquare className="form-header-icon" />
              <h2>Send a Secure Message</h2>
            </div>

            {isSubmitted ? (
              <div className="success-state">
                <CheckCircle2 size={48} className="success-icon" />
                <h3>Message Sent Successfully!</h3>
                <p>Your inquiry has been routed to the appropriate department. A representative will contact you within 24-48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="edugov-contact-form">
                
                <div className="input-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Dr. Jane Doe" 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>University Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="jane.doe@edugov.edu" 
                      required 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Route To Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} required>
                    <option value="general">General Inquiry</option>
                    <option value="it_support">Technical & IT Support</option>
                    <option value="compliance">Compliance & Auditing</option>
                    <option value="academic">Academic Affairs</option>
                    <option value="grants">Research & Grants</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Message</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder="Please describe your inquiry in detail..." 
                    rows="5" 
                    required 
                  ></textarea>
                </div>

                <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="spinner-icon" /> Routing Message...</> : <>Transmit Securely <Send size={18} /></>}
                </button>

              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;