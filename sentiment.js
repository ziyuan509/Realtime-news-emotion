// sentiment.js

class SentimentAnalyzer {
  // MODIFIED: Constructor now accepts a callback function
  constructor(callback) {
    // The callback will be called when the model is ready
    this.sentiment = ml5.sentiment('movieReviews', () => this.modelLoaded(callback));
    this.isModelReady = false;
  }

  // MODIFIED: modelLoaded now executes the callback
  modelLoaded(callback) {
    console.log("Sentiment analysis model loaded!");
    this.isModelReady = true;
    // Execute the callback function passed from sketch.js
    if (callback) {
      callback();
    }
  }

  async predict(text) {
    if (!this.isModelReady) {
      console.log("Model is not ready yet...");
      return { score: 0.5 };
    }
    const result = await this.sentiment.predict(text);
    return result;
  }
}