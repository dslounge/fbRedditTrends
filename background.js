/**
 * Created by Rafael Mendiola (rmendiola@alum.mit.edu) on 8/13/14.
 */

var titleText = "TRENDING ON REDDIT";
var reddit = "https://www.reddit.com";
var listingLimit = "5";
var hotUrl = reddit + "/hot.json";
var fbSharerUrl = "http://www.facebook.com/sharer.php?u=";
var chromeStoreUrl = "http://chrome.google.com/webstore/detail/replace-facebook-trends-w/gbjbbjnmjelanjckpnebpbbgkilpgilp";
var githubUrl= "https://github.com/dslounge/fbRedditTrends";

var initialized = false;
//key dom elements
var container = null;
var header = null;
var title = null;
var itemsContainer = null;

// function for easy tracing.
function line(txt) {
    console.log(txt);
}

/**
 * identifies the key dom elements we'll be replacing.
 */
function identifyDOMElements(){
    container = $('#pagelet_trending_tags_and_topics');
    header = container.find(".uiHeader");
    title = container.find(".uiHeaderTitle a");
    itemsContainer = $(header.parent().children()[1]);
}

function popupwindow(url, title, w, h) {
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
}

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
        $("<div/>", {
            "class": "fbredd-stories-container",
            html: items.join("")
        }).appendTo(itemsContainer);

        //add the 'more stories' link if showing limited stories.
        if(numStories != null){
            var seeMore = $("<a href=\"#\" class=\"more-link\">" +
                "<i class=\"dropdown-icon\"></i>" +
                "See More</a>")

            seeMore.appendTo(itemsContainer);
            seeMore.click(function(){
                itemsContainer.empty();
                loadStories(); //load all stories.
            });
        }


        //about div
        var about = $("<div />").addClass("fbredd-about");
        var aboutTitle = $("<div />")
            .html("Replace Facebook Trends with Reddit")
            .addClass("about-title");

        var extensionLink = $("<a>")
            .html("extension home")
            .attr({href: chromeStoreUrl, target:"_blank"});

        var sourceLink = $("<a>")
            .html("open source")
            .attr({href: githubUrl, target:"_blank"});

        var shareLink = $("<a>").attr({href: "#"})
            .html("share it")
            .click(function(){
                var url = fbSharerUrl + chromeStoreUrl;
                popupwindow(url, "fbShare", 500, 300);
            });


        about.append(aboutTitle)
            .append(extensionLink).append(" | ")
            .append(sourceLink).append(" | ")
            .append(shareLink);
        itemsContainer.append(about);



        //hack for making the list scrollable:
        $(window).trigger('resize');


    });
}


function init(){
    line("--init--");
    title.html(titleText);
    itemsContainer.empty();
    itemsContainer.change(function(){
        line("trends change!");
    });
    loadStories(5);
}



//try running right away. If the elements are available, start loading stories
//otherwise, just wait until the DOM is ready.
identifyDOMElements();
if(itemsContainer){
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
