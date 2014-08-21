/**
 * Created by Rafael Mendiola (rmendiola@alum.mit.edu) on 8/13/14.
 */

var redditTitleText = "REDDIT TRENDS";
var fbTitleText = "FB TRENDS";

var reddit = "https://www.reddit.com";
var listingLimit = "5";
var hotUrl = reddit + "/hot.json";
var fbSharerUrl = "http://www.facebook.com/sharer.php?u=";
var chromeStoreUrl = "http://chrome.google.com/webstore/detail/replace-facebook-trends-w/gbjbbjnmjelanjckpnebpbbgkilpgilp";
var githubUrl= "https://github.com/dslounge/fbRedditTrends";

var initialized = false;
//key dom elements
var container = null;
var rightColFixedContainer = null; //the div that gets a fixed position after updating contents.
var header = null;
var fbTrendsTitle = null;
var fbTrendsContainer = null;
var redditTrendsTitle = null;
var redditContainer = null;



// function for easy tracing.
function line(txt) {
    console.log(txt);
}

/**
 * identifies the key dom elements we'll be working with. It also makes the container for reddit trends.
 */
function identifyDOMElements(){
    //we need to track this div because it gets a fixed position after loading reddit stories,
    //and we need to undo that when it happens.
    rightColFixedContainer = $($("#rightCol").children().children().children()[0]);

    container = $('#pagelet_trending_tags_and_topics');
    header = container.find(".uiHeader");

    var titleBar = container.find(".uiHeaderTitle");

    fbTrendsTitle = $("<a />").attr({href: "#"});
    redditTrendsTitle = $("<a />").attr({href: "#"});

    titleBar.empty().append(redditTrendsTitle).append("&nbsp;|&nbsp;").append(fbTrendsTitle);

    var trendsParent = header.parent();
    fbTrendsContainer = $(trendsParent.children()[1]);
    trendsParent.append($("<div />").attr({id:"fbredd-container"}));
    redditContainer = container.find("#fbredd-container");

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
        line(returnObj);
        var listings = returnObj.data.children;

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


function init(){
    line("--init--");
    fbTrendsContainer.hide();

    redditTrendsTitle.html(redditTitleText);
    fbTrendsTitle.html(fbTitleText);

    fbTrendsTitle.addClass("fbredd-link-inactive");
    redditTrendsTitle.click(function(){
        fbTrendsContainer.hide();
        redditContainer.show();

        fbTrendsTitle.addClass("fbredd-link-inactive");
        redditTrendsTitle.removeClass("fbredd-link-inactive");
    });

    fbTrendsTitle.click(function(){
        redditContainer.hide();
        fbTrendsContainer.show();
        fbTrendsTitle.removeClass("fbredd-link-inactive");
        redditTrendsTitle.addClass("fbredd-link-inactive");
    });

    loadStories(5);
}

//try running right away. If the elements are available, start loading stories
//otherwise, just wait until the DOM is ready.
identifyDOMElements();
if(fbTrendsContainer){
    initialized = true;
    init();
}

$(function () {
    line("dom ready!");
    if(!initialized){
        identifyDOMElements();
        init();
    }
});

/**
 * Listen for creation of new trending topics panel. This is for when fb
 * updates the page and layout asynchronously.
 *
 * This uses the arrive.js library: https://github.com/uzairfarooq/arrive/
 */
$(document).arrive("#pagelet_trending_tags_and_topics .uiHeader", function() {
    identifyDOMElements();
    init();
});