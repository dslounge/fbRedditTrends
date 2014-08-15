/**
 * Created by Rafael Mendiola (rmendiola@alum.mit.edu) on 8/13/14.
 */

var title = "TRENDING ON REDDIT";
var reddit = "http://www.reddit.com";
var hotUrl = reddit + "/hot.json";

// function for easy tracing.
function line(txt) {
    console.log(txt);
}

$(function () {
    var container = $('#pagelet_trending_tags_and_topics');
    var header = container.find(".uiHeader");
    var title = container.find(".uiHeaderTitle a");
    title.html(title);

    //find the container that holds the children and remove its contents.
    var itemsContainer = $(header.parent().children()[1]);
    itemsContainer.html("");

    $.getJSON(hotUrl, function (returnObj) {
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

    });

});