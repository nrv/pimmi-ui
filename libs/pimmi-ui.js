function generateContainerHTML() {
    return $("<div>", {'class': 'row'});
}

function generateSingleImageHTML(imageId) {
    let imgurl = MEDIA_SERVER_URI + imageId;
    return "<div><div class='thumbnail'><img class='lozad' data-src=\"" + imgurl + "\"/></div><div class='very_small'>" + imageId + "</div></div>";
}

function openCluster(e) {
    let title = $(e.currentTarget).data('title');
    let listOfImages = $(e.currentTarget).data('images');
    $('#showClusterModal').modal('show');
    $('#clusterTitle').text(title)
    $('#clusterImages').empty();
    let c = generateContainerHTML();
    for (let i = 0; i < listOfImages.length; i++) {
        c.append(generateSingleImageHTML(listOfImages[i]));
    }
    $('#clusterImages').append(c);
    observer.observe();
}

function generateClusterHTML(clusterData) {
    let item = $("<div>", {'class': 'col justify-content-between align-items-center cluster-item'});
    item.data('images', clusterData['images']);
    let q = Math.round(100 * clusterData['match_quality'])
    item.data('title', "Cluster " + (clusterData['cluster']) + ", " + (clusterData['nb_images']) + " images, " + (clusterData['nb_seen']) + " tweets, quality : " + q);
    item.append("<h4 class=\"my-0 font-weight-normal\">Cluster " + clusterData['cluster'] + "</h4>");
    item.append("<span class='badge badge-primary badge-pill'>" + (clusterData['nb_images']) + " img / " + (clusterData['nb_seen']) + " twt / " + q + "</span>");
    item.append(generateSingleImageHTML(clusterData['sample_path']));
    return item;
}

function generateFullHTML(filteredAnSortedData) {
    $("#clusters").empty();

    let c = generateContainerHTML();
    $.each(filteredAnSortedData, function (index, clusterData) {
        let item = generateClusterHTML(clusterData);
        c.append(item);
    });

    $("#clusters").append(c);
    observer.observe();
    $('.cluster-item').on('click', function (e) {
        openCluster(e);
    });
}

function filterAndSort() {
    let filtImages = parseInt(document.getElementById('filter-images').value);
    let filtTweets = parseInt(document.getElementById('filter-tweets').value);
    let filtQuality = parseInt(document.getElementById('filter-quality').value);

    console.log("filterAndSort [" + rawJson.length + " - " + sortCrit + ", " + filtImages + ", " + filtTweets + ", " + filtQuality + "] ...");
    let finalJson = rawJson
    if (filtImages > 1 || filtTweets > 1 || filtQuality > 0) {
        console.log("... filtering");
        finalJson = finalJson.filter(function (entry) {
            return (entry['nb_images'] >= filtImages) && (entry['nb_seen'] >= filtTweets) && (100 * entry['match_quality'] >= filtQuality);
        });
    }

    console.log("... sorting " + finalJson.length + " on " + sortCrit);
    finalJson.sort(function (a, b) {
        return parseFloat(b[sortCrit]) - parseFloat(a[sortCrit]);
    });
    console.log("... almost done");
    generateFullHTML(finalJson);
    console.log("... done");
}

function sortOn(c) {
    sortCrit = c
    filterAndSort();
}

let rawJson;
let sortCrit = 'nbMatch'
let filtImages = 1
let filtTweets = 1
let jqxhr = $.getJSON(DATA_FILE, function () {
    // console.log("success");
}).fail(function () {
    // console.log("error");
}).always(function () {
    // console.log("complete");
}).done(function (data) {
    // console.log("done");
    rawJson = data;

    for(var c = 0; c < rawJson.length; c++) {
        rawJson[c].nb_images = rawJson[c].images.length
    }

    generateFullHTML(rawJson)
});

const observer = lozad('.lozad', {
        rootMargin: '10px 0px',
        threshold: 0.1,
        // loaded: function (el) {
        //     if (USE_MAGNIFIER) {
        //         $(el).elevateZoom({
        //             tint: true,
        //             tintColour: '#F90',
        //             tintOpacity: 0.5,
        //             scrollZoom: true
        //         });
        //     }
        // }
    })
;



