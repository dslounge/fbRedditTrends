/**
 * Created by Rafael Mendiola (rmendiola@alum.mit.edu) on 8/13/14.
 */

var titleText = "TRENDING ON REDDIT";
var reddit = "http://www.reddit.com";
var listingLimit = "5";
var hotUrl = reddit + "/hot.json";

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
