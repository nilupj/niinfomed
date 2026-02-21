
import { useState } from 'react';

export default function FAQSection({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-neutral-200 pb-4 last:border-0">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left flex justify-between items-start gap-4 group"
            >
              <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-primary transition-colors">
                {faq.question}
              </h3>
              <svg
                className={`w-5 h-5 text-neutral-500 flex-shrink-0 transform transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="mt-3 text-neutral-700 prose max-w-none">
                <p>{faq.answer}</p>
                {faq.reviewedBy && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Reviewed by: {faq.reviewedBy}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
