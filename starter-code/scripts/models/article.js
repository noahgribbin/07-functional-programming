(function(module) {
  // NOTE: Wrap the entire contents of this file in an IIFE.
  // Pass in to the IIFE a module, upon which objects can be attached for later access.
  function Article (opts) {
    for (key in opts) {
      this[key] = opts[key];
    }
  }

  Article.prototype.toHtml = function(scriptTemplateId) {
    var template = Handlebars.compile($(scriptTemplateId).text());
    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);
    return template(this);
  };

  Article.loadAll = function(inputData) {
    /* NOTE: the original forEach code should be refactored
       using `.map()` -  since what we are trying to accomplish is the
       transformation of one collection into another. */

    Article.allArticles = inputData.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    }).map(function(ele) {
      return new Article(ele);
    });
  };

/* NOTE: Refactoring the Article.fetchAll method, it now accepts a parameter
    that will execute once the loading of articles is done. We do this because
    we might want to call other view functions, and not just renderIndexPage();
    Now instead of calling articleView.renderIndexPage(), we can invoke
    whatever we pass in! */
  Article.fetchAll = function(next) {
    if (localStorage.hackerIpsum) {
      $.ajax({
        type: 'HEAD',
        url: '/data/hackerIpsum.json',
        success: function(data, message, xhr) {
          var eTag = xhr.getResponseHeader('eTag');
          if (!localStorage.eTag || eTag !== localStorage.eTag) {
            // pass 'next' into Article.getAll();
            Article.getAll(next);
          } else {
            Article.loadAll(JSON.parse(localStorage.hackerIpsum));
            next();
          }
        }
      });
    } else {
      Article.getAll(next);
    }
  };

  Article.getAll = function(next) {
    $.getJSON('/data/hackerIpsum.json', function(responseData, message, xhr) {
      localStorage.eTag = xhr.getResponseHeader('eTag');
      Article.loadAll(responseData);
      localStorage.hackerIpsum = JSON.stringify(responseData);
      next();
    });
  };

  /* Chain together a `map` and a `reduce` call to get a rough count of
    all words in all articles. */
  Article.numWordsAll = function() {
    return Article.allArticles.map(function(article) {
    // NOTE: Grab the word count from each article body.
      return article.body.split(' ').length;
    })
    // TODO: complete this reduce to get a grand total word count
    // DONE
    .reduce(function(curr, next, index, array) {
      return curr + next;
    }, 0);
  };

  /* Chain together a `map` and a `reduce` call to
          produce an array of *unique* author names. */
  Article.allAuthors = function() {
    return Article.allArticles.map(function(article) {
      // console.log(article.author);
      return article.author;
    })
      .reduce(function(acc, curr){
        if (acc.indexOf(curr) < 0) acc.push(curr);
        return acc;

      },[]);
      // console.log(uniqueAuthors);
    //return    TODO: DONE return just the author names

  /* TODO: DONE For our reduce that we'll chain here -- since we are trying to
      return an array, we'll need to specify an accumulator type (AKA initial value)
      What should this accumulator be and where is it placed? */
  };

  Article.numWordsByAuthor = function() {
  /*  Transform each author element into an object with 2 properties:
      One for the author's name, and one for the total number of words across
      the matching articles written by the specified author. */
    return Article.allAuthors().map(function(author) {
      return {
      // TODO: complete these properties:
        name: author,
        numWords: Article.allArticles.map(function(article) {
          if(article.author === author) {
            return article.body.split(' ').length;
          } else {
            return 0;
          };
        })
          .reduce(function(prev, curr) {
            // console.log(prev, curr);
            return prev + curr;
          })
      // .map(...) // TODO: use .map to return the author's word count for each article's body (hint: regexp!).
      // .reduce(...) // TODO: squash this array of numbers into one big number!
      // */

      };
    });
  };

  module.Article = Article;
})(window);
