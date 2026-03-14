import React from 'react';

const ResumeTemplate = ({ data }) => {
  if (!data) return null;

  return (
    <div 
      id="resume-html-template" 
      className="bg-white text-[#111827] box-border absolute top-0 -left-[9999px] z-[-1]"
      style={{ 
         width: '8.5in', // US Letter width
         minHeight: '11in',
         padding: '0.75in',
         fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
    >
       <div className="text-center mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-1 text-gray-900" style={{ margin: 0 }}>
             {data.name}
          </h1>
          <div className="text-sm text-gray-600 flex justify-center gap-3 mt-1 font-medium">
             {data.contact?.map((c, i) => (
                <React.Fragment key={i}>
                  <span>{c}</span>
                  {i < data.contact.length - 1 && <span className="text-gray-300">|</span>}
                </React.Fragment>
             ))}
          </div>
       </div>

       {data.sections?.map((sec, i) => (
         <div key={i} className="mb-5 last:mb-0">
            <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3 tracking-wider">
               {sec.title}
            </h2>
            {sec.items?.map((item, j) => (
               <div key={j} className="mb-3 last:mb-0">
                  {item.header && (
                     <div className="font-bold text-[13px] text-gray-900 mb-0.5 leading-snug">
                        {item.header}
                     </div>
                  )}
                  {item.body && item.body.length > 0 && (
                     <ul className="list-disc pl-5 m-0 text-[12px] text-gray-700 leading-relaxed marker:text-gray-500">
                        {item.body.map((b, k) => (
                           <li key={k} className="pl-1 mb-0.5">{b}</li>
                        ))}
                     </ul>
                  )}
               </div>
            ))}
         </div>
       ))}
    </div>
  );
};

export default ResumeTemplate;
