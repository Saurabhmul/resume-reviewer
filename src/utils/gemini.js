import * as pdfjsLib from 'pdfjs-dist';

// Use CDN worker URL pinned to the exact installed version — avoids MIME/CORS
// issues with Vite's hashed asset filenames in production.
const PDFJS_VERSION = '5.5.207';
// Use the standard worker for 5.x (mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

export const extractTextFromFile = async (file) => {
  console.log("Extracting text from file:", file.name, "Type:", file.type);
  if (!file) return "No content found.";

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log("PDF ArrayBuffer size:", arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log("PDF loaded successfully, pages:", pdf.numPages);
      
      let pagesText = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Simple extraction first to ensure we get something
        const pageItems = textContent.items
          .filter(item => item.str !== undefined)
          .map(item => item.str);
        
        console.log(`Page ${i} extracted ${pageItems.length} text items`);
        pagesText.push(pageItems.join(' '));
      }
      
      const fullText = pagesText.join('\n\n');
      console.log("Final extracted text length:", fullText.trim().length);
      
      return fullText;
    } catch (err) {
      console.error("Critical PDF Extraction Error:", err);
      throw err;
    }
  } else {
    return await file.text();
  }
};

// Retries a fetch up to `maxRetries` times on transient server errors (429, 500, 503)
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;

    const retryable = [429, 500, 503].includes(response.status);
    if (!retryable || attempt === maxRetries) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Request failed with status ${response.status}`);
    }

    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500; // 1s, 2s, 4s + jitter
    console.warn(`Gemini API busy (${response.status}), retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${maxRetries})`);
    await new Promise(r => setTimeout(r, delay));
  }
};

export const analyzeResume = async (resumeText) => {
  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error('Resume text is empty or too short to analyze.');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn("Using mock Gemini response because API key is missing or default.");
    return {
      score: 85,
      summary: "This is a strong resume with good structure, but could use more quantified achievements.",
      strengths: ["Clear layout", "Relevant technical skills", "Good action verbs"],
      weaknesses: ["Missing quantified impact", "Summary is too generic", "Some formatting inconsistencies"],
      suggestions: [
        { title: "Quantify achievements", desc: "Add specific numbers to bullet points (e.g., 'increased sales by 20%')." },
        { title: "Tailor summary", desc: "Rewrite the summary to focus on the specific role you are applying for." },
        { title: "Standardize formatting", desc: "Ensure dates and locations are aligned consistently." }
      ]
    };
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist.
Today's date is ${today}. Use this as your reference when evaluating any dates, durations, or whether something is current, past, or future.
Analyze the following resume and return a JSON object with this exact structure:

{
  "score": <integer from 0-100 representing ATS compatibility and overall quality>,
  "summary": "<2-3 sentence executive summary of the resume's overall quality>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "weaknesses": [
    "<critical issue 1>",
    "<critical issue 2>",
    "<critical issue 3>"
  ],
  "suggestions": [
    { "title": "<actionable suggestion title>", "desc": "<specific, concrete description of how to improve with an example if possible>" },
    { "title": "<actionable suggestion title>", "desc": "<specific, concrete description>" },
    { "title": "<actionable suggestion title>", "desc": "<specific, concrete description>" }
  ]
}

Scoring guide:
- 80-100: Excellent ATS compatibility, strong metrics, great keywords
- 60-79: Good foundation but needs improvement
- Below 60: Significant issues with ATS compatibility or content quality

Be specific and refer to actual content from the resume. Return ONLY the JSON object, no markdown or extra text.

RESUME:
${resumeText}`;

  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gemini API request failed');
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Empty response from Gemini');

  return JSON.parse(raw);
};

