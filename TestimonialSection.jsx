import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO",
      company: "TechStart Inc.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "UptimePro saved us from a major outage that could have cost us thousands in revenue. The instant alerts allowed us to fix the issue before our customers even noticed.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "DevOps Engineer",
      company: "E-commerce Solutions",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "The detailed analytics and global monitoring locations give us complete visibility into our website performance. It's an essential tool for any serious business.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Founder",
      company: "Digital Agency Pro",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "We monitor over 100 client websites with UptimePro. The white-label reports and API integration make it perfect for agencies. Our clients love the transparency.",
      rating: 5
    },
    {
      name: "David Thompson",
      role: "IT Director",
      company: "FinanceFlow Corp",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The SSL certificate monitoring feature alone has saved us multiple times. UptimePro is reliable, accurate, and their support team is fantastic.",
      rating: 5
    },
    {
      name: "Lisa Park",
      role: "Product Manager",
      company: "SaaS Innovations",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      content: "Setting up monitoring for our entire infrastructure took less than 10 minutes. The dashboard is intuitive and the alerts are always accurate.",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "CEO",
      company: "Online Retail Plus",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      content: "UptimePro's monitoring helped us identify performance bottlenecks we didn't even know existed. Our site speed improved by 40% after implementing their recommendations.",
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our customers have to say about UptimePro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 p-6 rounded-xl relative card-hover"
            >
              <Quote className="w-8 h-8 text-blue-600 mb-4 opacity-50" />
              
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-8">Trusted by companies of all sizes</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">TechCorp</div>
            <div className="text-2xl font-bold text-gray-400">StartupXYZ</div>
            <div className="text-2xl font-bold text-gray-400">E-Shop Pro</div>
            <div className="text-2xl font-bold text-gray-400">WebFlow Inc</div>
            <div className="text-2xl font-bold text-gray-400">DataSync</div>
            <div className="text-2xl font-bold text-gray-400">CloudBase</div>
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-100">Average Rating</div>
              <div className="flex justify-center mt-2">
                {renderStars(5)}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Expert Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

