var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res) {
  axios.get("http://www.npr.org/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("[class*=stor]").each(function(i, element) {
      var result = {};

      var title = $(element).children().find('h3.title')[0];
            var titleText = title.children[0].data;

            var link = $(element).find('a')[0];
            var href = '';
            if (link && link.attribs && link.attribs.href) {
                href = link.attribs.href;
            }

            var teasers = $(element).find('.teaser');
            var teaser = teasers[0];
            var teaserText = '';
            if (teaser && teaser.children && teaser.children[0]) {
                teaserText = teaser.children[0].data;
            }

            if (titleText && href) {
                var result = {
                    title: titleText,
                    link: href,
                    teaser: teaserText || '',
                };
                console.log('running right before creating')
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log("dbArticles: ", dbArticle);
                    })
                    .catch(function (err) {
                        console.log('encountered error in db.Article.create');
                        return res.json(err);
                    });
                res.send("Scrape Complete");
            }
        });
    });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
