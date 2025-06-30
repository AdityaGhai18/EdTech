"use client";

import { Box, Flex, Heading, Text, SimpleGrid, Input, Button, VStack, HStack, Center } from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { StatCard } from "#components/dashboard/StatCard";
import { FiBookOpen, FiClock } from "react-icons/fi";
import { PageTransition } from "#components/motion/page-transition";
import { useState, useEffect, useRef } from "react";
import { supabase } from "utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@chakra-ui/react";
import ProtectedRoute from "#components/auth/protected-route";


interface Question {
  id: string;
  question: string;
  answer: string;
  elo: number;
  topic: string;
  grade: number;
  explanation: string;
}

const QEnvPage = () => {
  // State for current question and user data
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(""); // 'correct' | 'wrong' | ''
  const [workingOut, setWorkingOut] = useState("");
  const [elo, setElo] = useState(1200);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [eloChange, setEloChange] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch user and ELO from DB on mount
  useEffect(() => {
    const fetchUserAndElo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('elo')
          .eq('id', session.user.id)
          .single();
        let dbElo = profile?.elo;
        if (dbElo == null) {
          dbElo = 1200;
          await supabase.from('profiles').update({ elo: dbElo }).eq('id', session.user.id);
        }
        setElo(dbElo);
      }
    };
    fetchUserAndElo();
  }, []);

  // Fetch a random question based on user's ELO
  const fetchQuestion = async () => {
    try {
      // Just fetch any random question for now
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*');
      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }
      if (questions && questions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questions.length);
        setCurrentQuestion(questions[randomIndex]);
      }
    } catch (error) {
      console.error('Error in fetchQuestion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch first question on mount
  useEffect(() => {
    if (elo > 0) {
      fetchQuestion();
    }
  }, [elo]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer formatting helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Check if answer is correct
  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    // Simple string comparison for now
    // In the future, we might need more sophisticated math expression parsing
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQuestion) return;

    const isCorrect = checkAnswer(answer, currentQuestion.answer);
    const eloBefore = elo;
    let eloAfter = elo;
    let eloChange = 0;
    
    if (isCorrect) {
      eloAfter = elo + 10;
      eloChange = 10;
    } else {
      eloAfter = elo - 10;
      eloChange = -10;
    }

    // Update ELO in DB
    if (userId) {
      const { error: eloError } = await supabase.from('profiles').update({ elo: eloAfter }).eq('id', userId);
      if (eloError) {
        console.error('ELO update error:', eloError);
      } else {
        // Fetch the new ELO from DB to sync UI
        const { data: profile } = await supabase.from('profiles').select('elo').eq('id', userId).single();
        setElo(profile?.elo ?? eloAfter);
      }
    }

    // Insert into user_question_history with real question_id
    if (userId && currentQuestion) {
      const { error: insertError } = await supabase.from('user_question_history').insert({
        user_id: userId,
        question_id: currentQuestion.id, // Now using real UUID
        user_answer: answer,
        is_correct: isCorrect,
        elo_before: eloBefore,
        elo_after: eloAfter,
        time_taken: timer,
      });
      if (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    setEloChange(eloChange);
    if (isCorrect) {
      setFeedback('correct');
      setWorkingOut(currentQuestion.explanation);
      setShowResult(true);
    } else {
      setFeedback('wrong');
      setWorkingOut(currentQuestion.explanation);
      setShowResult(true);
    }
  };

  // Next question handler
  const handleNext = () => {
    setAnswer("");
    setFeedback("");
    setWorkingOut("");
    setShowResult(false);
    setEloChange(0);
    setTimer(0);
    setQuestionNumber(prev => prev + 1);
    fetchQuestion(); // Fetch new question
  };

  // if (loading) {
  //   return (
  //     <Box minH="100vh" bg="gray.900">
  //       <Flex h="full">
  //         <Sidebar />
  //         <Center ml="240px" w="calc(100% - 240px)" bg="gray.900">
  //           <Text color="white" fontSize="lg">Loading question...</Text>
  //         </Center>
  //       </Flex>
  //     </Box>
  //   );
  // }
const [minLoader, setMinLoader] = useState(true);

useEffect(() => {
  setMinLoader(true);
  const t = setTimeout(() => setMinLoader(false), 1000); // 2 seconds minimum
  return () => clearTimeout(t);
}, []);

if (loading || !currentQuestion || minLoader) {
  return (
    <Box minH="100vh" bg="gray.900">
      <Flex h="full">
        <Sidebar />
        <Box
          as="main"
          ml={{ base: 0, md: "240px" }}
          w={{ base: "100%", md: "calc(100% - 240px)" }}
          minH="100vh"
          bg="gray.900"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <AnimatePresence>
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <Spinner
                thickness="5px"
                speed="0.7s"
                emptyColor="gray.700"
                color="purple.400"
                size="xl"
                mb={6}
              />
              <Text color="white" fontSize="xl" fontWeight="bold" letterSpacing="wide">
                Loading questions...
              </Text>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Flex>
    </Box>
  );
}


  return (
    <ProtectedRoute>
      <Box minH="100vh" bg="gray.900">
        <Flex h="full">
          <Sidebar />
          <Box
            as="main"
            ml={{ base: 0, md: "240px" }}
            w={{ base: "100%", md: "calc(100% - 240px)" }}
            minH="100vh"
            bg="gray.900"
            position="relative"
          >
            <BackgroundGradient
              zIndex="0"
              width="full"
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
            />
            <PageTransition>
              <Box maxW="container.xl" mx="auto" px={8} py={8}>
                <Heading size="lg" mb={8} color="white" textAlign="center">
                  Question Environment
                </Heading>
                <Box maxW="container.lg" mx="auto" mb={8} h={{ base: "50vh", md: "60vh", lg: "70vh" }} px={4} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                  <StatCard
                    h="100%"
                    w="100%"
                    value={
                      <Box position="relative" h="100%" w="100%">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={showResult ? feedback : currentQuestion?.id || "question"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            style={{ width: "100%", height: "100%" }}
                          >
                            <AnimatePresence>
                              {showResult && feedback === 'wrong' ? (
                                <motion.div
                                  key="wrong"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: 0.3 }}
                                  style={{ width: "100%", height: "100%" }}
                                >
                                  <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={10} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" p={8} style={{ animation: 'fadeIn 0.5s' }}>
                                    <Text fontSize="3xl" fontWeight="extrabold" color="red.400" mt={4} mb={4}>
                                      Wrong
                                    </Text>
                                    <Text fontSize="xl" color="red.300" fontWeight="bold" mb={2}>
                                      ELO: {elo} ({eloChange})
                                    </Text>
                                    <Box bg="whiteAlpha.100" borderRadius="md" p={6} mt={4} mb={8} w="100%" maxW="600px">
                                      <Text color="white" fontSize="lg" fontWeight="bold" mb={2}>Explanation:</Text>
                                      <Text color="white">{workingOut}</Text>
                                    </Box>
                                    <Button colorScheme="purple" size="lg" mt={8} onClick={handleNext}>
                                      Next Question
                                    </Button>
                                  </Box>
                                </motion.div>
                              ) : showResult && feedback === 'correct' ? (
                                <motion.div
                                  key="correct"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: 0.3 }}
                                  style={{ width: "100%", height: "100%" }}
                                >
                                  <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={10} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" p={8} style={{ animation: 'fadeIn 0.5s' }}>
                                    <Text fontSize="3xl" fontWeight="extrabold" color="green.300" mt={4} mb={4}>
                                      Correct
                                    </Text>
                                    <Text fontSize="xl" color="green.300" fontWeight="bold" mb={2}>
                                      ELO: {elo} ({eloChange > 0 ? `+${eloChange}` : eloChange})
                                    </Text>
                                    <Box bg="whiteAlpha.100" borderRadius="md" p={6} mt={4} mb={8} w="100%" maxW="600px">
                                      <Text color="white" fontSize="lg" fontWeight="bold" mb={2}>Explanation:</Text>
                                      <Text color="white">{workingOut}</Text>
                                    </Box>
                                    <Button colorScheme="purple" size="lg" mt={8} onClick={handleNext}>
                                      Next Question
                                    </Button>
                                  </Box>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="question"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.4, ease: "easeInOut" }}
                                  style={{ width: "100%", height: "100%" }}
                                >
                                  {/* Question number at top left */}
                                  <Box position="absolute" top={8} left={8} zIndex={1}>
                                    <Text fontSize="3xl" color="white" fontWeight="extrabold">Question {questionNumber}</Text>
                                  </Box>
                                  
                                  {/* Timer and ELO at top right */}
                                  <Box position="absolute" top={6} right={8} display="flex" flexDirection="column" alignItems="flex-end" zIndex={1} mt={2}>
                                    <Text color="white" fontSize="2xl" fontWeight="bold">{formatTime(timer)}</Text>
                                    <VStack spacing={0} align="flex-end" mt={1}>
                                      <Text color="gray.400" fontSize="sm">ELO</Text>
                                      <Text color="white" fontSize="lg" fontWeight="bold">{elo}</Text>
                                    </VStack>
                                  </Box>

                                  {/* Question content in center */}
                                  {currentQuestion && (
                                    <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex={1} w="100%" maxW="800px" px={8}>
                                      <VStack spacing={6} align="center">
                                        <Text color="white" fontSize="2xl" fontWeight="bold" textAlign="center">
                                          {currentQuestion.question}
                                        </Text>
                                        <Text color="gray.300" fontSize="md" textAlign="center">
                                          Topics: {currentQuestion.topic}
                                        </Text>
                                      </VStack>
                                    </Box>
                                  )}

                                  {/* Input and buttons at bottom left */}
                                  <Box position="absolute" left={4} bottom={4} zIndex={1} w="calc(100% - 32px)">
                                    <VStack align="center" spacing={2} w="100%">
                                      <Input
                                        placeholder="Type your answer..."
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        size="md"
                                        bg="whiteAlpha.100"
                                        color="white"
                                        maxW="500px"
                                        w="100%"
                                        textAlign="center"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSubmit();
                                          }
                                        }}
                                      />
                                      <HStack spacing={6} justify="center" w="100%">
                                        <Button colorScheme="purple" size="md" onClick={handleSubmit}>
                                          Submit
                                        </Button>
                                        <Button colorScheme="gray" size="md" onClick={handleNext}>
                                          I don't know
                                        </Button>
                                      </HStack>
                                    </VStack>
                                  </Box>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </AnimatePresence>
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </PageTransition>
          </Box>
        </Flex>
      </Box>
    </ProtectedRoute>
  );
};

export default QEnvPage; 