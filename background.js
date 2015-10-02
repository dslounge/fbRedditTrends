/**
 * Created by Rafael Mendiola (rmendiola@alum.mit.edu) on 8/13/14.
 */

var redditTitleText = "REDDIT TRENDS";

var reddit = "https://www.reddit.com";
var listingLimit = "5";
var hotUrl = reddit + "/hot.json";
var fbSharerUrl = "http://www.facebook.com/sharer.php?u=";
var chromeStoreUrl = "http://chrome.google.com/webstore/detail/replace-facebook-trends-w/gbjbbjnmjelanjckpnebpbbgkilpgilp";
var githubUrl= "https://github.com/dslounge/fbRedditTrends";

var initialized = false;
//key dom elements
var rightColFixedContainer = null; //the div that gets a fixed position after updating contents.
var container = null;
var redditContainer = null;

// function for easy tracing.
function line(txt) {
    console.log(txt);
}

function addLoader(){
  $("<div>").attr("id", "reddit-loader").text("Loading Reddit Stories").appendTo(container);
}

function removeLoader(){
  $("#reddit-loader", container).remove();
}

/**
 * Creates the container if possible
 */
function setup(){
    //we need to track this div because it gets a fixed position after loading reddit stories,
    //and we need to undo that when it happens.
    rightColFixedContainer = $($("#rightCol").children().children().children()[0]);

    container = $('#pagelet_trending_tags_and_topics');

    //the pagelet shows up first and the content is banged in asynchronously, so we want to know if it's actually there yet
    //otherwise, it'll just come through and re-replace us
    var hasLoaded = $(".uiHeader", container).length;

    if (hasLoaded){
        container.empty();

        $("<h6>").addClass("uiHeaderTitle").addClass("redditTitle").css("color", "#9197a3").text(redditTitleText).appendTo(container)
        redditContainer = $("<div/>").attr("id", "fbredd-container").appendTo(container)
        addLoader();
        return true;
    }
    else return false
}

/**
 * Shows a popup in the middle of the screen with the given url, fbTrendsTitle, width and height.
 * @param url
 * @param title
 * @param w
 * @param h
 * @returns {Window}
 */
function popupwindow(url, title, w, h) {
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
}

/**
 * Loads stories from reddit and replaces fb trends.
 * @param numStories
 */
function loadStories(numStories){
    var url = (numStories) ? hotUrl + "?limit=" + listingLimit : hotUrl;
    $.getJSON(url, function (returnObj) {
        line("--stories loaded--");
        var items = [];
        var listings = returnObj.data.children;

        removeLoader();

        $.each(listings, function (key, val) {
            var story = val.data;
            var permalink = reddit + story.permalink;

            items.push("<div class=\"clearfix fbredd-item\">" +
                //TODO: is there a cleaner way of building this html?

                //arrow icon
                "<img class=\"fbredd-trending-arrow\" src=\"images/blank.gif\"/>" +

                //start content block
                "<div class=\"fbredd-text-block\">" +

                //story link
                "<a href='" + story.url + "' target=\"_blank\" class=\"fbredd-link\">" + story.title + "</a>&nbsp;&nbsp;" +

                //subreddit
                "<span class=\"fbredd-details\">r/" + story.subreddit + " ("

                //comments, permalink
                + "<a href='" + permalink + "' target=\"_blank\">" + story.num_comments + " comments</a>)"
                + "</span></div></div>");
        });

        //Add all the items to a div and stick it in the itemsContainer.
        redditContainer.html(items.join(""));

        //add the 'more stories' link if showing limited stories.
        if(numStories != null){
            var seeMore = $("<a href=\"#\" class=\"more-link\">" +
                "<i class=\"dropdown-icon\"></i>" +
                "See More</a>")

            seeMore.appendTo(redditContainer);
            seeMore.click(function(){
                redditContainer.empty();
                loadStories(); //load all stories.
            });
        }

        //about div
        var about = $("<div />").addClass("fbredd-about");
        var aboutTitle = $("<div />")
            .html("Replace Facebook Trends with Reddit").addClass("about-title");

        var extensionLink = $("<a>")
            .html("extension home").attr({href: chromeStoreUrl, target:"_blank"});

        var sourceLink = $("<a>")
            .html("open source").attr({href: githubUrl, target:"_blank"});

        var shareLink = $("<a>").attr({href: "#"}).html("share it")
            .click(function(){
                var url = fbSharerUrl + chromeStoreUrl;
                popupwindow(url, "fbShare", 500, 300);
            });

        about.append(aboutTitle)
            .append(extensionLink).append(" | ")
            .append(sourceLink).append(" | ")
            .append(shareLink);
        redditContainer.append(about);

        //remove fixed element css that occurs after loading stories.
        rightColFixedContainer.removeClass("fixed_elem");
        rightColFixedContainer.removeAttr("style"); //removes 'top' css style.
    });
}


function initialStories(){
    line("--init--");
    loadStories(5);
}

//try running right away. If the elements are available, start loading stories
//otherwise, just wait until the DOM is ready.
if(setup()){
    initialized = true;
    initialStories();
    listen();
}

$(function () {
    line("dom ready!");
    if(!initialized && setup()){
        initialStories();
        listen();
    }
});

/**
 * Listen for creation of new trending topics panel. This is for when fb
 * updates the page and layout asynchronously.
 *
 * This uses the arrive.js library: https://github.com/uzairfarooq/arrive/
 */
function listen(){
  $(document).arrive("#pagelet_trending_tags_and_topics .uiHeader", function() {
      if(!$(this).hasClass("redditTitle")){
          setup();
          initialStories();
      }
  });
}
