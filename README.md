# Math Learning Platform

## What is it
Gamified Elo-based math learning tool for students to compete against each other and across schools on the Australian curriculum, built with JavaScript and TypeScript, featuring a responsive frontend using Chakra UI and custom UI components; integrates Supabase for authentication and data storage of questions and user progress.

Next steps involve building a fine-tuned LLM pipeline (that uses SFT techniques on question-answer pairs created from non-copyright content) to generate unique, curriculum-aligned math questions dynamically. Another possible method could be to utilise a RAG of raw knowledge that is chunked based on subtopics from curriculum - and we utilise top 3/5 pieces of information and include as a part of the prompt for in-context learning to generate dynamic, unique questions.

Current Demo: https://drive.google.com/file/d/15HiUUM4Z5uK3yqki7fxsFAugNOLCmEwt/view?usp=sharing

## Set up
```
cd web-next2
npm install
npm run dev
```
