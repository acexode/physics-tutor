
### The Cursor Prompt

> **Context:** I am building a JAMB Physics Prep App called "Physics Pulse" to help a student master the syllabus. 
>
> **Reference Files:** Use `@physics (1).pdf` for the official syllabus/objectives and `@physics.pdf` for the bank of past questions and solutions.
>
> **Task:** Generate a functional React-based (Next.js/Tailwind) prototype of this app with the following requirements:
>
> 1. **Data Extraction & Mapping:**
>    - Analyze the "OBJECTIVES" column in `@physics (1).pdf`. Create a JSON-like structure where each Topic (e.g., Measurements and Units) is mapped to its specific learning objectives (e.g., "identify units of length," "use Vernier calipers").
>    - Analyze `@physics.pdf` to extract 5 sample questions and map them to the corresponding topic found in the syllabus.
>
> 2. **App Structure:**
>    - **Dashboard:** Display a list of Physics topics derived from the syllabus. Show a progress bar for each topic based on "Objective Mastery."
>    - **Topic View:** When a topic is clicked, list the specific "Candidates should be able to..." objectives from the PDF.
>    - **Practice Mode:** Create a quiz interface for the extracted questions. If a user gets a question wrong, display a "Theory Hint" based on the related objective from the syllabus.
>
> 3. **Specific Physics Logic:**
>    - Include a "Constants Sidebar" with values frequently used in the past questions (e.g., $g = 10ms^{-2}$).
>    - Ensure the UI can render LaTeX or mathematical notation correctly (use a library like `react-katex`).
>
> 4. **Output:** >    - Provide the folder structure and code for:
>      - `constants/syllabus.ts` (The mapped data from the PDFs).
>      - `components/TopicCard.tsx` 
>      - `components/QuizModule.tsx`
>      - `pages/index.tsx` (The main dashboard).
>
> Please start by outlining the JSON structure for the syllabus data to ensure you have captured the objectives correctly from the PDF.

***

### Pro-Tips for using this in Cursor:

* **The "Index" Strategy:** If the past questions PDF is too large for the LLM to read all at once, ask Cursor: *"Please look at page 2 of `@physics.pdf` and extract questions 1 through 10 to start my database."*
* **The Image Problem:** Since the past questions PDF contains diagrams (like the resonance tube in Question 1), Cursor may not be able to "see" the image perfectly. Ask it to: *"Create a placeholder component for question diagrams that I can manually upload images to later."*
* **Focus on the Bottleneck:** Tell Cursor: *"My sibling's biggest bottleneck is calculations. Prioritize the 'Numerical Problems' listed in the syllabus texts section of the PDF."*


