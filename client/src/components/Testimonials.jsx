import "./Testimonials.css";

const testimonials = [
  {
    name: "Amara Okafor",
    location: "Lagos, Nigeria",
    avatar:
      "https://i.pinimg.com/1200x/ef/dc/36/efdc3671143243fba300e9d9191bc177.jpg",
    text: "Gracia Fab's skincare range has truly elevated my beauty routine. Their products are luxurious, effective and have given my skin a radiant glow like never before.",
    rating: 5,
    product: "Vitamin C Serum",
  },
  {
    name: "Chidinma Eze",
    location: "Abuja, Nigeria",
    avatar:
      "https://i.pinimg.com/736x/67/cc/ae/67ccae09baf9e70b079a22c05cc0a0f2.jpg",
    text: "Gracia Fab products have transformed my skincare routine. My complexion has never looked healthier. I highly recommend for anyone seeking a luminous, glowing skin.",
    rating: 5,
    product: "Curl Defining Cream",
  },
  {
    name: "Blessing Adeyemi",
    location: "Port Harcourt, Nigeria",
    avatar:
      "https://i.pinimg.com/736x/3f/c3/ef/3fc3ef2a2ebdc8d8a84e50a0eeb93cd5.jpg",
    text: "Gracia Fab has truly revolutionized my routine, leaving my skin radiant and rejuvenated. An absolute must-have for anyone looking to achieve a luminous complexion.",
    rating: 5,
    product: "Bridal Glow Set",
  },
];

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials-inner">
        <div className="testimonials-header">
          <h2>Hear What Others Are Saying! 💬</h2>
          <p>
            Discover why our customers are loving our products and joining the
            glowing journey.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-rating">{"⭐".repeat(t.rating)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-product">
                Purchased: <span>{t.product}</span>
              </div>
              <div className="testimonial-author">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="testimonial-avatar"
                />
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-location">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