export const structureAndRewriteResume = async (resumeText) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn("Using mock Gemini response for structureAndRewriteResume because API key is missing or default.");
    return {
      "name": "Jane Doe",
      "contact": ["jane.doe@example.com", "(555) 123-4567", "New York, NY", "linkedin.com/in/janedoe"],
      "sections": [
        {
          "title": "PROFESSIONAL SUMMARY",
          "type": "summary",
          "content": "Highly motivated Software Engineer with 5+ years of experience in designing and developing scalable web applications. Proven track record of improving application performance by 30% and successfully delivering complex projects on time."
        },
        {
          "title": "EXPERIENCE",
          "type": "experience",
          "items": [
            {
              "company": "Tech Solutions Inc.",
              "role": "Senior Frontend Developer",
              "duration": "Jan 2020 \u2013 Present",
              "location": "New York, NY",
              "bullets": [
                "Spearheaded the migration of a legacy monolithic application to a modern React-based micro-frontend architecture, resulting in a 40% reduction in load time.",
                "Mentored a team of 4 junior developers, fostering a culture of code quality and continuous learning.",
                "Implemented automated testing pipelines using Jest and Cypress, increasing test coverage to 85%."
              ]
            },
            {
              "company": "Web Innovators LLC",
              "role": "Web Developer",
              "duration": "Jun 2017 \u2013 Dec 2019",
              "location": "Boston, MA",
              "bullets": [
                "Developed and maintained highly responsive user interfaces using HTML, CSS, and JavaScript.",
                "Collaborated with cross-functional teams to design and implement new features, ensuring a seamless user experience.",
                "Optimized database queries, reducing response times by 25%."
              ]
            }
          ]
        },
        {
          "title": "EDUCATION",
          "type": "education",
          "items": [
            {
              "institution": "University of Technology",
              "degree": "Bachelor of Science in Computer Science",
              "duration": "2013 \u2013 2017",
              "details": ["GPA: 3.8/4.0", "Dean's List 2015-2017"]
            }
          ]
        },
        {
          "title": "SKILLS",
          "type": "skills",
          "categories": [
            { "label": "Programming Languages", "items": ["JavaScript (ES6+)", "TypeScript", "Python", "Java"] },
            { "label": "Frameworks \u0026 Libraries", "items": ["React", "Redux", "Node.js", "Express", "Tailwind CSS"] },
            { "label": "Tools \u0026 Technologies", "items": ["Git", "Docker", "AWS", "Webpack", "Jest", "Cypress"] }
          ]
        }
      ]
    };
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are an expert resume writer. Parse and rewrite the resume below, then return it as a single JSON object.
Today's date is ${today}. Use this as your reference for any date-related context.

REWRITING RULES:
- Replace weak/passive language with strong action verbs (e.g. "Responsible for" → "Spearheaded")
- Preserve ALL facts: do NOT invent or change any company names, job titles, dates, metrics, or locations
- Fix grammatical errors

RETURN this exact JSON structure (no markdown, no explanation, only valid JSON):

{
  "name": "Full Name",
  "contact": ["email", "phone", "city/country", "linkedin or portfolio url"],
  "sections": [
    {
      "title": "PROFESSIONAL SUMMARY",
      "type": "summary",
      "content": "The summary paragraph as a single string."
    },
    {
      "title": "EXPERIENCE",
      "type": "experience",
      "items": [
        {
          "company": "Company Name",
          "role": "Job Title",
          "duration": "Month Year – Month Year",
          "location": "City, Country",
          "bullets": ["Rewritten achievement bullet 1", "Rewritten achievement bullet 2"]
        }
      ]
    },
    {
      "title": "EDUCATION",
      "type": "education",
      "items": [
        {
          "institution": "University Name",
          "degree": "Degree, Field of Study",
          "duration": "Year – Year",
          "details": ["CGPA or GPA if present, or any honors"]
        }
      ]
    },
    {
      "title": "SKILLS",
      "type": "skills",
      "categories": [
        { "label": "Category name (e.g. Languages)", "items": ["skill1", "skill2"] }
      ]
    },
    {
      "title": "PROJECTS",
      "type": "projects",
      "items": [
        {
          "name": "Project Name",
          "tech": "Tech stack used",
          "bullets": ["What was built or achieved"]
        }
      ]
    }
  ]
}

RULES FOR THE JSON:
- Only include sections that actually exist in the resume. Do not add empty sections.
- For "skills": if the resume has no skill categories, use a single entry with an empty label: { "label": "", "items": [...] }
- For any other section (certifications, awards, activities, etc.) use type "list" with "items": ["item1", "item2"]
- The "contact" array should only contain items actually present in the resume
- Keep "location" empty string "" if not mentioned for an experience item

RESUME:
${resumeText}`;

  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gemini rewrite request failed');
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Empty rewrite response from Gemini');

  return JSON.parse(raw);
};
