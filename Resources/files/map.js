var win = Ti.UI.currentWindow;
var website = "http://larryvilleku.com";
var feed = website+"/api/dev1/items.json?limit=30";
//Query limited to 20 because Titanium starts getting sluggish with more. Or it crashes on Android.
//Someday I want to add a button that allows the user to visit the next page of results...the query string in the url would be ...json?limit=20&offset=20....or i+20....something like that. I've got a crude version of this with more_button (check the EventListener), but it only gets the next 20. Any ideas?

/********************************************/
/********GLOBAL VARIABLES FOR THIS FILE******/
/********************************************/
//I tried to define all variables that showed up in more than one place.

var feed_toolbar_image_height = 35;
var feed_toolbar_image_width = 35;
var feed_toolbar_image_bottom = 2;
var title_bar_height = 40;
var feed_view_name = 'Feed';
var settings_view_width = 200;

//Get yo style on. This changes mostly things in the feed_view detail panes.
var col1 = '##FF4747'; //Red
var col2 = '#6082A6'; //Regular blue
var col3 = '#1D243B'; //Dark blue
var col4 = '#999'; // Regular grey
var col5 = '#f2f2f2'; //Light grey
var col6 = '#2A85E8'; //Light blue (for links)

//For more: https://wiki.appcelerator.org/display/guides/Custom+Fonts
var font1 = 'Lobster 1.4';
if(Ti.Platform.osname=='android') {
   font1 = 'Lobster';
} 
var font2 = 'League Gothic';
if(Ti.Platform.osname=='android') {
   font2 = 'LeagueGothic';
}
var font3 = 'Open Sans';
if(Ti.Platform.osname=='android') {
   font3 = 'OpenSans-Regular';
}  

Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

	var data = [];
	var annotations = [];
	var xhr = Ti.Network.createHTTPClient();
	xhr.timeout = 1000000;
	xhr.open("GET", feed);
	
	//When the feed loads, display load indicator so users can't navigate away before Feed is loaded...this is very important for Android, because TableViews get messed up if the feed loads after the TVs have been initialized
	var actInd = Titanium.UI.createActivityIndicator({ bottom:200, height:50, style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN, font: {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'}, color: 'black', message: 'Loading...', width: 210 });
	actInd.show();
	
	//Timeout only important on Android. Titanium showed iOS some favoritism (again) and the Indicator disappears after the feed is loaded automatically. For Android, the indicator is essentially a splash screen that disables use
	setTimeout(function() { actInd.hide(); },2000);
	win.add(actInd);
	
	//In case things go bad, just get that Indicator out of there and show a big 'ol NO MAPS FOR YOU
	xhr.onerror = function() { 
		actInd.hide();         
		var no_internet = Titanium.UI.createAlertDialog({
            title: 'No Internet Connection',
            message: 'Sorry, but you\'re not connected to the internet, and we can\'t load the map information or feed view. Please try again when a internet connection is avaiable.',
            buttonNames: ['Shucks',],
        });
        no_internet.show();
    };
    
    //And now we go to work
	xhr.onload = function() {
		try {
			var newsitems = JSON.parse(this.responseText).features;			 
			for (var i = 0; i < newsitems.length; i++){
				
				//Map Variables (feed view variables below. They start with "row.".)
				//Note this does not use every variable in the items.json result
				var raw_location = newsitems[i].geometry.coordinates;
				var clean_location = raw_location.toString();
				var location = clean_location.split(',');
				var type = newsitems[i].properties.type;
				var title = newsitems[i].properties.title;
				var created_at = newsitems[i].properties.item_date;
				var bgcolor = (i % 2) == 0 ? '#fff' : '#eee';
				var icon = newsitems[i].properties.icon;
			
				//Make a marker for the map
				//Now...a word to the wise. You must name your map icons to be identical to the slug of whatever schema it relates to. Also, it's referring a backwards directory because Titanium optimizes for Android/iPhone when you set up a recursive directory call. Least I think so. Someone correct me if I'm wrong.
				var mrker = Titanium.Map.createAnnotation({
					latitude:location[1],
					longitude:location[0],
					title:title,
					image:'../images/'+type+'.png',
					animate:true,
				});
				//Let the map know wassup
				annotations.push(mrker);      
				
				//Begin with the Feed View by making a TableView
				var row = Ti.UI.createTableViewRow({hasChild:true,height:'auto',backgroundColor:bgcolor});

				// Hold the info for each newsitem
				var newsitem_view = Ti.UI.createView({
					height:'auto',
					layout:'vertical',
					left:5,
					top:5,
					bottom:5,
					right:5
				});

				//Map icon of schema (type)
				var map_icon_view = Ti.UI.createImageView({
					image:icon,
					left:0,
					top:0,
					height:48,
					width:48
				});
				newsitem_view.add(map_icon_view);

				//Newsitem Type
				var newsitem_type = Ti.UI.createLabel({
					text:type.toUpperCase(),
					left:54,
					width:120,
					top:-48,
					bottom:2,
					height:16,
					textAlign:'left',
					color:'#444444',
					font:{fontFamily:font2,fontSize:14,fontWeight:'bold'}
				});
				newsitem_view.add(newsitem_type);

				//Created at info
				var created_at_label = Ti.UI.createLabel({
					text:created_at,
					right:0,
					top:-18,
					bottom:2,
					height:14,
					textAlign:'right',
					width:110,
					color:'#444444',
					font:{fontFamily:font2,fontSize:12}
				});
				newsitem_view.add(created_at_label);

				//Newsitem Title info
				var newsitem_title = Ti.UI.createLabel({
					text:title,
					left:54,
					top:0,
					bottom:2,
					height:'auto',
					width:236,
					textAlign:'left',
					font:{fontSize:14}
				});
				newsitem_view.add(newsitem_title);
				
				//And put it all together...
				row.add(newsitem_view);
				row.className = 'item'+i;
				data[i] = row;
				
/******* FEED VIEW VARIABLES FOR DETAIL VIEW *********/

				//row.description would follow the format, but Description is actually an attribute for TableRow defaults. So content it is.
				row.content = newsitems[i].properties.description;
				row.color = newsitems[i].properties.color;
				row.type = type;
				row.url = newsitems[i].properties.description;
				row.icon = icon;
				//row.title would follow the format, but Title is actually an attribute for this and that. So heading it is.
				row.heading = title;
				row.created_at = created_at;
				row.news_id = newsitems[i].properties.id;
			}
			//End feed data, things generated by said feed
				
/**************HEADING BAR ************************/
		
			var heading_bar = Titanium.UI.createView({
				top:0,
				height:title_bar_height,
				backgroundColor:col3,
			});
			
			var settings_button = Titanium.UI.createButton({
				left:10,
				image:'../images/close_x.png',
				top:5,
				height:30,
				width:30
            });
           	
           	//heading_text.text will be overwritten periodically....
			var heading_text = Titanium.UI.createLabel({
				shadowColor: '#ccc',
				shadowOffset: {x: 0, y: 1},
				color:'#ffffff',
				height:title_bar_height,
				text:'Map',
				textAlign:'center',
				width:'100%',
				font:{
					fontFamily:font1,
					fontSize:30,
				}
			});
			
			var settings_title = Titanium.UI.createLabel({
				shadowColor: '#ccc',
				shadowOffset: {x: 0, y: 1},
				color:'#ffffff',
				height:title_bar_height,
				text:'Navigate',
				textAlign:'center',
				width:settings_view_width,
				top:2,
				font:{
					fontFamily:font1,
					fontSize:30,
				}
			});
            
            var settings_close = Titanium.UI.createImageView({
				image:'../images/close_x.png',
				right:5,
				top:2,
				height:28,
				width:28
            });
			
			//Settings button function        	
            settings_button.addEventListener('click',function() {
           		if(settings_view.left === '0') {
           			overlay.animate({opacity:0,duration:300});
           			settings_view.animate({left:'-'+settings_view_width,duration:300});
           		} else {
           			overlay.animate({opacity:0.6,duration:300});
           			settings_view.animate({left:0,duration:300});
           		}
           	});
           	
           	settings_close.addEventListener('click',function() {
           		overlay.animate({opacity:0,delay:100,duration:300});
           		settings_view.animate({left:'-'+settings_view_width,duration:300});
           	});
           	
			var settings_view = Titanium.UI.createView({ 
				backgroundColor:col3,
				width:settings_view_width,
				left: '-'+settings_view_width,
				height: '100%',
			});
			
			var overlay = Titanium.UI.createView({
				backgroundColor: 'black',
				width:'100%',
				opacity:0,
			});
			
			//LEARN http://cssgallery.info/custom-row-for-tableview-in-appcelerator-titanium/
			
			var settingsData = [
				{ heading:'MAP', event:'map', hasChild:true, newwin:false, winurl:'none'  },
				{ heading:'FEED', event:'map', hasChild:true, newwin:false, winurl:'none' },
				{ heading:'REFRESH', event:'map', hasChild:true, newwin:false, winurl:'none' },
				{ heading:'SUBMIT', event:'map', hasChild:true, newwin:true, winurl:'submit.js' },
				{ heading:'HELP', event:'map', hasChild:true, newwin:true, winurl:'help.js' },
				{ heading:'INFO', event:'map', hasChild:true, newwin:true, winurl:'info.js' },
			];
			settings = [];
			
			for (var c = 0; c < settingsData.length; c++) {
				var settingsRow = Titanium.UI.createTableViewRow();
				var settingsHeading =  Titanium.UI.createLabel({
					text:settingsData[c].heading,
					font:{
						fontFamily:font2,
						fontSize:28,
					},
					width:'auto',
					left:5,
					textAlign:'left',
				});
 
				settingsRow.add(settingsHeading);
				settingsRow.hasChild=settingsData[c].hasChild;
 				
 				settingsRow.color = 'black';
				settingsRow.className = 'settingsRow';
 				settingsRow.newwin = settingsData[c].newwin;				
 				settingsRow.winurl = settingsData[c].winurl;
 				settingsRow.heading = settingsData[c].heading;				

				settings.push(settingsRow);
			};
			
			var settingsTable = Titanium.UI.createTableView({
				width:200,
				data:settings,
				minRowHeight:58,
				color:col1,
				rowBackgroundColor:'white',
				backgroundColor:'white',
				top:title_bar_height,
			});
			
			settingsTable.addEventListener('click', function(e) {
				overlay.animate({opacity:0,duration:300});
           		settings_view.animate({left:'-'+settings_view_width,duration:300});
				if ((e.rowData.newwin) === 'true') {
					var createWin = Titanium.UI.createWindow({
						url:e.rowData.winurl,
					});
					createWin.open();
				}
				if ((e.rowData.heading) === 'REFRESH') {
					actInd.show();
						setTimeout(function() {
							actInd.hide();
						},1000);
                	xhr.open("GET",feed);
 					xhr.send();
				}
				if ((e.rowData.heading) === 'MAP') {
  					feed_view.visible = false;
   					heading_text.text = 'Map';
   				}
   				if ((e.rowData.heading) === 'FEED') {
   					feed_view.visible = true;
  					heading_text.text = feed_view_name;
  				}
			});
			
			settings_view.add(settings_title);
			settings_view.add(settings_close);
			settings_view.add(settingsTable);
			
			heading_bar.add(settings_button);
			heading_bar.add(heading_text);
			win.add(heading_bar);
			
			//Make the map
			var mapview = Titanium.Map.createView({
				mapType: Titanium.Map.STANDARD_TYPE,
				animate:true,
				region: {latitude:38.9622547128423, longitude:-95.24254439999999, latitudeDelta:0.02, longitudeDelta:0.02},
				regionFit:true,
				userLocation:true,
				visible: true,
				top:title_bar_height,
				annotations:annotations,
				zoom:20,
			});
			Titanium.Geolocation.distanceFilter = 10;

			//Add dat map to the screen
			win.add(mapview);							
			Titanium.Geolocation.distanceFilter = 10;

			var feed_rows = Titanium.UI.createTableView({
				data:data,
				minRowHeight:58,
			});
			
/**********NEWSITEM MORE DETAIL VIEW*********/

			feed_rows.addEventListener('click',function(e) {
				var content_view = Titanium.UI.createView({ 
					backgroundColor:'white',
					right: -500,
					width: '100%',
					top:title_bar_height,
				});
            	//Titanium.App.Analytics.trackPageview('/mobile-app/' + e.row.type + '/detail/' + e.row.news_id);
            	//And now, for a big 'ol cluster. CSS styles defined in the head. It's a WebView because you gotta make that HTML pretty somehow, and a Text
            	var actual_content = Ti.UI.createWebView({
            		html:'<html><head><style type="text/css"> img {width:100%;height:auto} body {font-family:Helvetica,Arial,sans-serif;width:85%;margin-left:7%;}h3 {color:#4bb392;} a {text-decoration:none;}</style></head><body><a href="'+website+'/'+e.row.type+'/detail/'+e.row.news_id+'"><h3>' + e.row.heading + '</h3></a>' + e.row.content + '</body></html>'
            	});
            	
				heading_text.text = 'Details';
            	
            	var close_content = Titanium.UI.createImageView({
					image:'../images/close_x.png',
					right:5,
					top:2,
					height:28,
					width:28
            	});
            	
            	close_content.addEventListener('click',function() {
            		content_view.animate({right:-500,duration:500});
            		heading_text.text = feed_view_name
            	});

            	
            	//Put it all together
            	content_view.add(actual_content);
            	content_view.animate({right:0,duration:500});
				win.add(content_view);
				win.add(close_content);
       		});
       		
       		//The feed view holds the items from the JSON query we made early, but it displays it as a list and not as a series of map points. It's a view because working with Titanium windows confuse me and Views are more easily animated.
        	var feed_view = Titanium.UI.createView({
        		top:title_bar_height, 
				opacity:1,
				visible:false,
			});
			feed_view.add(feed_rows);

			//Alllllllll doooonnnneee
			win.add(feed_view);
			win.add(overlay);
			win.add(settings_view);
       		
   			function getLocation(){
				Titanium.Geolocation.getCurrentPosition(function(e){
        			var region={
						latitude: e.coords.latitude,
						longitude: e.coords.longitude,
						animate:true,
						latitudeDelta:0.02,
						longitudeDelta:0.02
					};
					mapview.setLocation(region);
				});
			}
 			Titanium.Geolocation.addEventListener('location',function(){
    			getLocation();
			}); 
		}
		catch(E){
			alert(E);
		}
	};
	xhr.send();