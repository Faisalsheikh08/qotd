export const verificationService = {
  async verifyAnswer(userAnswer, correctAnswers, languagePreference) {
    // Simplified verification (in production, integrate with Grok AI)
    const correctAnswer =
      languagePreference === "english"
        ? correctAnswers.english
        : correctAnswers.hindi;

    const userWords = userAnswer.toLowerCase().trim().split(/\s+/);
    const correctWords = correctAnswer.toLowerCase().trim().split(/\s+/);

    // Remove common words
    const commonWords = [
      "a",
      "an",
      "the",
      "is",
      "are",
      "was",
      "were",
      "in",
      "on",
      "at",
    ];
    const filteredUserWords = userWords.filter(
      (w) => !commonWords.includes(w) && w.length > 2
    );
    const filteredCorrectWords = correctWords.filter(
      (w) => !commonWords.includes(w) && w.length > 2
    );

    // Calculate match percentage
    let matchCount = 0;
    filteredCorrectWords.forEach((word) => {
      if (
        filteredUserWords.some((uw) => uw.includes(word) || word.includes(uw))
      ) {
        matchCount++;
      }
    });

    const confidence = Math.min(
      (matchCount / Math.max(filteredCorrectWords.length, 1)) * 100,
      100
    );

    const isCorrect = confidence >= 60;

    return {
      isCorrect,
      confidence: Math.round(confidence),
      feedback: {
        english: isCorrect
          ? "Excellent! Your answer demonstrates good understanding."
          : "Your answer needs improvement. Please review the topic.",
        hindi: isCorrect
          ? "उत्कृष्ट! आपका उत्तर अच्छी समझ को दर्शाता है।"
          : "आपके उत्तर में सुधार की आवश्यकता है। कृपया विषय की समीक्षा करें।",
      },
      suggestions: isCorrect
        ? null
        : {
            english: "Try to include key concepts and be more specific.",
            hindi:
              "मुख्य अवधारणाओं को शामिल करने का प्रयास करें और अधिक विशिष्ट रहें।",
          },
    };
  },

  // Future: Integrate with Grok AI API
  async verifyWithAI(userAnswer, correctAnswers, context) {
    // Placeholder for AI integration
    // This would call Grok AI API for sophisticated answer verification
    throw new Error("AI verification not implemented yet");
  },
};
