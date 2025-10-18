// news.js

class NewsFetcher {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.articles = [];
    this.currentIndex = -1;
  }

  // Fetch top headlines from API
  async fetchTopHeadlines() {
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${this.apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'ok') {
        this.articles = data.articles;
        console.log("News fetched successfully:", this.articles);
        return true;
      } else {
        console.error("News API error:", data.message);
        // Display error message on the interface
        document.getElementById('news-title').innerText = "Failed to fetch news";
        document.getElementById('news-summary').innerText = data.message;
        return false;
      }
    } catch (error) {
      console.error("Network error occurred while fetching news:", error);
      document.getElementById('news-title').innerText = "Failed to fetch news";
      document.getElementById('news-summary').innerText = "Please check your network connection or API key.";
      return false;
    }
  }

  // Get the next article
  getNextArticle() {
    if (this.articles.length === 0) {
      return null;
    }
    this.currentIndex = (this.currentIndex + 1) % this.articles.length;
    return this.articles[this.currentIndex];
  }
}