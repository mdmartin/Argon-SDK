var radius = 5; //how far away we're willing to go
var units = "mi"; //units for radius
var page_limit = 100; //only show 100 geolocs(? geospots?) for all searches
var twiticon = "http://argonapps.gatech.edu/search/images/icon_twitter.png";
var searches = new Array();
var pagenumber = 1;

var myLat = 33.777221, myLong = -84.396211;

function BaseSearch(name){
    this.activated = true;
    this.name = name;
    this.search;
    this.handler;
}

twitter_search = new BaseSearch("Twitter Search");
twitter_search.search = function(internalpage, keyword){
    if(internalpage === undefined || internalpage < 1) internalpage = 1;
    var url = "http://search.twitter.com/search.json?callback=twitter_search.handler&rpp=" + 
        50 + "&page=" + internalpage + "&geocode=" + myLat + "%2C" + myLong + 
        "%2C" + radius;
    if(keyword.charAt(0) == '#') url += "&tag=" + keyword.substring(1,keyword.length);
    else if(keyword != '') url += "&q=" + keyword;
    scriptElement = document.createElement("SCRIPT");
    scriptElement.type = "text/javascript";
    scriptElement.src = url;
    scriptElement.id = "injected";
    document.getElementsByTagName('head')[0].appendChild(scriptElement);
}
twitter_search.handler = function(data){
    scriptElement = document.getElementById('injected');
    scriptElement.parentNode.removeChild(scriptElement);
    var innerhtml = "";
    for(var i = 0, length = data.results.length; i < length; i++){
        if(data.results[i].geo != null){
            innerhtml += "<div class=twitsearch><img style=\"float:left\" src=" + twiticon + "/>\n" + 
                "<span class=twitusername>" + data.results[i].from_username + "</span><br/>\n" +
                "<span class=twittext>" + data.results[i].text + "</span></div>\n";
        }
    }
    document.getElementById("view").innerHTML += innerhtml;
}
searches[0] = twitter_search;
add_to_search_select(0);

flickr_search = new BaseSearch("Flickr Search");
flickr_search.search = function(internalpage, keyword){
    if(internalpage === undefined || internalpage < 1) internalpage = 1;
    var url = "http://api.flickr.com/services/rest/?method=flickr.photos.search" + 
        "&api_key=7e893653fffba0face9ae992aa2fdf12" + 
        "&tags=" + keyword + "&per_page=20&page=0&format=json" + "&jsoncallback=flickr_search.handler" + 
        "&has_geo=true&lat=" + myLat + "&lon=" + myLong + "&radius=" + radius + "&extras=owner_name,geo," +
        "url_sq,url_m";
    scriptElement = document.createElement("SCRIPT");
    scriptElement.type = "text/javascript";
    scriptElement.src = url;
    scriptElement.id = 'injected';
    document.getElementsByTagName('head')[0].appendChild(scriptElement);
}
flickr_search.handler = function(data){
   scriptElement = document.getElementById('injected');
   scriptElement.parentNode.removeChild(scriptElement);
   var innerhtml = '';
   for(var i = 0, length = data.photos.photo.length; i < length; i++){
       innerhtml += "<div class=flickrsearch><img src=\"" + data.photos.photo[i].url_sq + "\"/></div>";
   }
   document.getElementById("view").innerHTML += innerhtml;
}
searches[1] = flickr_search;
add_to_search_select(1);

//Find better way to do this. Fuck you Flickr.
function jsonFlickrApi(data){
    flickr_search.handler(data);
}

function runsearch(keyword){
    document.getElementById('view').innerHTML = "";
    for(var i = 0, length = searches.length; i < length; i++){
        if(searches[i].activated) searches[i].search(pagenumber, keyword);
    }
}

function add_to_search_select(engine_ind){
    search_select = document.getElementById('search_select');
    search = document.createElement("DIV");
    label = document.createElement("LABEL");
    label.setAttribute("for", searches[engine_ind].name.substring(0,5));
    label.innerHTML = searches[engine_ind].name;
    search.appendChild(label);
    input = document.createElement("INPUT");
    input.name = searches[engine_ind].name.substring(0,5);
    input.type = "checkbox";
    input.value = engine_ind;
    input.checked = "true";
    input.setAttribute("onclick", "toggle_activated_search(" + engine_ind + ")");
    search.appendChild(input);
    search_select.appendChild(search);
}

function toggle_activated_search(engine_ind){
    searches[engine_ind].activated = !searches[engine_ind].activated;
}

function next_page(){
    pagenumber++;
}

function prev_page(){
    pagenumber--;
}
