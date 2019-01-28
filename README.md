# News-Scraper
News Scraper using Mongo


News scraper for NPR.  Ended up using a wild card selector "$("[class*=stor]")" 
due to the news stories having the class of either story or stories.

The pages will also have a link attributed to them, as well as clicking
the article allows a user to save a note on the page.

Typing /scrape after the url will allow the user to scrape articles.

Typing /articles will show all the articles that have been scraped and stored.