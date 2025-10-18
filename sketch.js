// sketch.js

// Global variables
let newsFetcher;
let sentimentAnalyzer;
let currentArticle;
let sentimentScore = 0.5;

// Cellular Automata variables
let cells = [];
let generation = 0;
const cellSize = 8;
let ruleset = [0, 0, 0, 1, 1, 1, 1, 0];

// Colors corresponding to sentiment
let colors = {
  positive: { r: 255, g: 223, b: 0 },
  negative: { r: 139, g: 0, b: 0 },
  neutral: { r: 0, g: 128, b: 0 }
};

function setup() {
  const canvas = createCanvas(600, 400);
  canvas.parent('canvas-container');

  const apiKey = 'af9531492df242869bcfd2e268f72c73';
  newsFetcher = new NewsFetcher(apiKey);
  
  // MODIFIED: Pass a callback function to the SentimentAnalyzer.
  // This function will run ONLY when the model is successfully loaded.
  sentimentAnalyzer = new SentimentAnalyzer(() => {
    console.log("Callback executed: Model is ready, enabling UI.");
    
    // 1. Get the button element
    const nextNewsButton = select('#next-news-btn');
    
    // 2. Enable the button and change its text
    nextNewsButton.removeAttribute('disabled');
    nextNewsButton.html('Switch to Next Article');
    
    // 3. Bind the click event
    nextNewsButton.mousePressed(getAndAnalyzeNextNews);
    
    // 4. NOW it's safe to load the first news article
    getAndAnalyzeNextNews();
  });
  
  resetAutomata();
}

function draw() {
  let speed = 1 + floor(abs(sentimentScore - 0.5) * 10);
  if (frameCount % (15 - speed) === 0) {
    generateNextGeneration();
  }
  renderAutomata();
}

async function getAndAnalyzeNextNews() {
  if (newsFetcher.articles.length === 0) {
    const success = await newsFetcher.fetchTopHeadlines();
    if (!success) return;
  }

  currentArticle = newsFetcher.getNextArticle();
  if (currentArticle) {
    select('#news-title').html(currentArticle.title);
    select('#news-summary').html(currentArticle.description || "No summary available");
    select('#sentiment-result').html('Analyzing...');

    const textToAnalyze = `${currentArticle.title}. ${currentArticle.description || ''}`;
    const result = await sentimentAnalyzer.predict(textToAnalyze);
    
    if (result && typeof result.score !== 'undefined') {
        sentimentScore = result.score;
        updateSentimentDisplay(sentimentScore);
    } else {
        console.error("Sentiment analysis failed to return a valid score.");
        sentimentScore = 0.5;
        updateSentimentDisplay(sentimentScore);
    }

    resetAutomata();
  }
}

function updateSentimentDisplay(score) {
  let sentimentText = "Neutral";
  if (score > 0.6) {
    sentimentText = `Positive - ${score.toFixed(2)}`;
  } else if (score < 0.4) {
    sentimentText = `Negative - ${score.toFixed(2)}`;
  } else {
    sentimentText = `Neutral - ${score.toFixed(2)}`;
  }
  select('#sentiment-result').html(sentimentText);
}

// --- Cellular Automata Functions (No changes below this line) ---

function resetAutomata() {
  background(240);
  cells = Array(floor(width / cellSize)).fill(0);
  cells[floor(cells.length / 2)] = 1;
  generation = 0;
}

function generateNextGeneration() {
  if (generation * cellSize > height) return;
  let nextgen = Array(cells.length).fill(0);
  for (let i = 1; i < cells.length - 1; i++) {
    let left = cells[i - 1];
    let me = cells[i];
    let right = cells[i + 1];
    nextgen[i] = rules(left, me, right);
  }
  cells = nextgen;
  generation++;
}

function renderAutomata() {
  let y = generation * cellSize;
  if (y > height) return;
  let c;
  if (sentimentScore > 0.6) c = colors.positive;
  else if (sentimentScore < 0.4) c = colors.negative;
  else c = colors.neutral;
  noStroke();
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 1) {
      fill(c.r + random(-20, 20), c.g + random(-20, 20), c.b + random(-20, 20));
      rect(i * cellSize, y, cellSize, cellSize);
    }
  }
}

function rules(a, b, c) {
  let s = '' + a + b + c;
  let index = parseInt(s, 2);
  return ruleset[index];
}