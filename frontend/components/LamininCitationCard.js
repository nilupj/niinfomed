import Link from 'next/link';
import { useState } from 'react';
export const runtime = "edge";
export default function LamininCitationCard({ citation, formatIsoformName }) {
  const [expanded, setExpanded] = useState(false);

  const {
    title = "Laminin: The Protein That Quietly Holds",
    citation_text = "In laminin mediated adhesion is disrupted in laboratory models, cells detach, lose orientation, death, or fail to organize into proper tissue layers. During embryonic development, laminin qui- correct destinations. In adult tissues, it coordinates wound repair by directing epithelial and p opulate damaged areas and restore barrier function (2).",
    highlighted_phrase_1 = "embryonic development",
    highlighted_phrase_2 = "laminin qui- correct destinations",
    source_reference = "The laminin family",
    source_link_text = "Go to source",
    source_url = "#",
    isoforms = [],
    reference_number = "(2)",
    image
  } = citation;

  // Function to highlight text
  const highlightText = (text) => {
    if (!text) return '';
    
    let highlighted = text;
    if (highlighted_phrase_1) {
      highlighted = highlighted.replace(
        new RegExp(`(${highlighted_phrase_1})`, 'gi'),
        '<strong class="text-teal-700 bg-teal-50 px-1 rounded">$1</strong>'
      );
    }
    if (highlighted_phrase_2) {
      highlighted = highlighted.replace(
        new RegExp(`(${highlighted_phrase_2})`, 'gi'),
        '<strong class="text-teal-700 bg-teal-50 px-1 rounded">$1</strong>'
      );
    }
    return highlighted;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Accent header */}
      <div className="h-2 bg-gradient-to-r from-teal-400 to-teal-500"></div>
      
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-neutral-800 mb-3 flex items-center">
          <span className="mr-2 text-teal-600">🧬</span>
          {title}
        </h3>

        {/* Main citation card - matches citation.png aesthetic */}
        <div className="bg-neutral-50 rounded-lg p-5 border-l-4 border-teal-500 mb-4">
          <div 
            className="text-neutral-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightText(citation_text) }}
          />
          
          {/* Source attribution */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-neutral-500 italic">
              {source_reference} {reference_number}
            </span>
            <Link 
              href={source_url}
              className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              {source_link_text}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Isoforms */}
        {isoforms && isoforms.length > 0 && (
          <div className="mt-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Related Isoforms
            </h4>
            <div className="flex flex-wrap gap-2">
              {isoforms.map((isoform, idx) => (
                <span 
                  key={isoform.id || idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                >
                  {formatIsoformName ? formatIsoformName(isoform) : isoform.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable description */}
        {citation.description && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
            >
              {expanded ? 'Show less' : 'Read more about laminin'}
              <svg 
                className={`w-4 h-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {expanded && (
              <div className="mt-2 text-sm text-neutral-600 bg-white border border-neutral-200 rounded-lg p-4">
                {citation.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}